/** AION2_ADMIN_AUDIT_V1: record successful user mutations, never credentials. */
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const EXCLUDED = new Set(['/api/login', '/api/logout']);
const MAX_JSON = 3500;

// AION2_ADMIN_AUDIT_IP_V1: trusted Cloudflare edge address only.
// Never take an address from request JSON, X-Forwarded-For or X-Real-IP.
export function readClientIp(request) {
  const value = (request.headers.get('CF-Connecting-IP') || '').trim();
  if (!value || value.length > 45) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) {
    return value.split('.').every(part => Number(part) <= 255) ? value : null;
  }
  // Cloudflare can supply compressed IPv6; validate plausible text and length.
  if (value.includes(':') && /^[0-9a-fA-F:.]+$/.test(value) &&
      (value.match(/:/g) || []).length >= 2) return value;
  return null;
}

function truncateData(value) {
  if (value === undefined || value === null) return null;
  const json = JSON.stringify(value);
  return json.length <= MAX_JSON ? json : JSON.stringify({ truncated: true, preview: json.slice(0, MAX_JSON - 100) });
}

function safeBody(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const names = ['characterId', 'characterName', 'serverId', 'sanctuary', 'weekStart', 'statuses',
    'note', 'nickname', 'nicknames', 'partyNumber', 'slotNumber', 'marker', 'field', 'value',
    'taskKey', 'completed', 'membership', 'characterIds', 'confirm', 'title', 'revision',
    'startDate', 'endDate'];
  const out = {};
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(raw, name)) {
      const value = raw[name];
      out[name] = typeof value === 'string' ? value.slice(0, 300) : value;
    }
  }
  // Exclude passwords, session tokens, inquiry body/replies and arbitrary payloads.
  return out;
}

