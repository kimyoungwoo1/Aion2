// Per-nickname custom homework, task ordering, and weekly counter tasks.
const BUILTIN_TASK_KEYS = Object.freeze([
  'abyss','awakening','rudra','invasion','muspel','deltras','trial','craft'
]);
const MAX_CUSTOM_TASKS = 20;
const RESERVED_TITLES = new Set(['어비스회랑','각성전','루드라','침식','무스펠','델트라스','시련','오드구매&제작','오드구매']);
const PRESET_COUNT_TASKS = new Map([['악몽',2],['슈고',14]]);
const PRESET_TOGGLE_TASKS = new Set(['일일 던전']);
const REFILL_TASKS = new Set(['악몽','슈고']);
const MAX_BODY_BYTES = 8192;
const MAX_TITLE_LENGTH = 24;

function reply(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
  });
}
async function bodyOf(request) {
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
function isValidTitle(title) {
  return typeof title === 'string' && title === title.trim() && title.length >= 1 &&
    title.length <= MAX_TITLE_LENGTH && !/[\u0000-\u001f\u007f<>]/.test(title);
}
async function getTasks(env, nickname) {
  const r = await env.DB.prepare(`SELECT id,title,task_type,max_count FROM homework_custom_tasks
    WHERE owner_name=? ORDER BY id LIMIT 21`).bind(nickname).all();
  return r.results.map(t => ({id:Number(t.id),key:`custom:${t.id}`,label:t.title,
    custom:true,type:t.task_type || 'toggle',maxCount:Number(t.max_count || 0)}));
}
function reconcileOrder(raw, allKeys) {
  const allowed = new Set(allKeys);
  let selected = [];
  try { const parsed = JSON.parse(raw || '[]'); if (Array.isArray(parsed)) selected = parsed; }
  catch { /* broken order: use default */ }
  return [...new Set(selected.filter(v => typeof v === 'string' && allowed.has(v))),
    ...allKeys.filter(v => !selected.includes(v))];
}
function refillSlot(now) { return Math.floor((Math.floor(now / 1000) + 4 * 3600) / 43200); }
async function refreshRefillProgress(env, task, characterIds, now) {
  if (!characterIds.length) return [];
  const slot=refillSlot(now), maxCount=Number(task.max_count);
  const inserts=characterIds.map(id=>env.DB.prepare(`INSERT INTO homework_refill_count_progress
    (task_id,character_id,count,last_refill_slot,updated_at) VALUES(?,?,?,?,?)
    ON CONFLICT(task_id,character_id) DO NOTHING`).bind(task.id,id,maxCount,slot,now));
  await env.DB.batch(inserts);
  const rows=await env.DB.prepare(`SELECT character_id,count,last_refill_slot FROM homework_refill_count_progress
    WHERE task_id=? AND character_id IN (${characterIds.map(()=>'?').join(',')})`).bind(task.id,...characterIds).all();
  const updates=[];
  for(const row of rows.results){
    const elapsed=Math.max(0,slot-Number(row.last_refill_slot));
    if(elapsed){
      row.count=Math.min(maxCount,Number(row.count)+elapsed);
      row.last_refill_slot=slot;
      updates.push(env.DB.prepare(`UPDATE homework_refill_count_progress SET count=?,last_refill_slot=?,updated_at=? WHERE task_id=? AND character_id=?`).bind(row.count,slot,now,task.id,row.character_id));
    }
  }
  if(updates.length) await env.DB.batch(updates);
  return rows.results;
}
export async function getCustomHomeworkData(env, nickname, characters, weekStart, now = Date.now()) {
  const customTasks = await getTasks(env,nickname);
  const ids = characters.map(c => Number(c.id));
  const progress = new Map(ids.map(id => [id, []]));
  const counts = new Map(ids.map(id => [id, {}]));
  const done = await env.DB.prepare(`SELECT p.character_id,p.task_id
    FROM homework_custom_progress p
    JOIN homework_custom_tasks t ON t.id=p.task_id
    JOIN characters c ON c.id=p.character_id
    WHERE t.owner_name=? AND c.owner_name=? AND p.completed=1
    LIMIT 6500`).bind(nickname,nickname).all();
  for (const row of done.results) {
    const owned = progress.get(Number(row.character_id));
    if (owned) owned.push(`custom:${row.task_id}`);
  }
  const countRows = await env.DB.prepare(`SELECT p.character_id,p.task_id,p.count
    FROM homework_custom_count_progress p
    JOIN homework_custom_tasks t ON t.id=p.task_id
    JOIN characters c ON c.id=p.character_id
    WHERE t.owner_name=? AND c.owner_name=? AND p.week_start=? AND t.task_type='count'
      AND t.title NOT IN ('악몽','슈고')
    LIMIT 6500`).bind(nickname,nickname,weekStart).all();
  for (const row of countRows.results) {
    const owned = counts.get(Number(row.character_id));
    if (owned) owned[`custom:${row.task_id}`] = Number(row.count || 0);
  }
  for (const task of customTasks.filter(t=>REFILL_TASKS.has(t.label))) {
    const rows=await refreshRefillProgress(env,{id:task.id,max_count:task.maxCount},ids,now);
    for(const row of rows){const owned=counts.get(Number(row.character_id));if(owned)owned[task.key]=Number(row.count);}
  }
  for (const c of characters) {
    c.customCompleted = progress.get(Number(c.id)) || [];
    c.customCounts = counts.get(Number(c.id)) || {};
  }
  const rawOrder = await env.DB.prepare(
    'SELECT task_keys FROM homework_task_column_orders WHERE owner_name=?'
  ).bind(nickname).first();
  const keys = [...BUILTIN_TASK_KEYS, ...customTasks.map(t => t.key)];
  return {customTasks,taskOrder:reconcileOrder(rawOrder?.task_keys,keys)};
}

export async function customHomeworkApi(request, env, path, nickname, now, weekStart) {
  if (path === '/api/homework/custom-task' && request.method === 'DELETE') {
    const body = await bodyOf(request);
    const taskId = Number(body?.taskId);
    if (!Number.isSafeInteger(taskId) || taskId < 1) return reply({error:'Invalid task ID'},400);
    const task = await env.DB.prepare(`SELECT id FROM homework_custom_tasks WHERE id=? AND owner_name=?`)
      .bind(taskId,nickname).first();
    if (!task) return reply({error:'Task not found'},404);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM homework_custom_progress WHERE task_id=?').bind(taskId),
      env.DB.prepare('DELETE FROM homework_custom_count_progress WHERE task_id=?').bind(taskId),
      env.DB.prepare('DELETE FROM homework_custom_tasks WHERE id=? AND owner_name=?').bind(taskId,nickname)
    ]);
    const tasks = await getTasks(env,nickname);
    const orderRow = await env.DB.prepare('SELECT task_keys FROM homework_task_column_orders WHERE owner_name=?')
      .bind(nickname).first();
    const keys = reconcileOrder(orderRow?.task_keys,[...BUILTIN_TASK_KEYS,...tasks.map(t=>t.key)]);
    await env.DB.prepare(`INSERT INTO homework_task_column_orders(owner_name,task_keys,updated_at)
      VALUES(?,?,?) ON CONFLICT(owner_name) DO UPDATE SET task_keys=excluded.task_keys,updated_at=excluded.updated_at`)
      .bind(nickname,JSON.stringify(keys),now).run();
    return reply({success:true,taskOrder:keys});
  }

  if (request.method !== 'POST') return reply({error:'Method not allowed'},405);
  const body = await bodyOf(request);
  if (!body) return reply({error:'Invalid JSON request'},400);

  if (path === '/api/homework/custom-task') {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const taskType = body.taskType === 'count' ? 'count' : 'toggle';
    const maxCount = Number(body.maxCount || 0);
    const isDailyToggle=PRESET_TOGGLE_TASKS.has(title)&&taskType==='toggle';
    if (!isValidTitle(title) || (RESERVED_TITLES.has(title) && !isDailyToggle)) {
      return reply({error:'Invalid task title (1 to 24 characters)'},400);
    }
    if (PRESET_TOGGLE_TASKS.has(title) && taskType!=='toggle') return reply({error:'This title must be a toggle task'},400);
    if (taskType === 'count' && PRESET_COUNT_TASKS.get(title) !== maxCount) {
      return reply({error:'Unknown preset count task'},400);
    }
    if (taskType === 'toggle' && PRESET_COUNT_TASKS.has(title)) {
      return reply({error:'This title is reserved for a count task'},400);
    }
    const tasks = await getTasks(env,nickname);
    if (tasks.length >= MAX_CUSTOM_TASKS) return reply({error:'Maximum 20 custom tasks'},400);
    if (tasks.some(t => t.label === title)) return reply({error:'That task already exists'},409);
    const result = await env.DB.prepare(`INSERT INTO homework_custom_tasks
      (owner_name,title,created_at,task_type,max_count) VALUES(?,?,?,?,?)`)
      .bind(nickname,title,now,taskType,taskType === 'count' ? maxCount : 0).run();
    const taskId = Number(result.meta?.last_row_id);
    if (!Number.isSafeInteger(taskId)) return reply({error:'Task creation failed'},500);
    const orderRow = await env.DB.prepare(`SELECT task_keys FROM homework_task_column_orders
      WHERE owner_name=?`).bind(nickname).first();
    const ordered = reconcileOrder(orderRow?.task_keys,[...BUILTIN_TASK_KEYS,...tasks.map(t=>t.key)]);
    const craftAt = ordered.indexOf('craft');
    const key = `custom:${taskId}`;
    const firstNonCustom = ordered.findIndex((k,i) => i > craftAt && !k.startsWith('custom:'));
    const target = craftAt < 0 ? ordered.length : (firstNonCustom < 0 ? ordered.length : firstNonCustom);
    ordered.splice(target,0,key);
    await env.DB.prepare(`INSERT INTO homework_task_column_orders(owner_name,task_keys,updated_at)
      VALUES(?,?,?) ON CONFLICT(owner_name) DO UPDATE SET task_keys=excluded.task_keys,updated_at=excluded.updated_at`)
      .bind(nickname,JSON.stringify(ordered),now).run();
    return reply({success:true,task:{id:taskId,key,label:title,custom:true,type:taskType,
      maxCount:taskType === 'count' ? maxCount : 0},taskOrder:ordered});
  }

  if (path === '/api/homework/task-order') {
    const tasks = await getTasks(env,nickname);
    const expected = [...BUILTIN_TASK_KEYS,...tasks.map(t=>t.key)];
    const keys = body.taskKeys;
    if (!Array.isArray(keys) || keys.length !== expected.length ||
        keys.some(x => typeof x !== 'string') || new Set(keys).size !== expected.length ||
        keys.some(key => !expected.includes(key))) {
      return reply({error:'Task order must include each owned task exactly once'},400);
    }
    await env.DB.prepare(`INSERT INTO homework_task_column_orders(owner_name,task_keys,updated_at)
      VALUES(?,?,?) ON CONFLICT(owner_name) DO UPDATE SET task_keys=excluded.task_keys,updated_at=excluded.updated_at`)
      .bind(nickname,JSON.stringify(keys),now).run();
    return reply({success:true,taskOrder:keys});
  }

  if (path === '/api/homework/custom-count') {
    const characterId = Number(body.characterId);
    const taskId = Number(body.taskId);
    const count = Number(body.count);
    if (!Number.isSafeInteger(characterId) || characterId < 1 ||
        !Number.isSafeInteger(taskId) || taskId < 1 || !Number.isSafeInteger(count) || count < 0) {
      return reply({error:'Invalid count progress request'},400);
    }
    const task = await env.DB.prepare(`SELECT id,title,max_count FROM homework_custom_tasks
      WHERE id=? AND owner_name=? AND task_type='count'`).bind(taskId,nickname).first();
    if (!task) return reply({error:'Count task not found'},404);
    if (count > Number(task.max_count)) return reply({error:`Maximum count is ${task.max_count}`},400);
    const owned = await env.DB.prepare('SELECT id FROM characters WHERE id=? AND owner_name=?')
      .bind(characterId,nickname).first();
    if (!owned) return reply({error:'Character not owned by logged-in nickname'},403);
    if(REFILL_TASKS.has(task.title)){
      await refreshRefillProgress(env,task,[characterId],now);
      await env.DB.prepare('UPDATE homework_refill_count_progress SET count=?,updated_at=? WHERE task_id=? AND character_id=?').bind(count,now,taskId,characterId).run();
    } else {
      await env.DB.prepare(`INSERT INTO homework_custom_count_progress
        (task_id,character_id,week_start,count,updated_at) VALUES(?,?,?,?,?)
        ON CONFLICT(task_id,character_id,week_start) DO UPDATE SET count=excluded.count,updated_at=excluded.updated_at`)
        .bind(taskId,characterId,weekStart,count,now).run();
    }
    return reply({success:true,count,persistent:true});
  }

  if (path === '/api/homework/custom-progress') {
    const characterId = Number(body.characterId);
    const taskId = Number(body.taskId);
    if (!Number.isSafeInteger(characterId) || characterId < 1 ||
        !Number.isSafeInteger(taskId) || taskId < 1 || typeof body.completed !== 'boolean') {
      return reply({error:'Invalid progress request'},400);
    }
    const owner = await env.DB.prepare(`SELECT t.id AS task_id,c.id AS character_id
      FROM homework_custom_tasks t JOIN characters c ON c.owner_name=t.owner_name
      WHERE t.id=? AND c.id=? AND t.owner_name=? AND t.task_type='toggle'`)
      .bind(taskId,characterId,nickname).first();
    if (!owner) return reply({error:'Task or character not owned by logged-in nickname'},403);
    if (body.completed) {
      await env.DB.prepare(`INSERT INTO homework_custom_progress
        (task_id,character_id,completed,updated_at) VALUES(?,?,1,?)
        ON CONFLICT(task_id,character_id) DO UPDATE SET completed=1,updated_at=excluded.updated_at`)
        .bind(taskId,characterId,now).run();
    } else {
      await env.DB.prepare('DELETE FROM homework_custom_progress WHERE task_id=? AND character_id=?')
        .bind(taskId,characterId).run();
    }
    return reply({success:true,persistent:true});
  }
  return reply({error:'Unknown custom homework API'},404);
}
