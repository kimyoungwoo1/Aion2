import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const db=new DatabaseSync(':memory:');
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE characters(id INTEGER PRIMARY KEY,owner_name TEXT,character_name TEXT,server_id INTEGER,class_name TEXT,item_level INTEGER,naddol_k REAL);
  CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
  CREATE TABLE homework_progress(week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER,updated_at INTEGER,PRIMARY KEY(week_start,character_id,task_key));
  CREATE TABLE sanctuary_shared_availability(week_start TEXT);
  CREATE TABLE sanctuary_schedules(week_start TEXT);
  INSERT INTO characters VALUES(1,'슬롱','슬롱','2003','검성',6700,1000);
  INSERT INTO characters VALUES(2,'슬롱','슬링','2003','살성',5000,500);
  INSERT INTO characters VALUES(3,'MID','MID','2003','궁성',4000,400);
  INSERT INTO homework_progress VALUES ('9999-12-31',1,'awakening',1,1000);
`);
db.exec(readFileSync(new URL('../migrations/0013_homework_od_amounts.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0014_homework_character_order.sql',import.meta.url),'utf8'));
const token='b'.repeat(64);
const hash=createHash('sha256').update(token).digest('hex');
db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,'슬롱',Math.floor(Date.now()/1000)+5000);
class Stmt{
  constructor(sql){this.sql=sql;this.params=[];}
  bind(...args){this.params=args;return this;}
  async first(){return db.prepare(this.sql).get(...this.params)||null;}
  async all(){return {results:db.prepare(this.sql).all(...this.params)};}
  async run(){const r=db.prepare(this.sql).run(...this.params);return {meta:{changes:r.changes}};}
}
const env={DB:{prepare:sql=>new Stmt(sql), async batch(stmts){db.exec('BEGIN');try{const r=[];for(const stmt of stmts)r.push(await stmt.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}}};
const origin='https://aion2.ksmsy1.workers.dev';
async function hit(path,payload){
  const r=await worker.fetch(new Request(origin+path,{
    method:payload?'POST':'GET',headers:{Cookie:`aion2_session=${token}`,...(payload?{Origin:origin,'Content-Type':'application/json'}:{})},
    ...(payload?{body:JSON.stringify(payload)}:{})
  }),env);
  return {status:r.status,body:await r.json()};
}
const weekInitial=(await hit('/api/homework')).body;
assert.equal(weekInitial.characters.length,2);
assert.equal(weekInitial.characters[0].od1,null);
assert.equal(weekInitial.characters[0].od2,null);
async function save(characterId,field,value){return hit('/api/homework/od',{characterId,field,value});}
assert.equal((await save(1,'od1',30)).status,200);
assert.equal((await save(1,'od2',2875)).body.odTotal,2905);
assert.equal((await save(2,'od1',840)).status,200);
let data=(await hit('/api/homework')).body;
assert.equal(data.characters.find(c=>c.id===1).od1,30);
assert.equal(data.characters.find(c=>c.id===1).od2,2875);
assert.equal(data.characters.find(c=>c.id===2).od1,840);
assert.equal(data.characters.find(c=>c.id===2).od2,null);
assert.equal((await save(1,'od1',null)).body.odTotal,2875);
assert.equal((await save(3,'od1',5)).status,403);
assert.equal((await save(1,'od3',3)).status,400);
assert.equal((await save(1,'od2',-1)).status,400);
assert.equal((await save(1,'od2',1.3)).status,400);
assert.equal((await save(1,'od2',1e12)).status,400);
// Previous week is discarded; current week is retained.
db.prepare('INSERT INTO homework_od_amounts VALUES(?,?,?,?,?)').run('2000-01-05',1,10,20,5);
assert.equal((await hit('/api/homework')).status,200);
assert.equal(db.prepare('SELECT count(*) AS n FROM homework_od_amounts WHERE week_start=?').get('2000-01-05').n,0);
assert.equal(db.prepare('SELECT count(*) AS n FROM homework_progress WHERE week_start=?').get('9999-12-31').n,1);
assert.equal(db.prepare('SELECT count(*) AS n FROM homework_od_amounts').get().n,2);
// DB unique key enforces character+week independence; no existing character overwritten.
assert.equal(db.prepare('SELECT od1 FROM homework_od_amounts WHERE character_id=?').get(2).od1,840);
const ui=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
assert.match(ui,/rosterOwnerSelect/);
assert.match(ui,/rosterCharacterSelect/);
assert.match(ui,/rosterEditorCharacterId = member\.character_id/);
assert.match(ui,/\/api\/homework\/od/);
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
assert.match(html,/<th[^>]*>오드1<br>/);
assert.match(html,/<th[^>]*>오드2<br>/);
assert.match(html,/<th>오드합<\/th>/);
console.log('PASS: od1+od2 total, partial/empty values, per-character/weekly persistence, other-owner/invalid rejection, previous-week cleanup, dropdown UI and table headers');
