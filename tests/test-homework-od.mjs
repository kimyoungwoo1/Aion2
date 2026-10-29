import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const db = new DatabaseSync(':memory:');
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE characters(id INTEGER PRIMARY KEY,owner_name TEXT,character_name TEXT,server_id INTEGER,class_name TEXT,item_level INTEGER,naddol_k REAL);
  CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
  CREATE TABLE homework_progress(week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER,updated_at INTEGER,PRIMARY KEY(week_start,character_id,task_key));
  CREATE TABLE sanctuary_shared_availability(week_start TEXT);
  CREATE TABLE sanctuary_schedules(week_start TEXT);
  INSERT INTO characters VALUES(1,'slong','slong',2003,'class',6700,1000);
  INSERT INTO characters VALUES(2,'slong','sling',2003,'class',5000,500);
  INSERT INTO characters VALUES(3,'MID','MID',2003,'class',4000,400);
  INSERT INTO homework_progress VALUES ('9999-12-31',1,'awakening',1,1000);
`);
db.exec(readFileSync(new URL('../migrations/0013_homework_od_amounts.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0014_homework_character_order.sql',import.meta.url),'utf8'));

// Real users have existing weekly od data. The newest row must be moved into
// the permanent table without deleting the old table, and all users remain isolated.
const legacy = db.prepare('INSERT INTO homework_od_amounts(week_start,character_id,od1,od2,updated_at) VALUES(?,?,?,?,?)');
legacy.run('2026-10-15',1,10,2000,10);
legacy.run('2026-10-29',1,30,2875,20);
legacy.run('2026-10-29',2,840,null,11);
legacy.run('2026-10-29',3,7,9,12);
db.exec(readFileSync(new URL('../migrations/0015_homework_od_persistent.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0017_homework_od_recovery.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0018_homework_od_caps_membership_default.sql',import.meta.url),'utf8'));
assert.equal(db.prepare('SELECT od1 FROM homework_od_balances WHERE character_id=1').get().od1,30);
assert.equal(db.prepare('SELECT od2 FROM homework_od_balances WHERE character_id=1').get().od2,2000);
assert.equal(db.prepare('SELECT od1 FROM homework_od_balances WHERE character_id=2').get().od1,840);
assert.equal(db.prepare('SELECT od1_membership FROM homework_od_balances WHERE character_id=1').get().od1_membership,0);
assert.ok(db.prepare('SELECT od1_updated_at FROM homework_od_balances WHERE character_id=1').get().od1_updated_at > 0);
assert.equal(db.prepare('SELECT count(*) n FROM homework_od_amounts').get().n,4);

const token = 'b'.repeat(64);
const hash = createHash('sha256').update(token).digest('hex');
db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,'slong',Math.floor(Date.now()/1000)+5000);
class Stmt {
  constructor(sql){this.sql=sql;this.params=[];}
  bind(...args){this.params=args;return this;}
  async first(){return db.prepare(this.sql).get(...this.params)||null;}
  async all(){return {results:db.prepare(this.sql).all(...this.params)};}
  async run(){const r=db.prepare(this.sql).run(...this.params);return {meta:{changes:r.changes}};}
}
const env={DB:{prepare:sql=>new Stmt(sql),async batch(stmts){db.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}}};
const origin='https://aion2.ksmsy1.workers.dev';
async function hit(path,payload){
  const r=await worker.fetch(new Request(origin+path,{
    method:payload?'POST':'GET',
    headers:{Cookie:`aion2_session=${token}`,...(payload?{Origin:origin,'Content-Type':'application/json'}:{})},
    ...(payload?{body:JSON.stringify(payload)}:{})
  }),env);
  return {status:r.status,body:await r.json()};
}
async function save(characterId,field,value){return hit('/api/homework/od',{characterId,field,value});}
let get=(await hit('/api/homework')).body;
assert.equal(get.characters.length,2);
assert.equal(get.characters.find(c=>c.id===1).od1,30);
assert.equal(get.characters.find(c=>c.id===1).od2,2000);
assert.equal(get.characters.find(c=>c.id===2).od1,840);
assert.equal(get.characters.find(c=>c.id===2).od2,null);
assert.equal((await save(1,'od1',35)).body.odTotal,2035);
assert.equal((await save(1,'od2',3000)).status,400);
assert.equal((await save(1,'od2',2001)).status,400);
assert.equal((await save(1,'od2',2000)).status,200);
assert.equal((await save(1,'od1',841)).status,400);
assert.equal((await save(2,'od1',840)).status,200);
assert.equal((await save(2,'od1',900)).status,400);
assert.equal((await save(1,'od1',null)).body.odTotal,2000);
assert.equal((await save(3,'od1',100)).status,403);
assert.equal((await save(1,'od3',3)).status,400);
assert.equal((await save(1,'od2',-1)).status,400);
assert.equal((await save(1,'od2',1.3)).status,400);
assert.equal((await save(1,'od2',1e12)).status,400);
get=(await hit('/api/homework')).body;
assert.equal(get.characters.find(c=>c.id===1).od1,null);
assert.equal(get.characters.find(c=>c.id===1).od2,2000);
assert.equal(get.characters.find(c=>c.id===2).od1,840);
assert.equal(db.prepare('SELECT od1 FROM homework_od_balances WHERE character_id=3').get().od1,7);
assert.equal(db.prepare('SELECT count(*) n FROM homework_od_amounts').get().n,4);

// Simulate a weekly rollover (several weeks into future). No balance may reset.
await worker.scheduled({scheduledTime:Date.now()+21*86400*1000},env);
get=(await hit('/api/homework')).body;
assert.equal(get.characters.find(c=>c.id===1).od1,null);
assert.equal(get.characters.find(c=>c.id===1).od2,2000);
assert.equal(get.characters.find(c=>c.id===2).od1,840);
assert.equal(db.prepare('SELECT count(*) n FROM homework_od_amounts').get().n,4);
assert.equal(db.prepare('SELECT od1 FROM homework_od_balances WHERE character_id=3').get().od1,7);
assert.equal(db.prepare('SELECT count(*) n FROM homework_progress WHERE week_start=?').get('9999-12-31').n,1);

// Renaming/refreshing a character does not reset od. Deleting removes it by FK.
db.prepare('UPDATE characters SET character_name=? WHERE id=1').run('slong2');
assert.equal((await hit('/api/homework')).body.characters.find(c=>c.id===1).od2,2000);
db.prepare('DELETE FROM characters WHERE id=2').run();
assert.equal(db.prepare('SELECT count(*) n FROM homework_od_balances WHERE character_id=2').get().n,0);
const ui=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
assert.match(ui,/\/api\/homework\/od/);
assert.match(ui,/hw-od-input/);
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
assert.match(html,/<th[^>]*>\uC624\uB4DC1<br>/);
assert.match(html,/<th[^>]*>\uC624\uB4DC2<br>/);
assert.match(html, /<th[^>]*>\uBA64\uBC84\uC2ED<\/th>/);
assert.match(ui,/hw-membership-checkbox/);
assert.match(html,/<th>\uC624\uB4DC\uD569<\/th>/);
assert.match(html,/\uC624\uB4DC1\u00B7\uC624\uB4DC2 \uC218\uB7C9\uACFC \uC624\uB4DC\uD569\uC740 \uC8FC\uAC04 \uCD08\uAE30\uD654 \uC5C6\uC774/);
console.log('PASS: legacy migration, permanent od1/od2, totals, independent characters, ownership, input validation, cron reset survival, old table preserved, delete cascade, UI');
