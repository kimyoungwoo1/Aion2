import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { handleAdminApi } from '../src/admin-api.js';
import { readFileSync } from 'node:fs';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const html = readFileSync(new URL('../public/admin.html', import.meta.url), 'utf8');
assert.match(html, /id="adminPassword"/);
assert.doesNotMatch(html, /id="adminPassword"[^>]*minlength="12"/);

const mainToken='a'.repeat(64);
let session=null;
const db={
  prepare(sql){return {bind(...params){return {
    async first(){
      if(sql.includes('FROM admin_login_throttle'))return null;
      if(sql.includes('FROM admin_sessions'))return session && session.token_hash===params[0] ? {nickname:session.nickname}:null;
      return null;
    },
    async run(){if(sql.includes('INSERT INTO admin_sessions'))session={token_hash:params[0],nickname:params[2]};return {meta:{changes:1}};},
    async all(){return {results:[]};}
  };}};},
  async batch(statements){for(const stmt of statements)await stmt.run();}
};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...headers}});
const request=(password)=>new Request('https://aion2.example/api/admin/login',{method:'POST',headers:{Cookie:`aion2_session=${mainToken}`,'Content-Type':'application/json'},body:JSON.stringify({password})});
const user={nickname:'슬롱'};
async function login(secret,password=secret,access='12345'){
  return handleAdminApi(request(password),{DB:db,ADMIN_PASSWORD:secret,ACCESS_CODE:access},'/api/admin/login',user,json,r=>r.json());
}
assert.equal((await login('abc1')).status,200, 'a short admin secret must work');
assert.equal((await login('abc1','nope')).status,401,'wrong secret must fail');
assert.equal((await login('')).status,503,'empty secret must fail');
assert.equal((await login('12345','12345')).status,503,'admin secret must differ from shared access code');
console.log('PASS: Short admin password accepted, wrong password rejected, empty/shared secret rejected, HTML 12-char limit removed.');
