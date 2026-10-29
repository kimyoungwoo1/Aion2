const $ = id => document.getElementById(id);
let user = null;
let characters = [];
let editId = null;
let servers = [];
const serverById = new Map();
const DEFAULT_SERVER_ID = 2003; // 트리니엘

function populateServerSelect(selectedId = DEFAULT_SERVER_ID) {
  const select = $('serverId');
  select.replaceChildren();
  select.add(new Option('서버를 선택하세요', ''));
  for (const faction of ['마족', '천족']) {
    const group = document.createElement('optgroup');
    group.label = faction;
    for (const server of servers.filter(item => item.faction === faction)) {
      group.append(new Option(server.name, String(server.id)));
    }
    select.append(group);
  }
  if (selectedId != null && !serverById.has(Number(selectedId))) {
    // 과거 데이터에 매핑되지 않은 서버가 있어도 기존 선택값을 잃지 않음
    select.add(new Option('기존 서버 (목록에 없음)', String(selectedId)));
  }
  select.value = selectedId != null ? String(selectedId) : '';
}

async function loadServers() {
  const result = await api('/api/servers');
  servers = result.servers || [];
  serverById.clear();
  servers.forEach(server => serverById.set(Number(server.id), server));
  if (!servers.length) throw new Error('서버 목록을 불러오지 못했습니다.');
  populateServerSelect();
}


async function api(path, method = 'GET', body) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body !== undefined ? {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    } : {})
  });
  let result;
  try { result = await response.json(); }
  catch { throw new Error('서버 응답을 읽지 못했습니다.'); }
  if (!response.ok) throw new Error(result.error || '요청에 실패했습니다.');
  return result;
}

function showApp(nickname) {
  user = { nickname };
  resetHomeworkView();
  $('loginView').hidden = true;
  $('appView').hidden = false;
  $('logout').hidden = false;
  $('currentNick').textContent = `${nickname} 님`;
}

function showLogin() {
  user = null;
  resetHomeworkView();
  $('loginView').hidden = false;
  $('appView').hidden = true;
  $('logout').hidden = true;
  $('currentNick').textContent = '';
}

function addCell(row, value) {
  const cell = row.insertCell();
  cell.textContent = String(value ?? '');
  return cell;
}

function resetForm() {
  editId = null;
  $('characterForm').reset();
  if (servers.length) populateServerSelect();
  $('formTitle').textContent = '캐릭터 등록';
  $('saveCharacter').textContent = '조회 후 캐릭터 등록';
  $('cancelEdit').hidden = true;
  $('characterMessage').textContent = '';
}

function editCharacter(character) {
  editId = character.id;
  $('characterName').value = character.character_name;
  if (servers.length) populateServerSelect(character.server_id);
  $('formTitle').textContent = '캐릭터 수정';
  $('saveCharacter').textContent = '조회 후 변경 저장';
  $('cancelEdit').hidden = false;
  $('characterMessage').textContent = '';
  $('characterName').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteCharacter(character) {
  if (!confirm(`${character.character_name} 캐릭터를 삭제할까요?`)) return;
  try {
    await api(`/api/characters/${character.id}`, 'DELETE');
    if (editId === character.id) resetForm();
    await loadCharacters();
  } catch (error) {
    $('characterMessage').textContent = error.message;
  }
}

async function refreshCharacter(character, button) {
  button.disabled = true;
  const message = $('characterMessage');
  message.textContent = `${character.character_name} 전투력 갱신 중...`;
  try {
    await api(`/api/characters/${character.id}/refresh`, 'POST');
    await loadCharacters();
    message.textContent = `${character.character_name} 전투력 갱신 완료`;
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

// 로그인 닉네임과 캐릭터 소유자를 같은 규칙으로 비교한다.
function nicknameKey(value) {
  return String(value ?? '').trim().normalize('NFC').toLocaleLowerCase('ko-KR');
}

// 내 캐릭터가 있으면 우선 표시, 그 외에는 가나다순으로 정렬한다.
// 내 캐릭터가 없다면 모두 가나다순으로 정렬한다.
function orderedCharacters(items, currentNickname) {
  const mine = nicknameKey(currentNickname);
  const compare = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'ko-KR', {
    sensitivity: 'base', numeric: true
  });
  return [...items].sort((a, b) => {
    const aMine = Boolean(mine) && nicknameKey(a.owner_name) === mine;
    const bMine = Boolean(mine) && nicknameKey(b.owner_name) === mine;
    if (aMine !== bMine) return aMine ? -1 : 1;
    return compare(a.owner_name, b.owner_name)
      || compare(a.character_name, b.character_name)
      || compare(a.server_id, b.server_id)
      || Number(a.id) - Number(b.id);
  });
}

// 파티 편성에서는 해당 고정 참여자 이름으로 등록된 캐릭터만 선택한다.
function charactersForParticipant(items, participantNickname) {
  const owner = nicknameKey(participantNickname);
  if (!owner) return [];
  return items.filter(c => nicknameKey(c.owner_name) === owner)
    .sort((a, b) => String(a.character_name).localeCompare(String(b.character_name), 'ko-KR', {
      sensitivity: 'base', numeric: true
    }));
}

function renderCharacters() {
  $('characterCount').textContent = characters.length;
  $('ownerCount').textContent = new Set(characters.map(item => item.owner_name)).size;
  $('classCount').textContent = new Set(characters.map(item => item.class_name)).size;
  const body = $('characterRows');
  body.replaceChildren();
  if (!characters.length) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = 9;
    cell.textContent = '등록된 캐릭터가 없습니다. 캐릭터명과 서버를 선택해 등록해 보세요.';
    return;
  }
  for (const item of orderedCharacters(characters, user?.nickname)) {
    const row = body.insertRow();
    if (nicknameKey(item.owner_name) === nicknameKey(user?.nickname)) {
      row.classList.add('my-character-row');
    }
    addCell(row, item.owner_name);
    addCell(row, item.character_name);
    addCell(row, serverById.get(Number(item.server_id))?.name || '서버 확인 필요');
    addCell(row, item.class_name);
    addCell(row, Number(item.item_level).toLocaleString('ko-KR'));
    addCell(row, `${Number(item.naddol_k).toLocaleString('ko-KR', {maximumFractionDigits:2})}k`);
    addCell(row, item.synced_at
      ? new Date(item.synced_at * 1000).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'})
      : '미조회 (기존 등록)');
    addCell(row, item.updated_by);
    const controls = row.insertCell();
    const refresh = document.createElement('button');
    refresh.className = 'secondary small';
    refresh.textContent = '전투력 갱신';
    refresh.addEventListener('click', () => refreshCharacter(item, refresh));
    const edit = document.createElement('button');
    edit.className = 'secondary small';
    edit.textContent = '수정';
    edit.style.marginLeft = '6px';
    edit.addEventListener('click', () => editCharacter(item));
    const del = document.createElement('button');
    del.className = 'danger small';
    del.textContent = '삭제';
    del.style.marginLeft = '6px';
    del.addEventListener('click', () => deleteCharacter(item));
    controls.append(refresh, edit, del);
  }
}

async function loadCharacters() {
  const response = await api('/api/characters');
  characters = response.characters;
  renderCharacters();
}

$('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('loginForm').querySelector('button[type=submit]');
  button.disabled = true;
  $('loginMessage').textContent = '';
  try {
    const response = await api('/api/login', 'POST', {
      nickname: $('nickname').value.trim(),
      accessCode: $('accessCode').value
    });
    $('accessCode').value = '';
    showApp(response.nickname);
    await loadServers();
    await loadCharacters();
  } catch (error) {
    (user ? $('characterMessage') : $('loginMessage')).textContent = error.message;
  } finally { button.disabled = false; }
});

