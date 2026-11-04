import assert from 'node:assert/strict';
import {customHomeworkApi,getCustomHomeworkData} from '../src/homework-custom-api.js';

class MockD1 {
  constructor() {
    this.tasks=[]; this.orders=new Map(); this.done=new Set(); this.nextId=1;
    this.chars=[{id:10,owner_name:'ownerA'},{id:11,owner_name:'ownerA'},
      {id:20,owner_name:'ownerB'}];
  }
  prepare(sql) {
    let params=[];
    const thisDb=this;
    return {
      bind(...values){params=values;return this;},
      all: async()=> {
        if (sql.includes('FROM homework_custom_tasks') && !sql.includes('JOIN')) {
          return {results:thisDb.tasks.filter(t=>t.owner_name===params[0])
            .map(t=>({id:t.id,title:t.title}))};
        }
        if (sql.includes('FROM homework_custom_progress')) {
          const tasks=thisDb.tasks.filter(t=>t.owner_name===params[0]);
          const ids=thisDb.chars.filter(c=>c.owner_name===params[1]).map(c=>c.id);
          return {results:[...thisDb.done].map(k=>k.split(':').map(Number))
            .filter(([task,character])=>tasks.some(t=>t.id===task)&&ids.includes(character))
            .map(([task_id,character_id])=>({task_id,character_id}))};
        }
        throw Error('Unknown all SQL: '+sql);
      },
      first: async()=> {
        if (sql.includes('FROM homework_task_column_orders')) {
          return thisDb.orders.has(params[0]) ? {task_keys:thisDb.orders.get(params[0])} : null;
        }
        if (sql.includes('FROM homework_custom_tasks t JOIN characters c')) {
          const [taskId,charId,owner]=params;
          return thisDb.tasks.find(t=>t.id===taskId&&t.owner_name===owner)
            &&thisDb.chars.find(c=>c.id===charId&&c.owner_name===owner)
            ? {task_id:taskId,character_id:charId} : null;
        }
        throw Error('Unknown first SQL: '+sql);
      },
      run: async()=> {
        if (sql.includes('INSERT INTO homework_custom_tasks')) {
          const [owner_name,title]=params;
          const id=thisDb.nextId++;
          thisDb.tasks.push({id,owner_name,title});
          return {meta:{last_row_id:id}};
        }
        if (sql.includes('INSERT INTO homework_task_column_orders')) {
          thisDb.orders.set(params[0],params[1]); return {meta:{changes:1}};
        }
        if (sql.includes('INSERT INTO homework_custom_progress')) {
          thisDb.done.add(`${params[0]}:${params[1]}`);return {meta:{changes:1}};
        }
        if (sql.includes('DELETE FROM homework_custom_progress')) {
          thisDb.done.delete(`${params[0]}:${params[1]}`);return {meta:{changes:1}};
        }
        throw Error('Unknown run SQL: '+sql);
      }
    };
  }
}
const env={DB:new MockD1()};
async function call(path,owner,body) {
  const request=new Request('https://test.local'+path,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
  });
  const response=await customHomeworkApi(request,env,path,owner,1730700000);
  return {status:response.status,data:await response.json()};
}
async function list(owner,ids) {
  const chars=ids.map(id=>({id,completed:[]}));
  const data=await getCustomHomeworkData(env,owner,chars);
  return {...data,characters:chars};
}
const base=['abyss','awakening','rudra','invasion','muspel','deltras','trial','craft'];
let a=await list('ownerA',[10,11]);
assert.deepEqual(a.taskOrder,base);
assert.deepEqual(a.customTasks,[]);
const created=await call('/api/homework/custom-task','ownerA',{title:'My extra task'});
assert.equal(created.status,200);
assert.equal(created.data.taskOrder.at(-1),'custom:1');
const second=await call('/api/homework/custom-task','ownerA',{title:'Another'});
assert.equal(second.status,200);
assert.deepEqual(second.data.taskOrder.slice(-2),['custom:1','custom:2']);
assert.equal((await call('/api/homework/custom-task','ownerA',{title:'Another'})).status,409);
assert.equal((await call('/api/homework/custom-task','ownerA',{title:'<script>'})).status,400);
assert.equal((await list('ownerB',[20])).customTasks.length,0);
const order=['craft','custom:2','abyss','muspel','trial','deltras','rudra','awakening','invasion','custom:1'];
assert.equal((await call('/api/homework/task-order','ownerA',{taskKeys:order})).status,200);
assert.deepEqual((await list('ownerA',[10,11])).taskOrder,order);
assert.deepEqual((await list('ownerB',[20])).taskOrder,base);
assert.equal((await call('/api/homework/task-order','ownerA',{taskKeys:order.slice(1)})).status,400);
assert.equal((await call('/api/homework/task-order','ownerA',{taskKeys:[...base,'custom:100','custom:2']})).status,400);
assert.equal((await call('/api/homework/custom-progress','ownerA',{characterId:10,taskId:1,completed:true})).status,200);
assert.equal((await call('/api/homework/custom-progress','ownerA',{characterId:11,taskId:1,completed:true})).status,200);
assert.equal((await call('/api/homework/custom-progress','ownerA',{characterId:20,taskId:1,completed:true})).status,403);
assert.equal((await call('/api/homework/custom-progress','ownerB',{characterId:20,taskId:1,completed:true})).status,403);
a=await list('ownerA',[10,11]);
assert.deepEqual(a.characters[0].customCompleted,['custom:1']);
assert.deepEqual(a.characters[1].customCompleted,['custom:1']);
assert.deepEqual((await list('ownerB',[20])).characters[0].customCompleted,[]);
assert.equal((await call('/api/homework/custom-progress','ownerA',{characterId:10,taskId:1,completed:false})).status,200);
assert.deepEqual((await list('ownerA',[10,11])).characters.map(x=>x.customCompleted),[[],['custom:1']]);
console.log('PASS: separate owner task columns; default order; insert after craft; persistent order; per-character completion; ownership checks; duplicate/invalid handling');