function classify(path, method, body) {
  let category = 'other', action = method.toLowerCase(), target = '', summary = '';
  const char = path.match(/^\/api\/characters\/([1-9]\d*)(\/refresh)?$/);
  if (path === '/api/characters' || char) {
    category = 'character'; target = char ? `캐릭터 #${char[1]}` : (body.characterName || '새 캐릭터');
    action = char?.[2] ? 'refresh' : method === 'DELETE' ? 'delete' : char ? 'edit' : 'create';
    summary = ({ refresh: '캐릭터 전투력 갱신', delete: '캐릭터 삭제', edit: '캐릭터 수정', create: '캐릭터 등록' })[action];
  } else if (path === '/api/homework/od' || path === '/api/homework/od/membership') {
    category = 'od'; action = path.endsWith('membership') ? 'membership' : 'balance';
    target = `캐릭터 #${body.characterId || '?'}`;
    summary = action === 'membership' ? '멤버십 설정 변경' : `${body.field === 'od2' ? '오드2' : '오드1'} 수량 변경`;
  } else if (path.startsWith('/api/homework')) {
    category = 'homework'; target = body.characterId ? `캐릭터 #${body.characterId}` : '로그인 닉네임 전체';
    if (path === '/api/homework/reset') { action = 'reset'; summary = '숙제 현황 일괄 초기화'; }
    else if (path === '/api/homework/order') { action = 'order'; summary = '숙제 캐릭터 순서 변경'; }
    else { action = 'toggle'; summary = `${body.taskKey || '숙제'} ${body.completed ? '완료' : '미완료'} 변경`; }
  } else if (path === '/api/sanctuary/roster/assignment') {
    category = 'party'; action = 'assignment'; target = `${body.sanctuary || '?'}성역 · 캐릭터 #${body.characterId || '?'}`;
    summary = '파티 배정·징표·비고 변경';
  } else if (path.startsWith('/api/sanctuary')) {
    category = 'sanctuary'; target = `${body.sanctuary || '?'}성역`;
    if (path.endsWith('members')) { action = method === 'DELETE' ? 'remove-member' : 'add-member'; summary = '고정 참여자 명단 변경'; }
    else { action = 'schedule'; summary = '참여 일정·비고 변경'; }
  } else if (path.includes('content-schedule') || path.includes('matches')) {
    category = 'content'; action = 'matches'; target = '서버 매칭표'; summary = '서버 매칭표 수정';
  } else if (path.startsWith('/api/inquiries')) {
    category = 'inquiry'; action = /\/replies$/.test(path) ? 'reply' : 'create';
    target = path.match(/\/([1-9]\d*)\//)?.[1] || body.title || '문의';
    summary = action === 'reply' ? '문의 답글 등록' : '문의 등록';
  } else {
    if (!path.startsWith('/api/')) return null;
    target = path.slice(0, 120); summary = `${method} 데이터 변경`;
  }
  return { category, action, target: String(target).slice(0, 160), summary, details: safeBody(body) };
}

async function queryOne(env, query, bindings) {
  try { return await env.DB.prepare(query).bind(...bindings).first(); }
  catch (error) { console.warn('Audit snapshot unavailable:', error?.message); return null; }
}

async function snapshot(env, path, body, actor, responseBody) {
  const charId = Number(body.characterId || path.match(/^\/api\/characters\/([1-9]\d*)/)?.[1] || responseBody?.id);
  if (path.startsWith('/api/characters')) {
    if (!Number.isSafeInteger(charId) || charId < 1) return null;
    return queryOne(env, `SELECT id,owner_name,character_name,server_id,class_name,item_level,naddol_k,notes
      FROM characters WHERE id=?`, [charId]);
  }
  if (path === '/api/sanctuary/roster/assignment') {
    const id = Number(body.characterId);
    if (!Number.isSafeInteger(id) || id < 1 || !['4','3','2'].includes(body.sanctuary)) return null;
    return queryOne(env, `SELECT c.character_name,p.party_number,p.slot_number,
      COALESCE(m.marker,'') AS marker,COALESCE(n.note,'') AS note
      FROM characters c LEFT JOIN sanctuary_character_party_slots p
      ON p.character_id=c.id AND p.sanctuary=?
      LEFT JOIN sanctuary_character_markers m ON m.character_id=c.id AND m.sanctuary=?
      LEFT JOIN sanctuary_character_notes n ON n.character_id=c.id AND n.sanctuary=?
      WHERE c.id=?`, [body.sanctuary, body.sanctuary, body.sanctuary, id]);
  }
  if (path === '/api/homework/od' || path === '/api/homework/od/membership') {
    const id = Number(body.characterId);
    if (!Number.isSafeInteger(id) || id < 1) return null;
    return queryOne(env, `SELECT od1,od2,od1_membership,od1_updated_at
      FROM homework_od_balances WHERE character_id=?`, [id]);
  }
  if (path === '/api/homework') {
    const id = Number(body.characterId);
    if (!Number.isSafeInteger(id) || id < 1 || typeof body.taskKey !== 'string') return null;
    const row = await queryOne(env, `SELECT week_start,completed FROM homework_progress
      WHERE character_id=? AND task_key=? ORDER BY updated_at DESC LIMIT 1`, [id, body.taskKey]);
    return { completed: Boolean(row?.completed), weekStart: row?.week_start || null };
  }
  if (path === '/api/homework/reset') {
    return queryOne(env, `SELECT COUNT(*) AS completed_count FROM homework_progress h
      JOIN characters c ON c.id=h.character_id WHERE c.owner_name=?`, [actor]);
  }
  if (path === '/api/homework/order') {
    return queryOne(env, 'SELECT character_ids FROM homework_character_order WHERE owner_name=?', [actor]);
  }
  if (path === '/api/sanctuary') {
    if (!['4','3','2'].includes(body.sanctuary) || !body.weekStart) return null;
    if (body.sanctuary === '4' || body.sanctuary === '3') {
      const [availability, note] = await Promise.all([
        queryOne(env, `SELECT statuses FROM sanctuary_shared_availability
          WHERE week_start=? AND nickname=?`, [body.weekStart, actor]),
        queryOne(env, `SELECT note FROM sanctuary_shared_schedule_notes
          WHERE week_start=? AND nickname=?`, [body.weekStart, actor])
      ]);
      return {statuses:availability?.statuses ?? null,note:note?.note ?? ''};
    }
    return queryOne(env, `SELECT statuses,note,updated_at FROM sanctuary_schedules
      WHERE sanctuary=? AND week_start=? AND nickname=?`, [body.sanctuary, body.weekStart, actor]);
  }
  if (path === '/api/content-schedule/matches') {
    const match = await queryOne(env,
      'SELECT revision,updated_by,payload_json FROM content_schedule_server_matches WHERE id=1', []);
    if (!match) return null;
    try { return {revision:match.revision,updatedBy:match.updated_by,values:JSON.parse(match.payload_json)}; }
    catch {return {revision:match.revision,updatedBy:match.updated_by};}
  }
  return null;
}

export async function withAudit(request, env, path, handler, getUser) {
  if (!MUTATING.has(request.method) || EXCLUDED.has(path) || path.startsWith('/api/admin/')) {
    return handler();
  }
  // Snapshot the body before passing the original, unread request to the handler.
  let body = {};
  try { body = await request.clone().json(); } catch { /* invalid body will be rejected by handler */ }
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};
  const kind = classify(path, request.method, body);
  if (!kind) return handler();
  let actor;
  try { actor = (await getUser(request, env))?.nickname; } catch { /* handled by existing auth */ }
  if (!actor) return handler();
  const previous = await snapshot(env, path, body, actor);
  const response = await handler();
  if (!response.ok) return response;
  let result = null;
  try { result = await response.clone().json(); } catch { /* non-JSON success */ }
  const current = await snapshot(env, path, body, actor, result);
  // Do not record a no-op as a change unless it is an explicit action.
  if (previous !== null && current !== null && JSON.stringify(previous) === JSON.stringify(current) &&
      !['refresh', 'reset'].includes(kind.action)) return response;
  try {
    await env.DB.prepare(`INSERT INTO admin_audit_events
      (occurred_at,actor_nickname,actor_ip,category,action,target,summary,details_json,previous_json,current_json)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(Math.floor(Date.now()/1000), actor, readClientIp(request), kind.category, kind.action, kind.target,
        kind.summary, truncateData(kind.details), truncateData(previous), truncateData(current)).run();
  } catch (error) {
    // Never turn an already committed user update into a misleading failed response.
    console.error('AUDIT_WRITE_FAILED:', error?.message);
  }
  return response;
}