$('logout').addEventListener('click', async () => {
  try {
    await api('/api/logout', 'POST');
    resetForm();
    showLogin();
  } catch (error) { $('characterMessage').textContent = error.message; }
});

$('characterForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = $('saveCharacter');
  button.disabled = true;
  $('characterMessage').textContent = '캐릭터 정보 조회 및 저장 중...';
  try {
    const payload = {
      characterName: $('characterName').value.trim(),
      serverId: Number($('serverId').value)
    };
    await api(editId === null ? '/api/characters' : `/api/characters/${editId}`,
      editId === null ? 'POST' : 'PUT', payload);
    resetForm();
    await loadCharacters();
    $('characterMessage').textContent = '캐릭터 정보 조회 및 저장 완료';
  } catch (error) {
    $('characterMessage').textContent = error.message;
  } finally { button.disabled = false; }
});

$('cancelEdit').addEventListener('click', resetForm);
$('refresh').addEventListener('click', () => loadCharacters().catch(error => {
  $('characterMessage').textContent = error.message;
}));

(async () => {
  try {
    const response = await api('/api/me');
    showApp(response.nickname);
    await loadServers();
    await loadCharacters();
  } catch (error) {
    if (user) $('characterMessage').textContent = error.message;
    else showLogin();
  }
})();


// =====================================================
// 성역 일정: 4 델트라스 / 3 무스펠 / 2 침식 독립 관리
// =====================================================
const sanctuaryNames = { '4': '4성역 · 델트라스', '3': '3성역 · 무스펠', '2': '2성역 · 침식' };
const weekDayNames = ['수', '목', '금', '토', '일', '월', '화'];
const availabilityLabels = { '': '미입력', am: '오전 가능', pm: '오후 가능', yes: '가능', no: '불가능' };
const availabilityInputOptions = [['', '미입력'], ['am', '오전 가능'], ['pm', '오후 가능'], ['yes', '가능'], ['no', '불가능']];
let activeSection = 'characters';
let activeWeek = wednesdayFor(seoulResetDay());
let sanctuaryRows = [];
let sanctuaryIsMember = false;
let activeSanctuaryView = 'schedule';
let sanctuaryPartyRows = [];
const PARTY_MARKS = [['', '징표 없음'], ['1','1'], ['2','2'], ['3','3'], ['4','4'], ['5','5'], ['star','★ 별'], ['skull','☠ 해골'], ['moon','☾ 달']];
const PARTY_MARK_SYMBOLS = { '1':'1', '2':'2', '3':'3', '4':'4', '5':'5', star:'★', skull:'☠', moon:'☾' };
function appendMarkOptions(select) {
  for (const [value, label] of PARTY_MARKS) select.add(new Option(label, value));
}
function markText(value) { return PARTY_MARK_SYMBOLS[value] || ''; }
const FORCE_COUNT = 4;
const PARTIES_PER_FORCE = 2;
const PARTY_CAPACITY = 5;
const TOTAL_PARTIES = FORCE_COUNT * PARTIES_PER_FORCE;


