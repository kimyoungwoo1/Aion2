import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const db = new DatabaseSync(':memory:');
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE characters (id INTEGER PRIMARY KEY, owner_name TEXT, character_name TEXT, class_name TEXT, item_level INTEGER, naddol_k REAL, server_id INTEGER, synced_at INTEGER);
  CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,nickname TEXT,expires_at INTEGER);
  CREATE TABLE sanctuary_members (sanctuary TEXT,nickname TEXT COLLATE NOCASE,PRIMARY KEY(sanctuary,nickname));
  CREATE TABLE sanctuary_member_characters(sanctuary TEXT,nickname TEXT COLLATE NOCASE,character_id INTEGER,updated_by TEXT,updated_at INTEGER,PRIMARY KEY(sanctuary,nickname));
  CREATE TABLE sanctuary_party_slots(sanctuary TEXT,nickname TEXT COLLATE NOCASE,party_number INTEGER,slot_number INTEGER,updated_by TEXT,updated_at INTEGER,PRIMARY KEY(sanctuary,nickname));
  CREATE TABLE sanctuary_member_markers(sanctuary TEXT,nickname TEXT COLLATE NOCASE,marker TEXT,updated_by TEXT,updated_at INTEGER,PRIMARY KEY(sanctuary,nickname));
  CREATE TABLE sanctuary_character_notes(sanctuary TEXT,character_id INTEGER,note TEXT,updated_by TEXT,updated_at INTEGER,PRIMARY KEY(sanctuary,character_id));
  INSERT INTO characters VALUES(1,'니코틴','니코틴','검성',6444,800,2003,42);
  INSERT INTO characters VALUES(2,'니코틴','코틴','살성',6333,700,2003,44);
  INSERT INTO characters VALUES(3,'다른사람','다른캐릭터','호법성',6500,900,2003,46);
  INSERT INTO sanctuary_members VALUES('4','니코틴'),('4','다른사람'),('3','니코틴');
  INSERT INTO sanctuary_member_characters VALUES('4','니코틴',1,'system',100);
  INSERT INTO sanctuary_party_slots VALUES('4','니코틴',1,1,'system',100);
  INSERT INTO sanctuary_member_markers VALUES('4','니코틴','star','system',100);
  INSERT INTO sanctuary_character_notes VALUES('4',1,'첫캐릭터','system',100);
`);
db.exec(readFileSync(new URL('../migrations/0012_independent_character_party_slots.sql', import.meta.url), 'utf8'));

const token='a'.repeat(64);
const hash=createHash('sha256').update(token).digest('hex');
db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash,'니코틴', Math.floor(Date.now()/1000)+1000);

class Stmt {
  constructor(sql){this.sql=sql; this.params=[];}
  bind(...args){this.params=args;return this;}
  async first(){return db.prepare(this.sql).get(...this.params) || null;}
  async all(){return {results:db.prepare(this.sql).all(...this.params)};}
  async run(){const result=db.prepare(this.sql).run(...this.params);return {meta:{changes:result.changes,last_row_id:Number(result.lastInsertRowid)}};}
}
const mockD1={
  prepare(sql){return new Stmt(sql);},
  async batch(statements){
    db.exec('BEGIN');
    try {
      const outputs=[];
      for(const s of statements)outputs.push(await s.run());
      db.exec('COMMIT');
      return outputs;
    } catch(error){db.exec('ROLLBACK');throw error;}
  }
};
const env={DB:mockD1};
const origin='https://aion2.ksmsy1.workers.dev';
async function hit(path, payload){
  const request=new Request(origin+path,{
    method:payload ? 'POST' : 'GET',
    headers:{Cookie:`aion2_session=${token}`,...(payload?{Origin:origin,'Content-Type':'application/json'}:{})},
    ...(payload?{body:JSON.stringify(payload)}:{})
  });
  const response=await worker.fetch(request,env);
  return {status:response.status,body:await response.json()};
}
async function assign(characterId,party,slot,marker,note,sanctuary='4'){
  return hit('/api/sanctuary/roster/assignment',{
    sanctuary,nickname:'니코틴',characterId,partyNumber:party,slotNumber:slot,marker,note
  });
}
assert.equal((await hit('/api/sanctuary/roster?sanctuary=4')).body.members.length,3);
assert.equal((await assign(2,3,2,'skull','두번째 캐릭터')).status,200);
let rows=(await hit('/api/sanctuary/roster?sanctuary=4')).body.members;
let first=rows.find(x=>x.character_id===1);
let second=rows.find(x=>x.character_id===2);
assert.equal(first.party_number,1);
assert.equal(first.member_marker,'star');
assert.equal(first.character_note,'첫캐릭터');
assert.equal(second.party_number,3);
assert.equal(second.member_marker,'skull');
assert.equal(second.character_note,'두번째 캐릭터');
assert.equal((await assign(2,4,5,'1','바뀐 비고')).status,200);
assert.equal((await assign(1,4,5,'star','첫캐릭터')).status,409);
assert.equal((await assign(3,5,1,'','다른 캐릭터')).status,403);
assert.equal((await assign(2,1,1,'','충돌')).status,409);
assert.equal((await hit('/api/sanctuary/roster/character',{sanctuary:'4',nickname:'니코틴',characterId:2})).status,410);
assert.equal((await assign(1,1,1,'moon','성역 3', '3')).status,200);
assert.equal((await assign(2,null,null,'1','해제 후 비고 유지')).status,200);
rows=(await hit('/api/sanctuary/roster?sanctuary=4')).body.members;
first=rows.find(x=>x.character_id===1);
second=rows.find(x=>x.character_id===2);
assert.equal(first.party_number,1);
assert.equal(first.member_marker,'star');
assert.equal(second.party_number,null);
assert.equal(second.member_marker,'1');
assert.equal(second.character_note,'해제 후 비고 유지');
const otherSanctuary=(await hit('/api/sanctuary/roster?sanctuary=3')).body.members;
assert.equal(otherSanctuary.find(x=>x.character_id===1).member_marker,'moon');
assert.equal((await hit('/api/sanctuary/roster/assignment',{sanctuary:'4',nickname:'니코틴',characterId:1,partyNumber:1,slotNumber:1,marker:'star'})).status,400);
console.log('PASS: real Worker route keeps same-owner characters independent; legacy migration, spoof/slot rejection, marker/note, sanctuary separation, no silent overwrite');
