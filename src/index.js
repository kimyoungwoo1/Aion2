const encoder = new TextEncoder();
const SESSION_AGE = 7 * 24 * 60 * 60;
const JSON_LIMIT = 8192;
const CHARACTER_API_URL = 'https://aion2-api.ksmsy1.workers.dev/';

// 한국 서버명 ↔ API 서버 ID (게임 클라이언트 서버명 테이블 기준)
// 이 목록은 데이터베이스에 있는 서버 ID를 바꾸지 않습니다.
// 새 서버가 추가되면 아래 배열에 ID/이름/진영을 추가하세요.
const AION2_SERVERS = Object.freeze([
  // 천족: 1001 ~ 1021
  { id: 1001, name: '시엘', faction: '천족' },
  { id: 1002, name: '네자칸', faction: '천족' },
  { id: 1003, name: '바이젤', faction: '천족' },
  { id: 1004, name: '카이시넬', faction: '천족' },
  { id: 1005, name: '유스티엘', faction: '천족' },
  { id: 1006, name: '아리엘', faction: '천족' },
  { id: 1007, name: '프레기온', faction: '천족' },
  { id: 1008, name: '메스람타에다', faction: '천족' },
  { id: 1009, name: '히타니에', faction: '천족' },
  { id: 1010, name: '나니아', faction: '천족' },
  { id: 1011, name: '타하바타', faction: '천족' },
  { id: 1012, name: '루터스', faction: '천족' },
  { id: 1013, name: '페르노스', faction: '천족' },
  { id: 1014, name: '다미누', faction: '천족' },
  { id: 1015, name: '카사카', faction: '천족' },
  { id: 1016, name: '바카르마', faction: '천족' },
  { id: 1017, name: '챈가룽', faction: '천족' },
  { id: 1018, name: '코치룽', faction: '천족' },
  { id: 1019, name: '이슈타르', faction: '천족' },
  { id: 1020, name: '티아마트', faction: '천족' },
  { id: 1021, name: '포에타', faction: '천족' },
  // 마족: 2001 ~ 2021
  { id: 2001, name: '이스라펠', faction: '마족' },
  { id: 2002, name: '지켈', faction: '마족' },
  { id: 2003, name: '트리니엘', faction: '마족' },
  { id: 2004, name: '루미엘', faction: '마족' },
  { id: 2005, name: '마르쿠탄', faction: '마족' },
  { id: 2006, name: '아스펠', faction: '마족' },
  { id: 2007, name: '에레슈키갈', faction: '마족' },
  { id: 2008, name: '브리트라', faction: '마족' },
  { id: 2009, name: '네몬', faction: '마족' },
  { id: 2010, name: '하달', faction: '마족' },
  { id: 2011, name: '루드라', faction: '마족' },
  { id: 2012, name: '울고른', faction: '마족' },
  { id: 2013, name: '무닌', faction: '마족' },
  { id: 2014, name: '오다르', faction: '마족' },
  { id: 2015, name: '젠카카', faction: '마족' },
  { id: 2016, name: '크로메데', faction: '마족' },
  { id: 2017, name: '콰이링', faction: '마족' },
  { id: 2018, name: '바바룽', faction: '마족' },
  { id: 2019, name: '파프니르', faction: '마족' },
  { id: 2020, name: '인드나흐', faction: '마족' },
  { id: 2021, name: '이스할겐', faction: '마족' }
]);
const AION2_SERVER_IDS = new Set(AION2_SERVERS.map(s => s.id));


function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}

function hex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return new Uint8Array(hash);
}

async function tokenHash(token) {
  return hex(await sha256(token));
}

async function sameCode(received, configured) {
  const a = await sha256(received);
  const b = await sha256(configured);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

function getCookie(request, key) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`));
  return match ? match[1] : '';
}

function sessionCookie(request, value, maxAge) {
  const hostname = new URL(request.url).hostname;
  const secure = hostname === 'localhost' || hostname === '127.0.0.1' ? '' : '; Secure';
  return `aion2_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

async function currentUser(request, env) {
  const token = getCookie(request, 'aion2_session');
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  return await env.DB.prepare(
    'SELECT nickname FROM sessions WHERE token_hash = ? AND expires_at > ?'
  ).bind(await tokenHash(token), Math.floor(Date.now() / 1000)).first();
}

async function readJson(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    throw new Error('JSON 요청만 허용됩니다.');
  }
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > JSON_LIMIT) throw new Error('요청 크기 초과');
  const raw = await request.text();
  if (encoder.encode(raw).length > JSON_LIMIT) throw new Error('요청 크기 초과');
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new Error('잘못된 JSON 데이터');
  }
}

function validLabel(value, max = 40) {
  return typeof value === 'string' && value.trim().length >= 1 &&
    value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value);
}

function parseCharacterInput(body) {
  const characterName = typeof body.characterName === 'string' ? body.characterName.trim() : '';
  const serverId = Number(body.serverId);
  if (!validLabel(characterName, 30) || !Number.isSafeInteger(serverId) ||
      !AION2_SERVER_IDS.has(serverId)) return null;
  return { characterName, serverId };
}