// 한국시간 수요일 05:00을 주간 경계로 취급합니다.
// 05:00 이전의 수요일은 아직 직전 주입니다.
function seoulResetDay() {
  return new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
}
function shiftDay(date, days) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function wednesdayFor(date) {
  const d = new Date(date + 'T00:00:00Z');
  return shiftDay(date, -((d.getUTCDay() + 4) % 7));
}
function shortDate(date) {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
}
function weekDates() {
  return weekDayNames.map((_, idx) => shiftDay(activeWeek, idx));
}
function createAvailabilityEditor() {
  const container = $('scheduleEditor');
  container.replaceChildren();
  weekDates().forEach((date, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'availability-item';
    const label = document.createElement('label');
    label.htmlFor = `avail-${idx}`;
    label.textContent = `${weekDayNames[idx]} · ${shortDate(date)}`;
    const select = document.createElement('select');
    select.id = `avail-${idx}`;
    select.name = `day-${idx}`;
    for (const [value, text] of availabilityInputOptions) select.add(new Option(text, value));
    select.value = ''; // 아무 입력도 없는 주간 일정의 기본값은 반드시 미입력
    wrap.append(label, select);
    container.append(wrap);
  });
  const dates = weekDates();
  $('weekLabel').textContent = `${activeWeek} ~ ${dates[6]}`;
}
function getMyRow() {
  return sanctuaryRows.find(row => row.nickname.toLocaleLowerCase('ko-KR') === user.nickname.toLocaleLowerCase('ko-KR'));
}
// 각 요일에 실제로 가능 여부를 선택한 참여자만 비교한다.
// '미입력'은 제외하지만, 명시적으로 선택한 '불가능'은 계산에 포함한다.
// 선택한 사람이 0명이면 해당 요일을 추천하지 않는다.
function calculateCommonAvailability(rows) {
  const available = [];
  for (let day = 0; day < 7; day++) {
    const answered = rows
      .map(row => row.statuses?.[day] ?? '')
      .filter(status => ['yes', 'am', 'pm', 'no'].includes(status));
    if (answered.length === 0) continue;
    const morning = answered.every(status => status === 'yes' || status === 'am');
    const afternoon = answered.every(status => status === 'yes' || status === 'pm');
    const kind = morning && afternoon ? 'yes' : morning ? 'am' : afternoon ? 'pm' : '';
    if (kind) available.push({index:day, kind, responded:answered.length, total:rows.length});
  }
  return available;
}
function renderCommonDays(available, dates) {
  const target = $('allAvailableDays');
  target.replaceChildren();
  if (!available.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-days';
    empty.textContent = '일정을 입력한 참여자 기준으로 가능한 요일이 없습니다.';
    target.append(empty);
    return;
  }
  for (const entry of available) {
    const pill = document.createElement('span');
    pill.className = 'day-pill' + (entry.kind === 'pm' ? ' pm-only' : entry.kind === 'am' ? ' am-only' : '');
    const status = entry.kind === 'yes' ? '가능' : entry.kind === 'am' ? '오전' : '오후';
    const title = document.createElement('strong');
    title.textContent = `${weekDayNames[entry.index]}요일 ${shortDate(dates[entry.index])} (${status})`;
    const count = document.createElement('small');
    count.className = 'respondent-count';
    count.textContent = `${entry.responded}/${entry.total}명 입력 기준`;
    pill.append(title, count);
    target.append(pill);
  }
}

