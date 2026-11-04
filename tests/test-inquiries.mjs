import assert from 'node:assert/strict';
import { handleInquiriesApi } from '../src/inquiries-api.js';

const inquiries = [];
const replies = [];
let nextInquiry = 1;
let nextReply = 1;
const now = () => Math.floor(Date.now() / 1000);

const db = {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes('COUNT(*) AS total FROM aion_inquiries')) {
              return {total:inquiries.filter(x => !sql.includes('WHERE') || x.author_nickname === args[0]).length};
            }
            if (sql.includes('SELECT created_at FROM aion_inquiries')) {
              return [...inquiries].reverse().find(x => x.author_nickname === args[0]) || null;
            }
            if (sql.includes('SELECT id,author_nickname,title,content,created_at') && sql.includes('aion_inquiries')) {
              return inquiries.find(x => x.id === args[0]) || null;
            }
            if (sql.includes('SELECT id FROM aion_inquiries')) {
              const x = inquiries.find(x => x.id === args[0]);
              return x ? {id:x.id} : null;
            }
            if (sql.includes('COUNT(*) AS total FROM aion_inquiry_replies')) {
              return {total: replies.filter(x => x.inquiry_id === args[0]).length};
            }
            if (sql.includes('SELECT created_at FROM aion_inquiry_replies')) {
              return [...replies].reverse().find(x => x.author_nickname === args[0]) || null;
            }
            throw new Error('Unexpected first SQL: ' + sql);
          },
          async all() {
            if (sql.includes('FROM aion_inquiries q')) {
              const mine = sql.includes('WHERE q.author_nickname = ?');
              const params = mine ? args.slice(0,1) : [];
              const limit = args[params.length];
              const offset = args[params.length+1];
              const records = inquiries.filter(x => !mine || x.author_nickname === params[0]);
              return {results:records.slice().reverse().slice(offset,offset+limit).map(x => ({
                ...x, reply_count:replies.filter(r => r.inquiry_id === x.id).length
              }))};
            }
            if (sql.includes('FROM aion_inquiry_replies WHERE inquiry_id')) {
              return {results:replies.filter(x => x.inquiry_id === args[0]).slice(0,100)};
            }
            throw new Error('Unexpected all SQL: ' + sql);
          },
          async run() {
            if (sql.includes('INSERT INTO aion_inquiries(')) {
              const id = nextInquiry++;
              inquiries.push({id,author_nickname:args[0],title:args[1],content:args[2],created_at:args[3]});
              return {meta:{last_row_id:id,changes:1}};
            }
            if (sql.includes('INSERT INTO aion_inquiry_replies(')) {
              replies.push({id:nextReply++,inquiry_id:args[0],author_nickname:args[1],content:args[2],created_at:args[3]});
              return {meta:{changes:1}};
            }
            throw new Error('Unexpected run SQL: ' + sql);
          }
        };
      }
    };
  }
};
const response = (data,status=200) => ({status,data});
const readJson = async req => req.body;
function query(method,path,nick='슬롱',body) {
  return handleInquiriesApi({method,url:'https://aion2.test'+path,body}, {DB:db},new URL('https://aion2.test'+path).pathname,{nickname:nick},response,readJson);
}

let res = await query('GET','/api/inquiries');
assert.equal(res.status,200);
assert.equal(res.data.total,0);

res = await query('POST','/api/inquiries','슬롱',{title:'파티 질문',content:'두 번째 캐릭터도 참여할 수 있나요?'});
assert.equal(res.status,201);
const id = res.data.id;
assert.equal(inquiries[0].author_nickname,'슬롱');
res = await query('GET',`/api/inquiries/${id}`);
assert.equal(res.data.inquiry.title,'파티 질문');
assert.equal(res.data.replies.length,0);

res = await query('POST',`/api/inquiries/${id}/replies`,'MID',{content:'네, 캐릭터별로 배정하면 됩니다.'});
assert.equal(res.status,201);
res = await query('GET',`/api/inquiries/${id}`);
assert.equal(res.data.replies.length,1);
assert.equal(res.data.replies[0].author_nickname,'MID');
res = await query('GET','/api/inquiries?page=1');
assert.equal(res.data.items[0].reply_count,1);
res = await query('GET','/api/inquiries?mine=1','MID');
assert.equal(res.data.total,0);
res = await query('GET','/api/inquiries?mine=1','슬롱');
assert.equal(res.data.total,1);
res = await query('POST','/api/inquiries','슬롱',{title:'또 질문',content:'15초 안의 중복 질문'});
assert.equal(res.status,429);
res = await query('POST','/api/inquiries','MID',{title:'',content:'본문'});
assert.equal(res.status,400);
res = await query('POST','/api/inquiries','MID',{title:'제목',content:'a'.repeat(2001)});
assert.equal(res.status,400);
res = await query('POST','/api/inquiries/999/replies','MID',{content:'존재하지 않는 글'});
assert.equal(res.status,404);
res = await query('GET','/api/inquiries?page=-1');
assert.equal(res.status,400);
res = await query('POST',`/api/inquiries/${id}/replies`,'MID',{content:'너무 빠른 댓글'});
assert.equal(res.status,429);
res = await query('POST','/api/inquiries','다른 사용자',{title:'<script>alert(1)</script>',content:'화면에는 텍스트만 표시되어야 함'});
assert.equal(res.status,201);
assert.equal(inquiries.at(-1).title,'<script>alert(1)</script>');
assert.ok(now() >= inquiries.at(-1).created_at);
console.log('PASS: inquiry create/list/detail/mine filter/reply, validation, cooldown, 404 and stored text.');
