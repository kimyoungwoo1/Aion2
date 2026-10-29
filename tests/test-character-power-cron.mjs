import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import worker, {refreshAllCharactersOnSchedule, POWER_REFRESH_CRON} from '../src/index.js';

const db = new DatabaseSync(':memory:');
db.exec(`
PRAGMA foreign_keys=ON;
CREATE TABLE characters (
  id INTEGER PRIMARY KEY,owner_name TEXT,character_name TEXT,server_id INTEGER,
  class_name TEXT,item_level INTEGER,naddol_k REAL,synced_at INTEGER,updated_by TEXT,updated_at INTEGER,notes TEXT
);
CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
CREATE TABLE sanctuary_shared_availability (week_start TEXT);
CREATE TABLE sanctuary_schedules (week_start TEXT);
CREATE TABLE homework_progress (week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER);
`);
db.exec(readFileSync(new URL('../migrations/0016_character_power_auto_refresh.sql', import.meta.url), 'utf8'));
for (let id=1; id<=23; id++) {
  db.prepare(`INSERT INTO characters VALUES(?,?,?,2003,'검성',1,0,1000,'작성자',333,'')`)
    .run(id, id%2?'슬롱':'MID', '캐릭터'+id);
}
const token='d'.repeat(64);
db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'), '슬롱',Math.floor(Date.now()/1000)+3600);
class Stmt {
  constructor(sql) {this.sql=sql; this.args=[];}
  bind(...args) {this.args=args;return this;}
  async first() {return db.prepare(this.sql).get(...this.args)||null;}
  async all() {return {results:db.prepare(this.sql).all(...this.args)};}
  async run() {const r=db.prepare(this.sql).run(...this.args);return {meta:{changes:r.changes,last_row_id:Number(r.lastInsertRowid)}};}
}
const env={DB:{prepare:sql=>new Stmt(sql),batch:async stmts=>{db.exec('BEGIN');try {const out=[]; for (const x of stmts)out.push(await x.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}}};
const org=globalThis.fetch;
const seen=[];
const charId=name=>Number(name.replace('캐릭터',''));
globalThis.fetch=async url=>{
  const u=new URL(url);
  if (u.pathname.includes('/search/')) {
    const name=u.searchParams.get('keyword');
    const id=charId(name);
    assert.equal(u.searchParams.get('serverId'),'2003');
    assert.equal(u.searchParams.get('race'),'2');
    seen.push('search:'+name);
    // Simulate a legitimate 404 for id 7; must never overwrite existing data.
    return new Response(JSON.stringify({list:id===7 ? [] : [{name:`<strong>${name}</strong>`,serverId:2003,race:2,characterId:encodeURIComponent('char='+id)}]}),
      {status:200,headers:{'Content-Type':'application/json'}});
  }
  assert.equal(u.pathname,'/api/character/info');
  const id=Number(u.searchParams.get('characterId').split('=')[1]);
  seen.push('info:'+id);
  return new Response(JSON.stringify({profile:{characterName:'캐릭터'+id, serverId:2003,raceId:2,className:id%2?'호법성':'검성',combatPower: id*1000+500},stat:{statList:[{type:'ItemLevel',value:5000+id}]}}),
    {status:200,headers:{'Content-Type':'application/json'}});
};
try {
  const night=Date.parse('2026-10-29T09:00:00.000Z'); // Korea 18:00
  assert.equal(POWER_REFRESH_CRON,'*/5 9,21 * * *');
  assert.deepEqual(await refreshAllCharactersOnSchedule(env,Date.parse('2026-10-29T15:00:00.000Z')),{skipped:true});
  let stats=await refreshAllCharactersOnSchedule(env,night);
  assert.equal(stats.status,'running');
  assert.equal(stats.success,17);
  assert.equal(stats.failed,1);
  assert.equal(seen.filter(v=>v.startsWith('search:')).length,18);
  assert.equal(db.prepare('SELECT item_level FROM characters WHERE id=19').get().item_level,1);
  const person7=db.prepare('SELECT class_name,item_level,naddol_k,synced_at,updated_by,updated_at FROM characters WHERE id=7').get();
  assert.equal(person7.class_name,'검성');assert.equal(person7.item_level,1);assert.equal(person7.naddol_k,0);
  assert.equal(person7.synced_at,1000);
  assert.equal(person7.updated_by,'작성자');
  assert.equal(person7.updated_at,333);

  const origin='https://aion2.ksmsy1.workers.dev';
  async function list(){return (await worker.fetch(new Request(origin+'/api/characters',{headers:{Cookie:'aion2_session='+token}}),env)).json();}
  let result=await list();
  assert.equal(result.bulkRefresh.last,null);
  assert.equal(result.bulkRefresh.active.success_count,17);
  assert.equal(result.bulkRefresh.active.total_count,23);

  stats=await refreshAllCharactersOnSchedule(env,night+5*60000);
  assert.equal(stats.status,'partial');
  assert.equal(stats.success,5);
  assert.equal(stats.failed,0);
  assert.equal(seen.filter(v=>v.startsWith('search:')).length,23);
  result=await list();
  assert.equal(result.bulkRefresh.active,null);
  assert.equal(result.bulkRefresh.last.total_count,23);
  assert.equal(result.bulkRefresh.last.success_count,22);
  assert.equal(result.bulkRefresh.last.failed_count,1);
  assert.equal(db.prepare('SELECT class_name,item_level,naddol_k FROM characters WHERE id=23').get().class_name,'호법성');
  assert.equal(db.prepare('SELECT item_level,naddol_k FROM characters WHERE id=23').get().item_level,5023);
  assert.equal(db.prepare('SELECT updated_by FROM characters WHERE id=23').get().updated_by,'작성자');

  const calls=seen.length;
  stats=await refreshAllCharactersOnSchedule(env,night+10*60000);
  assert.equal(stats.alreadyCompleted,true);
  assert.equal(seen.length,calls);

  // 06:00 KST = 21:00 UTC on preceding date.
  const morning=Date.parse('2026-10-29T21:00:00.000Z');
  stats=await refreshAllCharactersOnSchedule(env,morning);
  assert.equal(stats.slot,'2026-10-30-06');
  assert.equal(stats.status,'running');
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM character_power_refresh_runs').get().c,2);
  // Existing weekly and abyss reset scheduled handler remain callable.
  await worker.scheduled({cron:'0 20 * * TUE',scheduledTime:Date.parse('2026-11-03T20:00:00.000Z')},env);
  // Existing records remain after another job's cron.
  assert.equal(db.prepare('SELECT item_level FROM characters WHERE id=23').get().item_level,5023);

  // No authentication: no exposure of refresh status / roster.
  const denied=await worker.fetch(new Request(origin+'/api/characters'),env);
  assert.equal(denied.status,401);

  const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  assert.match(app,/renderBulkRefreshStatus\(\)/);
  assert.match(html,/id="characterBulkRefreshTime"/);
  assert.match(html,/characterBulkRefreshTime.*id="refresh"/);
  console.log('PASS: 06/18 KST slots, 18-character rate-limited batches, 23 characters, partial failure, D1 checkpoint, status UI, weekly resets, auth');
} finally {globalThis.fetch=org;db.close();}
