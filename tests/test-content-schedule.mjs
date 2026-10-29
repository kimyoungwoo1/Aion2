import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/index.js','utf8');
const html = fs.readFileSync('public/index.html','utf8');
const css = fs.readFileSync('public/content-schedule.css','utf8');
const front = fs.readFileSync('public/content-schedule-manage.js','utf8');
const migration = fs.readFileSync('migrations/0020_content_schedule_server_matches.sql','utf8');
assert.match(source,/AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1/);
assert.match(html,/id="csServerDetails"/);
assert.match(html,/id="csMatchEditor" hidden/);
assert.match(css,/max-width: 1250px/);
assert.match(front,/csSaveMatches/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS content_schedule_server_matches/);
assert.match(html,/오드구매&제작/);

const start = source.indexOf("  if (path === '/api/content-schedule/matches') {");
const end = source.indexOf("  if (path.startsWith('/api/homework'))",start);
assert.ok(start>=0 && end>start,'API handler extract');
const code = source.slice(start,end);
const handler = new Function('request','env','path','method','user','readJson','validLabel','json',
  `return (async () => { ${code} return null; })()`);
const json=(value,status=200)=>({body:value,status});
let record=null;
const env = {DB:{prepare(sql) {
  let args=[];
  return {
    bind(...a){args=a; return this;},
    async first(){return record;},
    async run(){
      if (!record) {
        record={payload_json:args[0],updated_by:args[1],updated_at:args[2],revision:1};
        return {meta:{changes:1}};
      }
      if (record.revision !== args[3]) return {meta:{changes:0}};
      record={payload_json:args[0],updated_by:args[1],updated_at:args[2],revision:record.revision+1};
      return {meta:{changes:1}};
    }
  };
}}};
const validLabel=(text,max)=>typeof text==='string' && text.trim().length>0 && text.trim().length<=max && !/[\x00-\x1f]/.test(text);
const execute=(method,body)=>handler({body},env,'/api/content-schedule/matches',method,{nickname:'슬롱'},
  async req=>req.body, validLabel,json);
const rows=Array.from({length:21},(_,i)=>({number:i+1,group:(i%3)+1,west:'서부'+(i+1),east:'동부'+(i+1)}));
let response=await execute('GET');
assert.equal(response.status,200); assert.equal(response.body.revision,0);
response=await execute('POST',{startDate:'2026-10-21',endDate:'2026-11-11',rows,revision:0});
assert.equal(response.status,200); assert.equal(response.body.revision,1);
response=await execute('GET');
assert.equal(response.body.config.rows.length,21);
response=await execute('POST',{startDate:'2026-10-21',endDate:'2026-11-11',rows,revision:0});
assert.equal(response.status,409,'stale revision rejected');
response=await execute('POST',{startDate:'2026-13-21',endDate:'2026-11-11',rows,revision:1});
assert.equal(response.status,400,'invalid dates rejected');
response=await execute('POST',{startDate:'2026-11-01',endDate:'2026-11-14',rows:rows.slice(1),revision:1});
assert.equal(response.status,400,'not 21 rows rejected');
response=await execute('POST',{startDate:'2026-11-01',endDate:'2026-11-14',rows:rows.map(r=>r.number===1?{...r,west:'변경된서부'}:r),revision:1});
assert.equal(response.status,200); assert.equal(response.body.config.rows[0].west,'변경된서부');
console.log('PASS: compact tab, 21-row validation, D1 save, revision protection, re-read, user text preserved.');