function renderSanctuary() {
  const mine = getMyRow();
  createAvailabilityEditor();
  const syncPanel = $('syncSchedulePanel');
  syncPanel.hidden = activeSection === '2';
  if (activeSection !== '2') {
    $('syncScheduleText').textContent = '4성역과 3성역에 공통으로 등록된 참여자의 가능 여부는 하나의 일정으로 관리됩니다. 어느 한쪽에서 저장하면 다른 탭에 별도 저장 없이 자동 반영됩니다. 비고는 성역별로 관리됩니다.';
  }
  $('scheduleNickname').textContent = `${user.nickname} 님`;
  const mineStatuses = mine?.statuses || Array(7).fill('');
  mineStatuses.forEach((status, index) => {
    const select = $(`avail-${index}`);
    select.value = status;
  });
  $('scheduleNote').value = mine?.note || '';
  $('saveSchedule').disabled = !sanctuaryIsMember;
  $('clearSchedule').disabled = !sanctuaryIsMember;
  if (!sanctuaryIsMember) {
    $('scheduleMessage').textContent = '현재 성역의 고정 명단에 없습니다. 아래 명단 관리에서 닉네임을 먼저 추가하세요.';
  } else if ($('scheduleMessage').textContent.startsWith('현재 성역의 고정 명단에')) {
    $('scheduleMessage').textContent = '';
  }
  $('scheduleCount').textContent = `고정 참여 ${sanctuaryRows.length}명`;
  $('memberCount').textContent = `${sanctuaryRows.length}명`;
  const chips = $('memberChips');
  chips.replaceChildren();
  for (const person of sanctuaryRows) {
    const chip = document.createElement('span');
    chip.className = 'member-chip';
    chip.append(document.createTextNode(person.nickname));
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '×';
    button.title = `${person.nickname} 명단에서 제외`;
    button.addEventListener('click', () => removeMember(person.nickname));
    chip.append(button);
    chips.append(chip);
  }
  const summary = $('scheduleSummary');
  summary.replaceChildren();
  weekDates().forEach((date, idx) => {
    const yes = sanctuaryRows.filter(row => row.statuses[idx] === 'yes').length;
    const am = sanctuaryRows.filter(row => row.statuses[idx] === 'am').length;
    const pm = sanctuaryRows.filter(row => row.statuses[idx] === 'pm').length;
    const no = sanctuaryRows.filter(row => row.statuses[idx] === 'no').length;
    const tile = document.createElement('div');
    const day = document.createElement('div');
    day.className = 'sumdate';
    day.textContent = `${weekDayNames[idx]} ${shortDate(date)}`;
    const content = document.createElement('div');
    content.className = 'sumcount';
    const morning = document.createElement('div');
    morning.textContent = `오전: ${yes + am}명`;
    const afternoon = document.createElement('div');
    afternoon.textContent = `오후: ${yes + pm}명`;
    content.append(morning, afternoon);
    if (no) {
      const unavailable = document.createElement('div');
      unavailable.className = 'sum-unavailable';
      unavailable.textContent = `불가능: ${no}명`;
      content.append(unavailable);
    }
    tile.append(day, content);
    summary.append(tile);
  });
  renderCommonDays(calculateCommonAvailability(sanctuaryRows), weekDates());
  const body = $('scheduleRows');
  body.replaceChildren();
  if (!sanctuaryRows.length) {
    const cell = body.insertRow().insertCell();
    cell.colSpan = 10;
    cell.textContent = '고정 참여자가 없습니다. 위 명단 관리에서 참여자를 추가해 주세요.';
  }
  for (const person of sanctuaryRows) {
    const row = body.insertRow();
    if (person.nickname.toLocaleLowerCase('ko-KR') === user.nickname.toLocaleLowerCase('ko-KR')) row.className = 'mine-row';
    addCell(row, person.nickname);
    person.statuses.forEach(status => {
      const cell = addCell(row, availabilityLabels[status] || '미입력');
      cell.className = 'schedule-cell ' + ({yes:'status-yes',am:'status-am',pm:'status-pm',no:'status-no'}[status] || '');
    });
    addCell(row, person.note || '-');
    addCell(row, person.updatedAt ? new Date(person.updatedAt * 1000).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'}) : '-');
  }
}
async function loadSanctuary() {
  if (!user || !['4','3','2'].includes(activeSection)) return;
  syncCurrentWeek();
  const sectionWhenRequested = activeSection;
  const weekWhenRequested = activeWeek;
  const query = new URLSearchParams({ sanctuary: sectionWhenRequested, weekStart: weekWhenRequested });
  const result = await api('/api/sanctuary?' + query.toString());
  if (activeSection !== sectionWhenRequested || activeWeek !== weekWhenRequested) return;
  sanctuaryRows = result.entries;
  sanctuaryIsMember = !!result.isMember;
  renderSanctuary();
}
async function switchSection(section) {
  activeSection = section;
  document.body.classList.toggle('homework-mode', section === 'homework');
  document.querySelectorAll('[data-section]').forEach(button => {
    button.classList.toggle('active', button.dataset.section === section);
    button.setAttribute('aria-selected', button.dataset.section === section ? 'true' : 'false');
  });
  $('characterPanel').hidden = section !== 'characters';
  $('sanctuaryPanel').hidden = !['4','3','2'].includes(section);
  $('homeworkPanel').hidden = section !== 'homework';
  if (section === 'homework') {
    try { await loadHomework(); }
    catch(error) { $('hwMessage').textContent = error.message; }
    return;
  }
  if (section !== 'characters') {
    $('sanctuaryTitle').textContent = sanctuaryNames[section];
    $('scheduleMessage').textContent = '';
    updateSanctuaryView();
    try {
      await loadSanctuary();
      if (activeSanctuaryView === 'party') await loadPartyRoster();
    } catch (error) {
      (activeSanctuaryView === 'party' ? $('partyMessage') : $('scheduleMessage')).textContent = error.message;
    }
  }
}

document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => switchSection(button.dataset.section));
});
// 이번 주만 유지: 매주 수요일 오전 5시(KST)에 새 주차로 전환한다.
function syncCurrentWeek() {
  const current = wednesdayFor(seoulResetDay());
  if (current === activeWeek) return false;
  activeWeek = current;
  return true;
}
// 사이트를 수요일 오전 5시에도 계속 열어 놓았으면 다음 주로 전환한다.
setInterval(async () => {
  if (!syncCurrentWeek() || !user) return;
  if (['4','3','2'].includes(activeSection)) {
    try { await loadSanctuary(); } catch(e) { $('scheduleMessage').textContent = e.message; }
  }
  if (activeSection === 'homework') {
    try { await loadHomework(); } catch(e) { $('hwMessage').textContent = e.message; }
  }
}, 60000);
$('reloadSchedule').addEventListener('click', async () => {
  try { await loadSanctuary(); $('scheduleMessage').textContent = ''; }
  catch (error) { $('scheduleMessage').textContent = error.message; }
});
$('scheduleForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!user || activeSection === 'characters') return;
  const button = $('saveSchedule');
  button.disabled = true;
  $('scheduleMessage').textContent = '저장 중...';
  try {
    const result = await api('/api/sanctuary', 'POST', {
      sanctuary: activeSection,
      weekStart: activeWeek,
      statuses: weekDayNames.map((_, idx) => $(`avail-${idx}`).value),
      note: $('scheduleNote').value.trim()
    });
    await loadSanctuary();
    $('scheduleMessage').textContent = result.synced
      ? '참여 일정이 저장되고, 다른 성역의 요일별 일정도 동기화되었습니다.'
      : '참여 일정이 저장되었습니다.';
  } catch (error) { $('scheduleMessage').textContent = error.message; }
  finally { button.disabled = false; }
});
$('clearSchedule').addEventListener('click', async () => {
  if (!user || activeSection === 'characters') return;
  if (!sanctuaryIsMember) {
    $('scheduleMessage').textContent = '고정 명단에 있는 참여자만 수정할 수 있습니다.';
    return;
  }
  const confirmText = activeSection === '2'
    ? '이번 주 2성역 가능 여부를 초기화할까요? 고정 명단은 유지됩니다.'
    : '이번 주 가능 여부를 초기화할까요? 4성역과 3성역에 함께 반영되며 고정 명단은 유지됩니다.';
  if (!confirm(confirmText)) return;
  const button = $('clearSchedule');
  button.disabled = true;
  try {
    await api('/api/sanctuary', 'POST', {
      sanctuary: activeSection,
      weekStart: activeWeek,
      statuses: Array(7).fill(''),
      note: ''
    });
    await loadSanctuary();
    $('scheduleMessage').textContent = activeSection === '2' ? '이번 주 일정이 초기화되었습니다.' : '이번 주 가능 여부가 초기화되어 4·3성역에 함께 반영되었습니다.';
  } catch (error) { $('scheduleMessage').textContent = error.message; }
  finally { button.disabled = false; }
});

