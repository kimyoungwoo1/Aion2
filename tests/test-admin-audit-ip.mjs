import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readClientIp, withAudit } from '../src/audit-log.js';
import { handleAdminApi } from '../src/admin-api.js';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const testReq = (ip, forwarded) => new Request('https://example.test/', {
  headers: { ...(ip === undefined ? {} : { 'CF-Connecting-IP': ip }),
    ...(forwarded === undefined ? {} : { 'X-Forwarded-For': forwarded }) }
});
assert.equal(readClientIp(testReq('203.0.113.5')), '203.0.113.5');
assert.equal(readClientIp(testReq('2001:db8::a')), '2001:db8::a');
assert.equal(readClientIp(testReq('::ffff:203.0.113.5')), '::ffff:203.0.113.5');
assert.equal(readClientIp(testReq('999.2.3.4')), null);
assert.equal(readClientIp(testReq(undefined, '198.51.100.2')), null, 'Do not trust X-Forwarded-For');
assert.equal(readClientIp(testReq('<script>alert(1)</script>')), null);

const events = [];
let balance = { od1: 100, od2: 2000, od1_membership: 0, od1_updated_at: 1700000000 };
let session = null;
let recordedQuery = null;
const adminPassword = 'a-long-separate-admin-secret';
const db = {
  prepare(sql) {
    return { bind(...args) {
      return {
        async first() {
          if (sql.includes('FROM homework_od_balances')) return {...balance};
          if (sql.includes('FROM admin_login_throttle')) return null;
          if (sql.includes('FROM admin_sessions')) {
            return session && session.token_hash === args[0] && session.user_session_hash === args[1] && session.expires_at > args[2]
              ? {nickname:session.nickname}:null;
          }
          return null;
        },
        async all() {
          if (!sql.includes('FROM admin_audit_events')) return {results:[]};
          recordedQuery = {sql,args};
          const filtered = events.map((entry,index) => ({
            id:index+1,occurred_at:entry[0],actor_nickname:entry[1],actor_ip:entry[2],
            category:entry[3],action:entry[4],target:entry[5],summary:entry[6],
            details_json:entry[7],previous_json:entry[8],current_json:entry[9]
          }));
          return {results:filtered};
        },
        async run() {
          if (sql.includes('INSERT INTO admin_audit_events')) events.push(args);
          if (sql.includes('INSERT INTO admin_sessions'))
            session = {token_hash:args[0],user_session_hash:args[1],nickname:args[2],expires_at:args[4]};
          return {meta:{changes:1}};
        }
      };
    }};
  },
  async batch(statements) { for (const statement of statements) await statement.run(); }
};
const env = {DB:db, ACCESS_CODE:'12345', ADMIN_PASSWORD:adminPassword};
const user = {nickname:'슬롱'};
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),
  {status,headers:{'Content-Type':'application/json',...headers}});
const path = '/api/homework/od';
const mutation = new Request('https://aion2.example'+path, {
  method:'POST',headers:{'Content-Type':'application/json',
    'CF-Connecting-IP':'198.51.100.19','X-Forwarded-For':'198.51.100.99'},
  body:JSON.stringify({characterId:33,field:'od1',value:180})
});
const saved = await withAudit(mutation,env,path,async()=>{
  balance = {...balance,od1:180};return json({success:true});
},async()=>user);
assert.equal(saved.status,200);
assert.equal(events.length,1);
assert.equal(events[0][1],user.nickname);
assert.equal(events[0][2],'198.51.100.19','Store Cloudflare IP, not untrusted XFF');
assert.equal(events[0][3],'od');
assert.equal(JSON.parse(events[0][8]).od1,100);
assert.equal(JSON.parse(events[0][9]).od1,180);

const mainToken = 'a'.repeat(64);
function adminRequest(route,method='GET',data,sessionCookie='') {
  const headers = {'Content-Type':'application/json','Cookie':`aion2_session=${mainToken}${sessionCookie?'; '+sessionCookie:''}`};
  return new Request('https://aion2.example'+route,
    {method,headers,body:data===undefined?undefined:JSON.stringify(data)});
}
const unauthorized = await handleAdminApi(adminRequest('/api/admin/history'),env,
  '/api/admin/history',user,json,r=>r.json());
assert.equal(unauthorized.status,403);
const login = await handleAdminApi(adminRequest('/api/admin/login','POST',{password:adminPassword}),env,
  '/api/admin/login',user,json,r=>r.json());
assert.equal(login.status,200);
const cookie = login.headers.get('Set-Cookie').split(';')[0];
const historyPath = '/api/admin/history?ip=198.51.100.19';
const history = await handleAdminApi(adminRequest(historyPath,'GET',undefined,cookie),env,
  '/api/admin/history',user,json,r=>r.json());
assert.equal(history.status,200);
const result = await history.json();
assert.equal(result.events[0].ip,'198.51.100.19');
assert.match(recordedQuery.sql,/actor_ip LIKE/);
assert.equal(recordedQuery.args[0],'%198.51.100.19%');
const wildcardHistory = await handleAdminApi(adminRequest('/api/admin/history?ip=%25_','GET',undefined,cookie),env,
  '/api/admin/history',user,json,r=>r.json());
assert.equal(wildcardHistory.status,200);
assert.equal(recordedQuery.args[0],'%\\%\\_%','LIKE wildcard characters must be escaped');
console.log('PASS: Cloudflare IPv4/IPv6 extraction, reject spoofable XFF, admin-only IP audit, history and IP filter.');