class LookupError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

// CSV의 첫 행을 읽음. 따옴표와 이스케이프된 따옴표, 쉼표를 처리한다.
function firstCsvRow(text) {
  const input = text.replace(/^\uFEFF/, '');
  const values = [];
  let buffer = '';
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { buffer += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      values.push(buffer.trim());
      buffer = '';
    } else if ((c === '\r' || c === '\n') && !quoted) {
      break;
    } else {
      buffer += c;
    }
  }
  values.push(buffer.trim());
  return values;
}

function parseLookupCsv(text) {
  const row = firstCsvRow(text.trim());
  if (row.length < 3) throw new LookupError('캐릭터 API 응답 형식을 확인해 주세요.');
  const className = row[0].trim();
  if (className === '조회 실패' || className === '없음') {
    throw new LookupError('해당 서버에서 캐릭터를 찾지 못했습니다.', 404);
  }
  // 숫자에 쉼표가 붙어 있어도 처리 (예: 6,740).
  const itemRaw = row.slice(1, -1).join(',').replace(/,/g, '').trim();
  const itemLevel = Number(itemRaw);
  const powerRaw = row[row.length - 1].trim().replace(/,/g, '');
  const powerMatch = powerRaw.match(/^(\d+(?:\.\d+)?)\s*([kKmM]?)$/);
  if (!validLabel(className, 20) || !Number.isInteger(itemLevel) ||
      itemLevel < 0 || itemLevel > 50000 || !powerMatch) {
    throw new LookupError('API에서 받은 직업, 아이템 레벨 또는 남툴 값이 올바르지 않습니다.');
  }
  const naddolK = Number(powerMatch[1]) * (powerMatch[2].toLowerCase() === 'm' ? 1000 : 1);
  if (!Number.isFinite(naddolK) || naddolK < 0 || naddolK > 10000000) {
    throw new LookupError('API 남툴 값의 범위를 확인해 주세요.');
  }
  return { className, itemLevel, naddolK };
}

async function lookupCharacter(env, characterName, serverId) {
  if (!env.AION_API || typeof env.AION_API.fetch !== 'function') {
    throw new LookupError('aion2-api Service Binding이 연결되지 않았습니다.', 503);
  }
  const url = new URL(CHARACTER_API_URL);
  url.searchParams.set('name', characterName);
  url.searchParams.set('serverId', String(serverId));
  url.searchParams.set('format', 'csv');
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const request = new Request(url.toString(), {
        method: 'GET',
        headers: { Accept: 'text/csv' },
        signal: AbortSignal.timeout(12000)
      });
      const response = await env.AION_API.fetch(request);
      if (!response.ok) {
        if (response.status === 404) throw new LookupError('캐릭터 API에서 대상을 찾지 못했습니다.', 404);
        throw new LookupError(`캐릭터 API 응답 오류 (HTTP ${response.status})`);
      }
      const text = await response.text();
      if (!text.trim() || text.length > 30000) throw new LookupError('캐릭터 API 응답이 비어 있거나 너무 큽니다.');
      return parseLookupCsv(text);
    } catch (error) {
      if (error instanceof LookupError && error.status === 404) throw error;
      lastError = error;
    }
  }
  console.error('Character lookup failed:', lastError?.message);
  throw lastError instanceof LookupError ? lastError :
    new LookupError('캐릭터 API 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.');
}

