// Per-nickname custom homework and independent column ordering.
// Custom completion is intentionally NOT stored in homework_progress.
const BUILTIN_TASK_KEYS = Object.freeze([
  'abyss','awakening','rudra','invasion','muspel','deltras','trial','craft'
]);
const MAX_CUSTOM_TASKS = 20;
const RESERVED_TITLES = new Set(['\uc5b4\ube44\uc2a4\ud68c\ub791','\uac01\uc131\uc804','\ub8e8\ub4dc\ub77c','\uce68\uc2dd','\ubb34\uc2a4\ud3a0','\ub378\ud2b8\ub77c\uc2a4','\uc2dc\ub828','\uc624\ub4dc\uad6c\ub9e4&\uc81c\uc791','\uc624\ub4dc\uad6c\ub9e4']);
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
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) {
    return null;
  }
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
  const r = await env.DB.prepare(`SELECT id,title FROM homework_custom_tasks
    WHERE owner_name=? ORDER BY id LIMIT 21`).bind(nickname).all();
  return r.results.map(t => ({id:Number(t.id),key:`custom:${t.id}`,label:t.title,custom:true}));
}
function reconcileOrder(raw, allKeys) {
  const allowed = new Set(allKeys);
  let selected = [];
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed)) selected = parsed;
  } catch { /* old or broken order: use the default */ }
  return [...new Set(selected.filter(v => typeof v === 'string' && allowed.has(v))) ,
    ...allKeys.filter(v => !selected.includes(v))];
}
export async function getCustomHomeworkData(env, nickname, characters) {
  const customTasks = await getTasks(env, nickname);
  const ids = characters.map(c => Number(c.id));
  const progress = new Map(ids.map(id => [id, []]));
  // Character ownership is enforced by the JOIN; not the client-provided IDs.
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
  for (const c of characters) c.customCompleted = progress.get(Number(c.id)) || [];
  const rawOrder = await env.DB.prepare(
    'SELECT task_keys FROM homework_task_column_orders WHERE owner_name=?'
  ).bind(nickname).first();
  const keys = [...BUILTIN_TASK_KEYS, ...customTasks.map(t => t.key)];
  return {customTasks,taskOrder:reconcileOrder(rawOrder?.task_keys, keys)};
}

export async function customHomeworkApi(request, env, path, nickname, now) {
  if (request.method !== 'POST') return reply({error:'Method not allowed'},405);
  const body = await bodyOf(request);
  if (!body) return reply({error:'Invalid JSON request'},400);
  if (path === '/api/homework/custom-task') {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!isValidTitle(title) || RESERVED_TITLES.has(title)) {
      return reply({error:'Invalid task title (1 to 24 characters)'},400);
    }
    const tasks = await getTasks(env,nickname);
    if (tasks.length >= MAX_CUSTOM_TASKS) return reply({error:'Maximum 20 custom tasks'},400);
    if (tasks.some(t => t.label === title)) return reply({error:'That task already exists'},409);
    const result = await env.DB.prepare(`INSERT INTO homework_custom_tasks
      (owner_name,title,created_at) VALUES(?,?,?)`).bind(nickname,title,now).run();
    const taskId = Number(result.meta?.last_row_id);
    if (!Number.isSafeInteger(taskId)) return reply({error:'Task creation failed'},500);
    const orderRow = await env.DB.prepare(`SELECT task_keys FROM homework_task_column_orders
      WHERE owner_name=?`).bind(nickname).first();
    const ordered = reconcileOrder(orderRow?.task_keys,
      [...BUILTIN_TASK_KEYS,...tasks.map(t=>t.key)]);
    const craftAt = ordered.indexOf('craft');
    const key = `custom:${taskId}`;
    // Keep a block of custom tasks directly after craft in the default order.
    const firstNonCustom = ordered.findIndex((k,i) => i > craftAt && !k.startsWith('custom:'));
    const target = craftAt < 0 ? ordered.length : (firstNonCustom < 0 ? ordered.length : firstNonCustom);
    ordered.splice(target,0,key);
    await env.DB.prepare(`INSERT INTO homework_task_column_orders(owner_name,task_keys,updated_at)
      VALUES(?,?,?) ON CONFLICT(owner_name) DO UPDATE SET task_keys=excluded.task_keys,updated_at=excluded.updated_at`)
      .bind(nickname,JSON.stringify(ordered),now).run();
    return reply({success:true,task:{id:taskId,key,label:title,custom:true},taskOrder:ordered});
  }
  if (path === '/api/homework/task-order') {
    const tasks = await getTasks(env,nickname);
    const expected = [...BUILTIN_TASK_KEYS,...tasks.map(t=>t.key)];
    const keys = body.taskKeys;
    if (!Array.isArray(keys) || keys.length !== expected.length ||
        keys.some(x => typeof x !== 'string') ||
        new Set(keys).size !== expected.length ||
        keys.some(key => !expected.includes(key))) {
      return reply({error:'Task order must include each owned task exactly once'},400);
    }
    await env.DB.prepare(`INSERT INTO homework_task_column_orders(owner_name,task_keys,updated_at)
      VALUES(?,?,?) ON CONFLICT(owner_name) DO UPDATE SET task_keys=excluded.task_keys,updated_at=excluded.updated_at`)
      .bind(nickname,JSON.stringify(keys),now).run();
    return reply({success:true,taskOrder:keys});
  }
  if (path === '/api/homework/custom-progress') {
    const characterId = Number(body.characterId);
    const taskId = Number(body.taskId);
    if (!Number.isSafeInteger(characterId) || characterId < 1 ||
        !Number.isSafeInteger(taskId) || taskId < 1 || typeof body.completed !== 'boolean') {
      return reply({error:'Invalid progress request'},400);
    }
    // Check BOTH task owner and character owner on the server side.
    const owner = await env.DB.prepare(`SELECT t.id AS task_id,c.id AS character_id
      FROM homework_custom_tasks t JOIN characters c ON c.owner_name=t.owner_name
      WHERE t.id=? AND c.id=? AND t.owner_name=?`)
      .bind(taskId,characterId,nickname).first();
    if (!owner) return reply({error:'Task or character not owned by logged-in nickname'},403);
    if (body.completed) {
      await env.DB.prepare(`INSERT INTO homework_custom_progress
        (task_id,character_id,completed,updated_at) VALUES(?,?,1,?)
        ON CONFLICT(task_id,character_id) DO UPDATE SET completed=1,updated_at=excluded.updated_at`)
        .bind(taskId,characterId,now).run();
    } else {
      await env.DB.prepare(`DELETE FROM homework_custom_progress WHERE task_id=? AND character_id=?`)
        .bind(taskId,characterId).run();
    }
    return reply({success:true,persistent:true});
  }
  return reply({error:'Unknown custom homework API'},404);
}
