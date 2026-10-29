import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
const db=new DatabaseSync(':memory:');
db.exec(`
 PRAGMA foreign_keys=ON;
 CREATE TABLE characters (id INTEGER PRIMARY KEY, owner_name TEXT, character_name TEXT,server_id INTEGER,class_name TEXT,item_level INTEGER,naddol_k REAL);
 CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
 CREATE TABLE homework_progress (week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER,updated_at INTEGER,PRIMARY KEY(week_start,character_id,task_key));
 CREATE TABLE sanctuary_shared_availability (week_start TEXT);
 CREATE TABLE sanctuary_schedules (week_start TEXT);
 INSERT INTO characters VALUES (1,'슬롱','슬롱',2003,'검성',6300,1046.5);
 INSERT INTO characters VALUES (2,'슬롱','슬론',2003,'마도성',5200,523.8);
 INSERT INTO characters VALUES (3,'슬롱','슬링',2003,'정령성',5400,550);
 INSERT INTO characters VALUES (4,'MID','MID',2003,'검성',6200,816.6);
`);
db.exec(readFileSync(new URL('../migrations/0013_homework_od_amounts.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0014_homework_character_order.sql',import.meta.url),'utf8'));
const tokens={슬롱:'a'.repeat(64), MID:'b'.repeat(64)};
for(const [nick,token] of Object.entries(tokens)) {
 db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'), nick, Math.floor(Date.now()/1000)+10000);
}
class Stmt {
 constructor(sql){this.sql=sql;this.params=[]}
 bind(...args){this.params=args;return this}
 async first(){return db.prepare(this.sql).get(...this.params)||null}
 async all(){return {results:db.prepare(this.sql).all(...this.params)}}
 async run(){const r=db.prepare(this.sql).run(...this.params);return {meta:{changes:r.changes}}}
}
const env={DB:{prepare:sql=>new Stmt(sql),async batch(stmts){db.exec('BEGIN');try{const out=[];for(const stmt of stmts) out.push(await stmt.run());db.exec('COMMIT');return out}catch(e){db.exec('ROLLBACK');throw e}}}};
const origin='https://aion2.ksmsy1.workers.dev';
async function hit(nick,path,body) {
 const r=await worker.fetch(new Request(origin+path,{
  method:body?'POST':'GET',
  headers:{Cookie:`aion2_session=${tokens[nick]}`,...(body?{Origin:origin,'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 }),env);
 return {status:r.status,body:await r.json()};
}
// Server defaults to no explicit order; front end sorts by naddolK.
let get=(await hit('슬롱','/api/homework')).body;
assert.equal(get.characters.length,3);
assert.deepEqual(get.order,[]);
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const functionText=app.slice(app.indexOf('function orderHomeworkCharacters('),app.indexOf('\nasync function saveHomeworkCharacterOrder('));
const sort=Function(`${functionText}\nreturn orderHomeworkCharacters;`)();
assert.deepEqual(sort(get.characters,get.order).map(x=>x.name),['슬롱','슬링','슬론']);
// Save manual order and confirm after GET, regardless of power.
assert.equal((await hit('슬롱','/api/homework/order',{characterIds:[2,1,3]})).status,200);
get=(await hit('슬롱','/api/homework')).body;
assert.deepEqual(get.order,[2,1,3]);
assert.deepEqual(sort(get.characters,get.order).map(x=>x.name),['슬론','슬롱','슬링']);
// Same nickname only: owner cannot reorder characters owned by another nickname.
assert.equal((await hit('슬롱','/api/homework/order',{characterIds:[2,1,4]})).status,403);
assert.equal((await hit('슬롱','/api/homework/order',{characterIds:[2,1]})).status,403);
assert.equal((await hit('슬롱','/api/homework/order',{characterIds:[2,1,1]})).status,400);
assert.equal((await hit('슬롱','/api/homework/order',{characterIds:[2,3,1.3]})).status,400);
assert.equal((await hit('MID','/api/homework')).body.order.length,0);
assert.equal((await hit('MID','/api/homework/order',{characterIds:[4]})).status,200);
assert.deepEqual((await hit('슬롱','/api/homework')).body.order,[2,1,3]);
// Weekly reset must never delete preference; only homework/od are deleted.
const clock=Date.now();
await worker.scheduled({scheduledTime:clock},env);
assert.deepEqual((await hit('슬롱','/api/homework')).body.order,[2,1,3]);
assert.equal(db.prepare('SELECT COUNT(*) n FROM homework_character_order').get().n,2);
// New character after manual sort: placed at end; removed character ignored.
db.prepare('INSERT INTO characters VALUES(5,?,?,?,?,?,?)').run('슬롱','새캐릭',2003,'검성',7100,2000);
get=(await hit('슬롱','/api/homework')).body;
assert.deepEqual(sort(get.characters,get.order).map(x=>x.name),['슬론','슬롱','슬링','새캐릭']);
db.prepare('DELETE FROM characters WHERE id=1').run();
get=(await hit('슬롱','/api/homework')).body;
assert.deepEqual(sort(get.characters,get.order).map(x=>x.name),['슬론','슬링','새캐릭']);
assert.match(app,/hw-drag-handle/);
assert.match(app,/saveHomeworkCharacterOrder/);
assert.match(app,/dragstart/);
assert.match(app,/ArrowUp/);
console.log('PASS: default power DESC, manual drag order persist, weekly reset keep, per-nickname isolation, unauthorized/invalid rejection, new and deleted characters');