async function api(request, env, path) {
  const method = request.method;
  const now = Math.floor(Date.now() / 1000);

  if (method === 'POST' && path === '/api/login') {
    const body = await readJson(request);
    if (!validLabel(body.nickname, 30) || typeof body.accessCode !== 'string' ||
        body.accessCode.length < 1 || body.accessCode.length > 256) {
      return json({ error: '닉네임과 접속 코드를 확인하세요.' }, 400);
    }
    // 기존 운영 사이트의 짧은 공용 코드도 유지. 보안을 위해 긴 코드 권장.
    if (typeof env.ACCESS_CODE !== 'string' || env.ACCESS_CODE.length < 1) {
      return json({ error: '서버 접속 코드가 설정되지 않았습니다.' }, 503);
    }
    if (!(await sameCode(body.accessCode, env.ACCESS_CODE))) {
      return json({ error: '접속 코드가 올바르지 않습니다.' }, 401);
    }
    const token = hex(crypto.getRandomValues(new Uint8Array(32)));
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
    await env.DB.prepare(
      'INSERT INTO sessions (token_hash, nickname, created_at, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(await tokenHash(token), body.nickname.trim(), now, now + SESSION_AGE).run();
    return json({ nickname: body.nickname.trim() }, 200, {
      'Set-Cookie': sessionCookie(request, token, SESSION_AGE)
    });
  }

  if (method === 'POST' && path === '/api/logout') {
    const token = getCookie(request, 'aion2_session');
    if (/^[0-9a-f]{64}$/.test(token)) {
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
        .bind(await tokenHash(token)).run();
    }
    return json({ success: true }, 200, {
      'Set-Cookie': sessionCookie(request, '', 0)
    });
  }

  const user = await currentUser(request, env);
  if (!user) return json({ error: '접속 코드 인증이 필요합니다.' }, 401);

  if (method === 'GET' && path === '/api/me') {
    return json({ nickname: user.nickname });
  }

  if (method === 'GET' && path === '/api/servers') {
    return json({ servers: AION2_SERVERS });
  }

  if (method === 'GET' && path === '/api/characters') {
    const result = await env.DB.prepare(
      'SELECT id, owner_name, character_name, server_id, class_name, item_level, naddol_k, ' +
      'notes, updated_by, updated_at, synced_at FROM characters ' +
      'ORDER BY owner_name, server_id, character_name LIMIT 1000'
    ).all();
    return json({ characters: result.results });
  }

  if (method === 'POST' && path === '/api/characters') {
    const input = parseCharacterInput(await readJson(request));
    if (!input) return json({ error: '캐릭터명과 서버를 확인하세요.' }, 400);
    const info = await lookupCharacter(env, input.characterName, input.serverId);
    const result = await env.DB.prepare(
      'INSERT INTO characters (owner_name, character_name, server_id, class_name, item_level, ' +
      'naddol_k, notes, updated_by, updated_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.nickname, input.characterName, input.serverId, info.className,
      info.itemLevel, info.naddolK, '', user.nickname, now, now).run();
    return json({ success: true, id: result.meta.last_row_id }, 201);
  }

  const refreshMatch = path.match(/^\/api\/characters\/([1-9]\d*)\/refresh$/);
  if (refreshMatch && method === 'POST') {
    const id = Number(refreshMatch[1]);
    if (!Number.isSafeInteger(id)) return json({ error: '잘못된 ID' }, 400);
    const existing = await env.DB.prepare(
      'SELECT character_name, server_id FROM characters WHERE id = ?'
    ).bind(id).first();
    if (!existing) return json({ error: '캐릭터가 없습니다.' }, 404);
    const info = await lookupCharacter(env, existing.character_name, existing.server_id);
    await env.DB.prepare(
      'UPDATE characters SET class_name = ?, item_level = ?, naddol_k = ?, ' +
      'synced_at = ?, updated_by = ?, updated_at = ? WHERE id = ?'
    ).bind(info.className, info.itemLevel, info.naddolK, now, user.nickname, now, id).run();
    return json({ success: true });
  }

  const match = path.match(/^\/api\/characters\/([1-9]\d*)$/);
  if (match && (method === 'PUT' || method === 'DELETE')) {
    const id = Number(match[1]);
    if (!Number.isSafeInteger(id)) return json({ error: '잘못된 ID' }, 400);

    if (method === 'DELETE') {
      const result = await env.DB.prepare('DELETE FROM characters WHERE id = ?').bind(id).run();
      return result.meta.changes ? json({ success: true }) : json({ error: '캐릭터가 없습니다.' }, 404);
    }

    const input = parseCharacterInput(await readJson(request));
    if (!input) return json({ error: '캐릭터명과 서버를 확인하세요.' }, 400);
    const exists = await env.DB.prepare('SELECT id FROM characters WHERE id = ?').bind(id).first();
    if (!exists) return json({ error: '캐릭터가 없습니다.' }, 404);
    const info = await lookupCharacter(env, input.characterName, input.serverId);
    const result = await env.DB.prepare(
      'UPDATE characters SET character_name = ?, server_id = ?, class_name = ?, ' +
      'item_level = ?, naddol_k = ?, synced_at = ?, updated_by = ?, updated_at = ? ' +
      'WHERE id = ?'
    ).bind(input.characterName, input.serverId, info.className, info.itemLevel,
      info.naddolK, now, user.nickname, now, id).run();
    return result.meta.changes ? json({ success: true }) : json({ error: '캐릭터가 없습니다.' }, 404);
  }

  return json({ error: '지원하지 않는 API입니다.' }, 404);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.DB) return json({ error: 'D1 DB 바인딩이 없습니다.' }, 500);

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
        request.headers.get('Origin') !== new URL(request.url).origin) {
      return json({ error: '허용되지 않은 요청 출처입니다.' }, 403);
    }

    try {
      return await api(request, env, path);
    } catch (error) {
      if (error instanceof LookupError) return json({ error: error.message }, error.status);
      if (['JSON 요청만 허용됩니다.', '요청 크기 초과', '잘못된 JSON 데이터'].includes(error?.message)) {
        return json({ error: error.message }, 400);
      }
      if (String(error?.message).includes('UNIQUE constraint failed')) {
        return json({ error: '이 서버에 같은 캐릭터명이 이미 등록되어 있습니다.' }, 409);
      }
      console.error('API failure', error);
      return json({ error: '서버 오류가 발생했습니다.' }, 500);
    }
  }
};
