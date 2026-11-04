// End-to-end Worker + in-memory SQLite integration test. Node 22+ required.
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
const db = new DatabaseSync(':memory:');
db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE characters (id INTEGER PRIMARY KEY,owner_name TEXT,character_name TEXT,
   server_id INTEGER,class_name TEXT,item_level INTEGER,naddol_k REAL);
 CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
 CREATE TABLE homework_progress (week_start TEXT,character_id INTEGER,task_key TEXT,
   completed INTEGER,updated_at INTEGER,PRIMARY KEY(week_start,character_id,task_key));
 CREATE TABLE sanctuary_shared_availability (week_start TEXT);
 CREATE TABLE sanctuary_shared_schedule_notes (week_start TEXT);
 CREATE TABLE sanctuary_schedules (week_start TEXT);
 INSERT INTO characters VALUES(10,'ownerA','Alt One',2003,'class',5300,900);
 INSERT INTO characters VALUES(11,'ownerA','Alt Two',2003,'class',5200,800);
 INSERT INTO characters VALUES(20,'ownerB','Other',2003,'class',5100,700);`);
const src = path => readFileSync(new URL(path, import.meta.url),'utf8');
db.exec(src('../migrations/0022_admin_audit_history.sql'));
for (const name of [
 '0013_homework_od_amounts.sql','0014_homework_character_order.sql',
 '0015_homework_od_persistent.sql','0017_homework_od_recovery.sql',
 '0018_homework_od_caps_membership_default.sql','0024_homework_custom_columns.sql'
]) db.exec(src('../migrations/'+name));
const tokens={ownerA:'a'.repeat(64),ownerB:'b'.repeat(64)};
for (const [nick,token] of Object.entries(tokens)) {
 db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(
   createHash('sha256').update(token).digest('hex'),nick,
   Math.floor(Date.now()/1000)+3600);
}
class Stmt {
 constructor(sql){this.sql=sql;this.params=[];}
 bind(...args){this.params=args;return this;}
 async first(){return db.prepare(this.sql).get(...this.params)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.params)};}
 async run(){const r=db.prepare(this.sql).run(...this.params);
   return {meta:{changes:r.changes,last_row_id:Number(r.lastInsertRowid)}};}
}
const env={DB:{prepare:sql=>new Stmt(sql),async batch(statements){
 db.exec('BEGIN');try{const result=[];for(const stmt of statements)result.push(await stmt.run());
 db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}
}}};
const origin='https://aion2.ksmsy1.workers.dev';
async function call(nick,path,post) {
 const r=await worker.fetch(new Request(origin+path,{
   method:post===undefined?'GET':'POST',
   headers:{Cookie:`aion2_session=${tokens[nick]}`,
      ...(post===undefined?{}:{Origin:origin,'Content-Type':'application/json'})},
   ...(post===undefined?{}:{body:JSON.stringify(post)})
 }),env);
 return {status:r.status,body:await r.json()};
}
const defaultOrder=['abyss','awakening','rudra','invasion','muspel','deltras','trial','craft'];
let a=await call('ownerA','/api/homework');
assert.equal(a.status,200);
assert.equal(a.body.characters.length,2);
assert.deepEqual(a.body.taskOrder,defaultOrder);
assert.equal(a.body.tasks.find(t=>t.key==='craft').label,'\uC624\uB4DC\uAD6C\uB9E4&\uC81C\uC791');
const newTask=await call('ownerA','/api/homework/custom-task',{title:'Keep forever'});
assert.equal(newTask.status,200);
assert.deepEqual(newTask.body.taskOrder.slice(-2),['craft','custom:1']);
let b=await call('ownerB','/api/homework');
assert.deepEqual(b.body.customTasks,[]);
assert.deepEqual(b.body.taskOrder,defaultOrder);
assert.equal((await call('ownerB','/api/homework/custom-progress',
 {taskId:1,characterId:20,completed:true})).status,403);
assert.equal((await call('ownerA','/api/homework/custom-progress',
 {taskId:1,characterId:10,completed:true})).status,200);
a=await call('ownerA','/api/homework');
assert.deepEqual(a.body.characters.find(c=>c.id===10).customCompleted,['custom:1']);
assert.equal((await call('ownerA','/api/homework',
 {taskKey:'trial',characterId:10,completed:true})).status,200);
assert.equal((await call('ownerA','/api/homework/reset',{confirm:true})).status,200);
a=await call('ownerA','/api/homework');
assert.deepEqual(a.body.characters.find(c=>c.id===10).completed,[]);
assert.deepEqual(a.body.characters.find(c=>c.id===10).customCompleted,['custom:1']);
const order=['custom:1',...defaultOrder];
assert.equal((await call('ownerA','/api/homework/task-order',{taskKeys:order})).status,200);
a=await call('ownerA','/api/homework');
assert.deepEqual(a.body.taskOrder,order);
b=await call('ownerB','/api/homework');
assert.deepEqual(b.body.taskOrder,defaultOrder);
console.log('PASS: full Worker GET/POST, nickname isolation, custom tasks, custom progress unaffected by manual reset, task order persisted');
