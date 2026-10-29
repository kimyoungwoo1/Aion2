import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import worker from '../src/index.js';
import {estimatedOd1,nextOdRecoveryAt} from '../public/od-recovery.js';

const unix = iso => Math.floor(Date.parse(iso)/1000);
const t = unix('2026-10-29T06:00:00Z'); // 15:00 KST
assert.equal(nextOdRecoveryAt(t), unix('2026-10-29T08:00:00Z')); // 17:00 KST
assert.equal(estimatedOd1(300,t,1,unix('2026-10-29T07:59:59Z')),300);
assert.equal(estimatedOd1(300,t,1,unix('2026-10-29T08:00:00Z')),315);
assert.equal(estimatedOd1(300,t,0,unix('2026-10-29T08:00:00Z')),310);
assert.equal(estimatedOd1(300,t,null,unix('2026-12-01T00:00:00Z')),300);
assert.equal(estimatedOd1(null,t,1,unix('2026-11-01T08:00:00Z')),null);
assert.equal(estimatedOd1(800,t,0,unix('2026-11-01T08:00:00Z')),800);
assert.equal(estimatedOd1(550,t,0,unix('2026-10-30T08:00:00Z')),560);
assert.equal(estimatedOd1(835,t,1,unix('2026-10-30T08:00:00Z')),840);
// Manual input at 04:59 KST should earn next tick 05:00, not at 3h after the input.
assert.equal(estimatedOd1(70,unix('2026-10-28T19:59:00Z'),1,unix('2026-10-28T20:00:00Z')),85);

const db=new DatabaseSync(':memory:');
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE characters(id INTEGER PRIMARY KEY,owner_name TEXT,character_name TEXT,server_id INTEGER,
 class_name TEXT,item_level INTEGER,naddol_k REAL);
CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
CREATE TABLE sanctuary_shared_availability(week_start TEXT);
CREATE TABLE sanctuary_schedules(week_start TEXT);
CREATE TABLE homework_progress(week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER);
CREATE TABLE homework_character_order(owner_name TEXT PRIMARY KEY,character_ids TEXT,updated_at INTEGER);
CREATE TABLE homework_od_balances(character_id INTEGER PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER,od2 INTEGER,updated_at INTEGER NOT NULL);
INSERT INTO characters VALUES(1,'슬롱','슬롱',2003,'검성',6000,1050.2);
INSERT INTO characters VALUES(2,'다른사람','다른캐릭',2003,'검성',5000,500.0);
INSERT INTO homework_od_balances VALUES(1,300,200,500);
`);
db.exec(readFileSync(new URL('../migrations/0017_homework_od_recovery.sql',import.meta.url),'utf8'));
db.exec(readFileSync(new URL('../migrations/0018_homework_od_caps_membership_default.sql',import.meta.url),'utf8'));
const token='c'.repeat(64);
db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),'슬롱',unix('2027-12-01T00:00:00Z'));
class Stmt {
 constructor(sql){this.sql=sql;this.args=[];}
 bind(...args){this.args=args;return this;}
 async first(){return db.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.args)};}
 async run(){const r=db.prepare(this.sql).run(...this.args);return {meta:{changes:r.changes}};}
}
const env={DB:{prepare:sql=>new Stmt(sql),batch:async statements=>{
 db.exec('BEGIN');try{const result=[];for(const stmt of statements)result.push(await stmt.run());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}
}}};
const origin='https://aion2.ksmsy1.workers.dev';
const originalNow=Date.now;
function advance(iso){Date.now=()=>Date.parse(iso);}
async function call(path,body){
 const response=await worker.fetch(new Request(origin+path,{
  method:body===undefined?'GET':'POST',headers:{Cookie:'aion2_session='+token,...(body===undefined?{}:{'Origin':origin,'Content-Type':'application/json'})},
  ...(body===undefined?{}:{body:JSON.stringify(body)})
 }),env);
 return {status:response.status,value:await response.json()};
}
try{
 advance('2026-10-29T06:00:00Z');
 let res=await call('/api/homework');
 assert.equal(res.status,200);
 assert.equal(res.value.characters[0].od1,300); // Legacy value unchanged.
 assert.equal(res.value.characters[0].od1Membership,0);
 res=await call('/api/homework/od/membership',{characterId:1,membership:1});
 assert.equal(res.status,200);
 assert.equal(res.value.od1,300);
 assert.equal(res.value.od1UpdatedAt,t);
 assert.equal(res.value.od1Membership,1);
 advance('2026-10-29T08:01:00Z'); // recovery at KST17:00
 res=await call('/api/homework');
 assert.equal(res.value.characters[0].od1,315);
 res=await call('/api/homework/od',{characterId:1,field:'od2',value:750});
 assert.equal(res.value.od1,315);
 assert.equal(res.value.od2,750);
 assert.equal(res.value.od1UpdatedAt,t); // Od2 must not reset Od1 clock.
 res=await call('/api/homework/od/membership',{characterId:1,membership:0});
 assert.equal(res.value.od1,315);
 assert.equal(res.value.od1Base,315);
 assert.equal(res.value.od1UpdatedAt,unix('2026-10-29T08:01:00Z'));
 advance('2026-10-29T11:00:00Z'); // KST20:00
 res=await call('/api/homework');
 assert.equal(res.value.characters[0].od1,325);
 res=await call('/api/homework/od',{characterId:1,field:'od1',value:100});
 assert.equal(res.value.od1,100);
 assert.equal(res.value.od1Base,100);
 advance('2026-11-19T11:00:00Z');
 res=await call('/api/homework');
 assert.equal(res.value.characters[0].od1,560); // capped after 3 weeks
 assert.equal(res.value.characters[0].od2,750); // permanent
 res=await call('/api/homework/od',{characterId:2,field:'od1',value:250});
 assert.equal(res.status,403);
 res=await call('/api/homework/od/membership',{characterId:2,membership:1});
 assert.equal(res.status,403);
 res=await call('/api/homework/od/membership',{characterId:1,membership:null});
 assert.equal(res.status,400); // Checkbox only supports checked/unchecked.
 res=await call('/api/homework/od',{characterId:1,field:'od1',value:841});
 assert.equal(res.status,400);
 res=await call('/api/homework/od',{characterId:1,field:'od1',value:840});
 assert.equal(res.status,200); // allowed even if membership unchecked, without auto exceeding 560.
 res=await call('/api/homework/od',{characterId:1,field:'od2',value:2001});
 assert.equal(res.status,400);
 res=await call('/api/homework/od',{characterId:1,field:'od2',value:2000});
 assert.equal(res.status,200);
 advance('2026-12-15T11:00:00Z');
 res=await call('/api/homework');
 assert.equal(res.value.characters[0].od1,840); // manually supplied upper bound retained.
 assert.equal(res.value.characters[0].od2,2000);
 console.log('PASS: checkbox membership, normal/paid recovery, OD1 <=840 & OD2 <=2000 on API, weekly permanence & permissions');
}finally{Date.now=originalNow;db.close();}
