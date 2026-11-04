import assert from 'node:assert/strict';
import { withAudit } from '../src/audit-log.js';
import { handleAdminApi } from '../src/admin-api.js';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const persisted=[];
let balance={od1:100,od2:1000,od1_membership:1,od1_updated_at:1700000000};
const user={nickname:'슬롱'};
const db={
  prepare(sql){
    return { bind(...args){
      return {
        async first(){
          if (sql.includes('FROM homework_od_balances')) return {...balance};
          return null;
        },
        async run(){ if (sql.includes('INSERT INTO admin_audit_events')) persisted.push({sql,args});return {meta:{changes:1}}; },
        async all(){return {results:[]};}
      };
    }};
  }
};
const env={DB:db};
const target='/api/homework/od';
const request=new Request(`https://aion2.example${target}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({characterId:3,field:'od1',value:250})});
const ok=await withAudit(request,env,target,async()=>{
  balance={...balance,od1:250};return new Response(JSON.stringify({success:true}),{status:200});
},async()=>user);
assert.equal(ok.status,200);
assert.equal(persisted.length,1);
const [time,actor,ip,category,action,object,summary,detail,oldValue,newValue]=persisted[0].args; // AION2_ADMIN_AUDIT_IP_V1
assert.equal(actor,'슬롱');assert.equal(ip,null);assert.equal(category,'od');assert.equal(action,'balance');
assert.equal(JSON.parse(oldValue).od1,100);assert.equal(JSON.parse(newValue).od1,250);
assert.equal(JSON.parse(detail).value,250);
await withAudit(new Request('https://aion2.example/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'SECRET'})}),env,'/api/login',async()=>new Response('{}',{status:200}),async()=>user);
assert.equal(persisted.length,1,'Login and passwords must not enter the audit log.');
await withAudit(new Request(`https://aion2.example${target}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({characterId:3,field:'od1',value:300})}),env,target,async()=>new Response('{}',{status:403}),async()=>user);
assert.equal(persisted.length,1,'Failed mutations must not be logged as successful.');

// Minimal D1 mock validating secret-backed admin session and protected audit list.
let adminRow=null, throttleRow=null;
const envAdmin={ACCESS_CODE:'12345',ADMIN_PASSWORD:'special_admin_password_2026',DB:{
  prepare(sql){return{bind(...args){return{
    async first(){
      if(sql.includes('FROM admin_login_throttle'))return throttleRow;
      if(sql.includes('FROM admin_sessions')) {
        return adminRow && adminRow.token_hash===args[0]&&adminRow.user_session_hash===args[1]&&adminRow.expires_at>args[2] ? {nickname:adminRow.nickname}:null;
      }
      return null;
    },
    async run(){
      if(sql.includes('INSERT INTO admin_login_throttle'))throttleRow={failures:args[1],locked_until:args[2],updated_at:args[3]};
      if(sql.includes('DELETE FROM admin_login_throttle'))throttleRow=null;
      if(sql.includes('INSERT INTO admin_sessions'))adminRow={token_hash:args[0],user_session_hash:args[1],nickname:args[2],expires_at:args[4]};
      if(sql.includes('DELETE FROM admin_sessions'))adminRow=null;
      return {meta:{changes:1}};
    },
    async all(){return {results:[]}}};}}},
  async batch(statements){for(const stmt of statements)await stmt.run();}
}};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...headers}});
const readJson=(r)=>r.json();
const mainToken='a'.repeat(64);
function req(path,method='GET',body,cookie=`aion2_session=${mainToken}`){return new Request('https://aion2.example'+path,{method,headers:{'Content-Type':'application/json','Cookie':cookie},body:body===undefined?undefined:JSON.stringify(body)});}
let denied=await handleAdminApi(req('/api/admin/history'),envAdmin,'/api/admin/history',user,json,readJson);
assert.equal(denied.status,403,'History must require an admin session.');
let wrong=await handleAdminApi(req('/api/admin/login','POST',{password:'wrong'}),envAdmin,'/api/admin/login',user,json,readJson);
assert.equal(wrong.status,401);
let login=await handleAdminApi(req('/api/admin/login','POST',{password:envAdmin.ADMIN_PASSWORD}),envAdmin,'/api/admin/login',user,json,readJson);
assert.equal(login.status,200);
const adminCookie=login.headers.get('Set-Cookie')?.split(';')[0];
assert.match(adminCookie,/^aion2_admin=[0-9a-f]{64}$/);
let status=await handleAdminApi(req('/api/admin/status','GET',undefined,`aion2_session=${mainToken}; ${adminCookie}`),envAdmin,'/api/admin/status',user,json,readJson);
assert.equal((await status.json()).authorized,true);
let history=await handleAdminApi(req('/api/admin/history','GET',undefined,`aion2_session=${mainToken}; ${adminCookie}`),envAdmin,'/api/admin/history',user,json,readJson);
assert.equal(history.status,200);
let otherSession=await handleAdminApi(req('/api/admin/history','GET',undefined,`aion2_session=${'b'.repeat(64)}; ${adminCookie}`),envAdmin,'/api/admin/history',user,json,readJson);
assert.equal(otherSession.status,403,'Admin access must be bound to the original main session.');
let logout=await handleAdminApi(req('/api/admin/logout','POST',{},`aion2_session=${mainToken}; ${adminCookie}`),envAdmin,'/api/admin/logout',user,json,readJson);
assert.equal(logout.status,200);
let afterLogout=await handleAdminApi(req('/api/admin/history','GET',undefined,`aion2_session=${mainToken}; ${adminCookie}`),envAdmin,'/api/admin/history',user,json,readJson);
assert.equal(afterLogout.status,403);
console.log('PASS: mutation audit, before/after snapshots, no credential logging, admin secret, per-session access and logout.');
