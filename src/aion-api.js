// 아이온2 공식 캐릭터 정보실 API 직접 조회.
// 별도의 aion2-api Worker 또는 Service Binding이 필요하지 않습니다.
const AION_ORIGIN = 'https://aion2.plaync.com';
const SEARCH_PATH = '/ko-kr/api/search/aion2/search/v2/character';
const INFO_PATH = '/api/character/info';
const FETCH_TIMEOUT_MS = 12000;
const MAX_JSON_BYTES = 1500000;

export class OfficialAionLookupError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'OfficialAionLookupError';
    this.status = status;
  }
}

function decodeHtmlName(value) {
  // 검색 결과 예: <strong>솜구름</strong>
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
      const code = n[0]?.toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : parseInt(n, 10);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : '';
    })
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
      const values = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
      return values[entity.toLowerCase()];
    })
    .normalize('NFC')
    .trim();
}

function normalizeCharacterId(value) {
  if (typeof value !== 'string' || !value || value.length > 1000) {
    throw new OfficialAionLookupError('공식 검색 결과에서 캐릭터 ID를 확인할 수 없습니다.');
  }
  try {
    // 검색 API가 %3D를 반환하므로 한 번만 복원하여 URLSearchParams에 전달합니다.
    return decodeURIComponent(value);
  } catch {
    throw new OfficialAionLookupError('공식 검색 결과의 캐릭터 ID 형식이 올바르지 않습니다.');
  }
}

async function fetchOfficialJson(url, fetcher, label) {
  let response;
  try {
    response = await fetcher(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch (error) {
    throw new OfficialAionLookupError(
      `${label} 연결에 실패했습니다. 공식 아이온2 서버 상태를 확인해 주세요.`
    );
  }
  if (!response || !response.ok) {
    const status = response?.status;
    const mapped = status === 404 ? 404 : 502;
    throw new OfficialAionLookupError(`${label} 응답 오류 (HTTP ${status ?? '알 수 없음'})`, mapped);
  }

  const declaredLength = Number(response.headers?.get?.('content-length') || 0);
  if (declaredLength > MAX_JSON_BYTES) {
    throw new OfficialAionLookupError(`${label} 응답 크기가 너무 큽니다.`);
  }
  let body;
  try {
    body = await response.text();
  } catch {
    throw new OfficialAionLookupError(`${label} 응답을 읽지 못했습니다.`);
  }
  if (!body || new TextEncoder().encode(body).length > MAX_JSON_BYTES) {
    throw new OfficialAionLookupError(`${label} 응답이 비어 있거나 너무 큽니다.`);
  }
  try {
    const data = JSON.parse(body);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not object');
    return data;
  } catch {
    throw new OfficialAionLookupError(`${label} JSON 형식이 올바르지 않습니다.`);
  }
}

// 반환 형식은 기존 D1 저장 코드를 그대로 사용할 수 있도록 유지합니다.
// { className: string, itemLevel: number, naddolK: number }
export async function lookupOfficialCharacter(characterName, serverId, options = {}) {
  const name = typeof characterName === 'string' ? characterName.trim().normalize('NFC') : '';
  const id = Number(serverId);
  if (!name || name.length > 30 || !Number.isSafeInteger(id) ||
      !((id >= 1001 && id <= 1999) || (id >= 2001 && id <= 2999))) {
    throw new OfficialAionLookupError('캐릭터명 또는 서버 ID가 올바르지 않습니다.', 400);
  }
  const race = id >= 2000 ? 2 : 1;
  const fetcher = options.fetcher || fetch;

  const searchUrl = new URL(SEARCH_PATH, AION_ORIGIN);
  searchUrl.searchParams.set('keyword', name);
  searchUrl.searchParams.set('race', String(race));
  searchUrl.searchParams.set('serverId', String(id));
  const search = await fetchOfficialJson(searchUrl, fetcher, '공식 캐릭터 검색 API');
  if (!Array.isArray(search.list)) {
    throw new OfficialAionLookupError('공식 검색 결과 형식이 변경되었습니다.');
  }

  const match = search.list.find(row => row &&
    decodeHtmlName(row.name) === name &&
    Number(row.serverId) === id &&
    Number(row.race) === race);
  if (!match) {
    throw new OfficialAionLookupError('해당 서버에서 정확히 일치하는 캐릭터를 찾지 못했습니다.', 404);
  }

  const infoUrl = new URL(INFO_PATH, AION_ORIGIN);
  infoUrl.searchParams.set('lang', 'ko');
  infoUrl.searchParams.set('serverId', String(id));
  infoUrl.searchParams.set('characterId', normalizeCharacterId(match.characterId));
  const info = await fetchOfficialJson(infoUrl, fetcher, '공식 캐릭터 상세 API');

  const profile = info.profile;
  if (!profile || typeof profile !== 'object' ||
      String(profile.characterName ?? '').trim().normalize('NFC') !== name ||
      Number(profile.serverId) !== id ||
      Number(profile.raceId) !== race) {
    throw new OfficialAionLookupError('공식 상세 정보의 캐릭터명·서버·종족이 검색 조건과 일치하지 않습니다.');
  }

  const className = typeof profile.className === 'string' ? profile.className.trim() : '';
  const itemStat = info.stat?.statList?.find(item => item?.type === 'ItemLevel');
  const itemLevel = Number(itemStat?.value);
  const combatPower = Number(profile.combatPower);

  // 없는 값을 0, 1 또는 기본 직업으로 채우지 않습니다.
  if (!className || className.length > 40 ||
      !Number.isSafeInteger(itemLevel) || itemLevel <= 0 || itemLevel > 1000000 ||
      !Number.isFinite(combatPower) || combatPower <= 0 || combatPower > 1000000000) {
    throw new OfficialAionLookupError('공식 API의 직업·아이템 레벨·전투력 값이 누락되거나 올바르지 않습니다.');
  }

  return {
    className,
    itemLevel,
    naddolK: Math.round(combatPower / 100) / 10 // 600596 -> 600.6 (k)
  };
}