// 고정 참여 인원은 한 번 등록하면 모든 주차의 전체 참여 일정에 표시된다.
$('membersForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!user || activeSection === 'characters') return;
  const names = $('memberNames').value.split(/[,\n\r]+/).map(x => x.trim()).filter(Boolean);
  if (!names.length) {
    $('membersMessage').textContent = '추가할 참여자 닉네임을 입력해 주세요.';
    return;
  }
  const button = $('addMembers');
  button.disabled = true;
  $('membersMessage').textContent = '명단 등록 중...';
  try {
    await api('/api/sanctuary/members', 'POST', { sanctuary: activeSection, nicknames: names });
    $('memberNames').value = '';
    await loadSanctuary();
    $('membersMessage').textContent = '고정 명단에 등록했습니다. 다른 주차에도 자동으로 표시됩니다.';
  } catch (error) { $('membersMessage').textContent = error.message; }
  finally { button.disabled = false; }
});

async function removeMember(nickname) {
  if (!confirm(`${nickname} 님을 이 성역의 고정 명단에서 제외할까요? 다른 성역의 명단과 일정은 유지됩니다.`)) return;
  $('membersMessage').textContent = '명단 변경 중...';
  try {
    await api('/api/sanctuary/members', 'DELETE', { sanctuary: activeSection, nickname });
    await loadSanctuary();
    $('membersMessage').textContent = `${nickname} 님을 이 성역 명단에서 제외했습니다.`;
  } catch (error) { $('membersMessage').textContent = error.message; }
}

// =====================================================
// 성역별 고정 참여 캐릭터 / 독립 파티 편성
// =====================================================
function updateSanctuaryView() {
  $('sanctuaryScheduleView').hidden = activeSanctuaryView !== 'schedule';
  $('sanctuaryPartyView').hidden = activeSanctuaryView !== 'party';
  document.querySelectorAll('[data-sanctuary-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.sanctuaryView === activeSanctuaryView);
    button.setAttribute('aria-selected', String(button.dataset.sanctuaryView === activeSanctuaryView));
  });
}

document.querySelectorAll('[data-sanctuary-view]').forEach(button => {
  button.addEventListener('click', async () => {
    activeSanctuaryView = button.dataset.sanctuaryView;
    updateSanctuaryView();
    if (activeSanctuaryView === 'party') {
      try { await loadPartyRoster(); }
      catch (error) { $('partyMessage').textContent = error.message; }
    }
  });
});

async function loadPartyRoster() {
  if (!user || !['4','3','2'].includes(activeSection)) return;
  const requestedSection = activeSection;
  const result = await api('/api/sanctuary/roster?sanctuary=' + encodeURIComponent(requestedSection));
  if (activeSection !== requestedSection) return;
  sanctuaryPartyRows = result.members || [];
  if (rosterEditorSanctuary !== requestedSection) {
    rosterEditorSanctuary = requestedSection;
    rosterEditorOwner = '';
    rosterEditorCharacterId = null;
  }
  $('partyMessage').textContent = '';
  renderPartyRoster();
}

function memberInfo(member) {
  if (!member.character_id) return '캐릭터 연결 필요';
  const level = Number(member.item_level || 0).toLocaleString('ko-KR');
  const power = Number(member.naddol_k || 0).toLocaleString('ko-KR', { maximumFractionDigits:1 });
  return `${member.character_name} · ${member.class_name || '-'} · Lv ${level} · ${power}k`;
}

function partyPlace(member) {
  return member.party_number && member.slot_number ? `${member.party_number}:${member.slot_number}` : '';
}
function partyLabel(partyNumber) {
  return `${Math.ceil(partyNumber / PARTIES_PER_FORCE)}포스 · ${((partyNumber - 1) % PARTIES_PER_FORCE) + 1}파티`;
}

let rosterEditorOwner = '';
let rosterEditorCharacterId = null;
let rosterEditorSanctuary = '';

function renderPartyRoster() {
  const rows = sanctuaryPartyRows;
  const characterRows = rows.filter(row => row.character_id != null);
  const assigned = characterRows.filter(row => row.party_number != null);
  $('partyMemberTotal').textContent = `${characterRows.length}명`;
  $('partyAssignedTotal').textContent = `${assigned.length}명`;
  $('partyCountTotal').textContent = `${FORCE_COUNT}포스 · ${TOTAL_PARTIES}파티`;
  const times = characterRows.map(row => Number(row.synced_at) || 0).filter(Boolean);
  $('partyLastSynced').textContent = times.length
    ? `최근 전투력 갱신: ${new Date(Math.max(...times) * 1000).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'})}`
    : '전투력 갱신 정보 없음';

  const dist = new Map();
  characterRows.forEach(row => { if (row.class_name) dist.set(row.class_name, (dist.get(row.class_name) || 0) + 1); });
  const chips = $('rosterClassDistribution');
  chips.replaceChildren();
  [...dist.entries()].sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([name, total]) => {
    const el = document.createElement('span');
    el.className = 'class-chip';
    el.textContent = `${name} ${total}`;
    chips.append(el);
  });
  if (!dist.size) chips.textContent = '등록된 참여 캐릭터가 없습니다.';

  const container = $('rosterMembers');
  container.replaceChildren();
  if (!rows.length) {
    container.textContent = '고정 참여자가 없습니다. 참여 일정 탭에서 먼저 고정 참여자를 등록해 주세요.';
  }
  // 참여자 + 캐릭터 2단 드롭다운: 행이 무한히 길어지는 문제를 방지한다.
  // 선택값을 저장 뒤 새로고침할 때에도 유지하며, DB 저장은 실제 characterId 기준이다.
  const previousOwner = container.querySelector('#rosterOwnerSelect')?.value || rosterEditorOwner;
  const previousCharacter = container.querySelector('#rosterCharacterSelect')?.value || String(rosterEditorCharacterId || '');
  container.replaceChildren();
  const owners = [...new Set(rows.map(row => row.nickname))].sort((a, b) => {
    const aMine = nicknameKey(a) === nicknameKey(user?.nickname);
    const bMine = nicknameKey(b) === nicknameKey(user?.nickname);
    return aMine !== bMine ? (aMine ? -1 : 1) : a.localeCompare(b, 'ko-KR');
  });
  if (!owners.length) {
    container.textContent = '고정 참여자가 없습니다. 참여 일정에서 참여자를 먼저 등록해 주세요.';
  } else {
    const selectors = document.createElement('div');
    selectors.className = 'roster-picker';
    const ownerField = document.createElement('label');
    ownerField.textContent = '참여자 선택';
    const ownerSelect = document.createElement('select');
    ownerSelect.id = 'rosterOwnerSelect';
    ownerSelect.setAttribute('aria-label', '참여자 선택');
    owners.forEach(nick => {
      const count = rows.filter(row => nicknameKey(row.nickname) === nicknameKey(nick) && row.character_id != null).length;
      ownerSelect.add(new Option(`${nick} (${count}캐릭터)`, nick));
    });
    ownerSelect.value = owners.includes(previousOwner) ? previousOwner :
      (owners.find(name => nicknameKey(name) === nicknameKey(user?.nickname)) || owners[0]);
    ownerField.append(ownerSelect);

    const characterField = document.createElement('label');
    characterField.textContent = '캐릭터 선택';
    const characterSelect = document.createElement('select');
    characterSelect.id = 'rosterCharacterSelect';
    characterSelect.setAttribute('aria-label', '수정할 캐릭터 선택');
    characterField.append(characterSelect);
    selectors.append(ownerField, characterField);
    const editor = document.createElement('div');
    editor.id = 'rosterSingleEditor';
    editor.className = 'roster-single-editor';
    container.append(selectors, editor);

    function showChosenCharacter() {
      editor.replaceChildren();
      const member = rows.find(row => String(row.character_id) === characterSelect.value &&
        nicknameKey(row.nickname) === nicknameKey(ownerSelect.value));
      if (!member) {
        editor.textContent = '해당 참여자의 등록 캐릭터가 없습니다. 캐릭터 관리에서 먼저 등록해 주세요.';
        rosterEditorCharacterId = null;
        return;
      }
      rosterEditorCharacterId = member.character_id;
      const taken = new Set(characterRows.map(partyPlace).filter(Boolean));
      const wrap = document.createElement('div');
      wrap.className = 'roster-single-body';
      const info = document.createElement('div');
      info.className = 'roster-single-info';
      const title = document.createElement('strong');
      title.textContent = member.character_name;
      const summary = document.createElement('span');
      const place = partyPlace(member);
      summary.textContent = `${member.class_name || '-'} · Lv ${Number(member.item_level || 0).toLocaleString('ko-KR')} · ${Number(member.naddol_k || 0).toLocaleString('ko-KR', {maximumFractionDigits:1})}k · ${place ? `${partyLabel(member.party_number)} · ${member.slot_number}번` : '미배정'}`;
      info.append(title, summary);
      const fields = document.createElement('div');
      fields.className = 'roster-single-fields';
      const partyField = document.createElement('label');
      partyField.textContent = '파티 위치';
      const partySelect = document.createElement('select');
      partySelect.setAttribute('aria-label', member.character_name + ' 파티 위치');
      partySelect.add(new Option('미배정', ''));
      for (let party = 1; party <= TOTAL_PARTIES; party++) {
        for (let slot = 1; slot <= PARTY_CAPACITY; slot++) {
          const value = `${party}:${slot}`;
          if (taken.has(value) && partyPlace(member) !== value) continue;
          partySelect.add(new Option(`${partyLabel(party)} · ${slot}번`, value));
        }
      }
      partySelect.value = partyPlace(member);
      partyField.append(partySelect);
      const markerField = document.createElement('label');
      markerField.textContent = '징표';
      const markSelect = document.createElement('select');
      markSelect.setAttribute('aria-label', member.character_name + ' 징표');
      appendMarkOptions(markSelect);
      markSelect.value = member.member_marker || '';
      markerField.append(markSelect);
      const noteField = document.createElement('label');
      noteField.textContent = '캐릭터 비고';
      const characterNote = document.createElement('input');
      characterNote.type = 'text';
      characterNote.maxLength = 150;
      characterNote.value = member.character_note || '';
      characterNote.placeholder = '예: 1넴 징표 담당';
      characterNote.setAttribute('aria-label', member.character_name + ' 캐릭터 비고');
      noteField.append(characterNote);
      fields.append(partyField, markerField, noteField);
      const saveAssignment = document.createElement('button');
      saveAssignment.type = 'button';
      saveAssignment.className = 'primary roster-single-save';
      saveAssignment.textContent = '변경사항 저장';
      saveAssignment.setAttribute('aria-label', member.character_name + ' 파티·징표·비고 저장');
      saveAssignment.addEventListener('click', async () => {
        const [p, slot] = partySelect.value ? partySelect.value.split(':').map(Number) : [null, null];
        rosterEditorOwner = ownerSelect.value;
        rosterEditorCharacterId = member.character_id;
        await updatePartySetting('/api/sanctuary/roster/assignment', {
          sanctuary: activeSection,
          nickname: member.nickname,
          characterId: member.character_id,
          partyNumber: p, slotNumber: slot,
          marker: markSelect.value,
          note: characterNote.value
        }, saveAssignment);
      });
      wrap.append(info, fields, saveAssignment);
      editor.append(wrap);
    }
    function populateChosenOwner(preferredCharacter = '') {
      rosterEditorOwner = ownerSelect.value;
      const mine = rows.filter(row => nicknameKey(row.nickname) === nicknameKey(ownerSelect.value) && row.character_id != null);
      characterSelect.replaceChildren();
      for (const member of mine) {
        const server = serverById.get(Number(member.server_id))?.name || '서버 미확인';
        characterSelect.add(new Option(`${member.character_name} · ${server} (${member.class_name || '-'})`, String(member.character_id)));
      }
      characterSelect.disabled = mine.length === 0;
      characterSelect.value = mine.some(row => String(row.character_id) === String(preferredCharacter))
        ? String(preferredCharacter) : (mine[0] ? String(mine[0].character_id) : '');
      showChosenCharacter();
    }
    ownerSelect.addEventListener('change', () => populateChosenOwner());
    characterSelect.addEventListener('change', showChosenCharacter);
    populateChosenOwner(previousCharacter);
  }

  const cards = $('partyCards');
  cards.replaceChildren();
  for (let force = 1; force <= FORCE_COUNT; force++) {
    const forceMembers = rows.filter(row =>
      row.party_number != null && Math.ceil(Number(row.party_number) / PARTIES_PER_FORCE) === force);
    // 빈 포스는 접힌 상태로 보여 주되 클릭하면 항상 펼칠 수 있다.
    const forceCard = document.createElement('details');
    forceCard.className = 'force-card' + (forceMembers.length ? ' has-members' : ' is-empty-force');
    forceCard.open = forceMembers.length > 0;
    const head = document.createElement('summary');
    head.className = 'force-title';
    const forceName = document.createElement('strong');
    forceName.textContent = `${force}포스`;
    const forceMeta = document.createElement('span');
    forceMeta.className = 'force-meta';
    forceMeta.textContent = `${forceMembers.length} / ${PARTIES_PER_FORCE * PARTY_CAPACITY}명`;
    head.append(forceName, forceMeta);
    forceCard.append(head);

    const parties = document.createElement('div');
    parties.className = 'force-parties';
    for (let withinForce = 1; withinForce <= PARTIES_PER_FORCE; withinForce++) {
      const party = (force - 1) * PARTIES_PER_FORCE + withinForce;
      const members = forceMembers
        .filter(row => Number(row.party_number) === party)
        .sort((a, b) => Number(a.slot_number) - Number(b.slot_number));
      const card = document.createElement('section');
      card.className = 'party-card' + (members.length ? ' party-populated' : ' party-empty');
      const heading = document.createElement('div');
      heading.className = 'party-heading';
      const title = document.createElement('h3');
      title.textContent = `${withinForce}파티`;
      const count = document.createElement('span');
      count.className = 'party-member-count';
      count.textContent = `${members.length}/${PARTY_CAPACITY}명`;
      heading.append(title, count);
      card.append(heading);

      if (members.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'party-empty-hint';
        empty.textContent = '배정된 캐릭터 없음';
        card.append(empty);
      }
      for (const member of members) {
        const line = document.createElement('div');
        line.className = 'party-entry';
        const slotNumber = document.createElement('span');
        slotNumber.className = 'party-entry-slot';
        slotNumber.textContent = String(member.slot_number);
        const body = document.createElement('div');
        body.className = 'party-entry-body';
        const top = document.createElement('div');
        top.className = 'party-entry-top';
        const who = document.createElement('div');
        who.className = 'party-entry-who';
        if (markText(member.member_marker)) {
          const marker = document.createElement('span');
          marker.className = 'assigned-marker';
          marker.textContent = markText(member.member_marker);
          marker.setAttribute('aria-label', `징표 ${PARTY_MARKS.find(([value]) => value === member.member_marker)?.[1] || member.member_marker}`);
          who.append(marker);
        }
        // 파티 편성에는 고정 참여자(소유자)의 닉네임이 아닌
        // 실제 연결/선택된 캐릭터명을 보여준다.
        const characterName = document.createElement('strong');
        characterName.textContent = member.character_id && member.character_name
          ? member.character_name : '캐릭터 미연결';
        who.append(characterName);
        const role = document.createElement('span');
        role.className = 'party-entry-role';
        role.textContent = member.class_name || '직업 미확인';
        top.append(who, role);
        body.append(top);
        if (member.character_id) {
          const stats = document.createElement('div');
          stats.className = 'party-entry-stats';
          const level = Number(member.item_level || 0).toLocaleString('ko-KR');
          const power = Number(member.naddol_k || 0).toLocaleString('ko-KR', {maximumFractionDigits:1});
          stats.textContent = `Lv ${level} · ${power}k`;
          body.append(stats);
        } else {
          const missing = document.createElement('div');
          missing.className = 'party-entry-stats';
          missing.textContent = '캐릭터 연결 필요';
          body.append(missing);
        }
        if (member.character_note?.trim()) {
          const note = document.createElement('div');
          note.className = 'party-entry-note';
          note.textContent = member.character_note.trim();
          body.append(note);
        }
        line.append(slotNumber, body);
        card.append(line);
      }
      if (members.length && members.length < PARTY_CAPACITY) {
        const remaining = document.createElement('div');
        remaining.className = 'party-remaining';
        remaining.textContent = `빈자리 ${PARTY_CAPACITY - members.length}명`;
        card.append(remaining);
      }
      parties.append(card);
    }
    forceCard.append(parties);
    cards.append(forceCard);
  }
}

async function updatePartySetting(path, payload, control) {
  control.disabled = true;
  $('partyMessage').textContent = '저장 중...';
  try {
    const section = activeSection;
    await api(path,'POST',payload);
    if (activeSection === section) await loadPartyRoster();
    $('partyMessage').textContent='편성이 저장되었습니다.';
  } catch (error) {
    $('partyMessage').textContent=error.message;
    try { await loadPartyRoster(); }
    catch { /* 최초 오류 메시지는 보존 */ }
    $('partyMessage').textContent=error.message;
  } finally { control.disabled = false; }
}

$('reloadPartyRoster').addEventListener('click', async ()=> {
  try { await loadPartyRoster(); }
  catch(error){ $('partyMessage').textContent=error.message; }
});


// =====================================================
// 닉네임별 숙제: 로그인 세션의 닉네임 기준으로 서버가 필터링
// =====================================================
let homeworkData = null;
function resetHomeworkView() {
  homeworkData = null;
  $('hwTableView').hidden = true;
  $('hwRows').replaceChildren();
  $('hwMessage').textContent = '';
}
async function loadHomework() {
  if (!user) return;
  $('hwCurrentNick').textContent = `${user.nickname} 님의 숙제`;
  $('hwTableView').hidden = false;
  const result = await api('/api/homework');
  homeworkData = result;
  renderHomework();
}
function renderHomework() {
  if (!homeworkData) return;
  const rows = homeworkData.characters || [];
  const tasks = homeworkData.tasks || [];
  const completed = rows.reduce((sum, ch) => sum + ch.completed.length, 0);
  const possible = rows.length * tasks.length;
  $('hwCharacterCount').textContent = String(rows.length);
  $('hwCompletedCount').textContent = `${completed} / ${possible}`;
  $('hwCompletedPercent').textContent = `${possible ? Math.round(completed / possible * 100) : 0}%`;
  $('hwWeekLabel').textContent = `${homeworkData.weekStart} 시작 주간 · 일반 숙제: 수요일 05:00 · 어비스회랑: 수·토 21:00 초기화`;
  const tbody = $('hwRows');
  tbody.replaceChildren();
  if (!rows.length) {
    const row = tbody.insertRow();
    const cell = row.insertCell(); cell.colSpan = 15;
    cell.textContent = '내 캐릭터가 등록되어 있지 않습니다. 캐릭터 관리에서 소유자 닉네임으로 캐릭터를 등록해 주세요.';
  }
  for (const character of rows) {
    const row = tbody.insertRow();
    addCell(row, character.name);
    addCell(row, character.className || '-');
    addCell(row, Number(character.itemLevel || 0).toLocaleString('ko-KR'));
    addCell(row, `${Number(character.naddolK || 0).toLocaleString('ko-KR', {maximumFractionDigits:1})}k`);
    // 오드1/오드2는 캐릭터·주차별 입력값. 변경 시 서버에 자동 저장한다.
    const od1Cell = row.insertCell();
    const od2Cell = row.insertCell();
    const sumCell = row.insertCell();
    const odValues = {od1: character.od1, od2: character.od2};
    const displaySum = () => {
      const sum = Number(odValues.od1 || 0) + Number(odValues.od2 || 0);
      sumCell.textContent = sum.toLocaleString('ko-KR');
    };
    for (const [field, cell] of [['od1', od1Cell], ['od2', od2Cell]]) {
      const input = document.createElement('input');
      input.type = 'number';
      input.inputMode = 'numeric';
      input.min = '0';
      input.max = '999999999';
      input.step = '1';
      input.className = 'hw-od-input';
      input.value = character[field] == null ? '' : String(character[field]);
      input.placeholder = '—';
      input.setAttribute('aria-label', `${character.name} ${field === 'od1' ? '오드1' : '오드2'} 입력`);
      const updateSumDraft = () => {
        odValues[field] = input.value === '' ? null : Number(input.value);
        if (Number.isFinite(Number(odValues[field]))) displaySum();
      };
      input.addEventListener('input', updateSumDraft);
      input.addEventListener('keydown', event => { if (event.key === 'Enter') input.blur(); });
      input.addEventListener('change', async () => {
        const original = character[field];
        const next = input.value === '' ? null : Number(input.value);
        if (next === original) return;
        if (next != null && (!Number.isSafeInteger(next) || next < 0 || next > 999999999)) {
          $('hwMessage').textContent = '오드 수량은 0 이상의 정수로 입력해 주세요.';
          input.value = original == null ? '' : String(original);
          odValues[field] = original;
          displaySum();
          return;
        }
        input.disabled = true;
        $('hwMessage').textContent = '오드 수량 저장 중...';
        try {
          const result = await api('/api/homework/od','POST', {
            characterId:character.id,field,value:next
          });
          character[field] = result[field];
          odValues[field] = result[field];
          input.value = character[field] == null ? '' : String(character[field]);
          displaySum();
          $('hwMessage').textContent = `${character.name} · ${field === 'od1' ? '오드1' : '오드2'} 저장 완료`;
        } catch (error) {
          input.value = original == null ? '' : String(original);
          odValues[field] = original;
          displaySum();
          $('hwMessage').textContent = error.message;
        } finally { input.disabled = false; }
      });
      cell.append(input);
    }
    sumCell.className = 'hw-od-total';
    displaySum();
    for (const task of tasks) {
      const cell = row.insertCell();
      const button = document.createElement('button');
      const done = character.completed.includes(task.key);
      button.type = 'button';
      button.className = 'hw-toggle' + (done ? ' done' : '');
      button.textContent = done ? '완료' : '미완료';
      button.setAttribute('aria-label', `${character.name} ${task.label}: ${done ? '완료' : '미완료'}`);
      button.addEventListener('click', async () => {
        button.disabled = true;
        $('hwMessage').textContent = '저장 중...';
        try {
          await api('/api/homework','POST', {characterId:character.id,taskKey:task.key,completed:!done});
          if (activeSection === 'homework') await loadHomework();
          $('hwMessage').textContent = `${character.name} · ${task.label} 저장 완료`;
        } catch(e) { $('hwMessage').textContent = e.message; }
        finally { button.disabled = false; }
      });
      cell.append(button);
    }
  }
}
$('hwReload').addEventListener('click', async () => {
  try { await loadHomework(); }
  catch(error) { $('hwMessage').textContent = error.message; }
});
