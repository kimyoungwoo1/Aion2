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
  for (const item of characters) {
    const row = body.insertRow();
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
let sanctuaryPartyCharacters = [];
let sanctuaryPartyDetails = [];
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
// 같은 성역의 전원이 특정 시간에 참여할 수 있어야만 표시한다.
// 오전: '가능' 또는 '오전 가능' / 오후: '가능' 또는 '오후 가능'.
// 오전과 오후 모두 가능할 때만 '가능'으로 표시하며, 시간대가 엇갈리면 제외한다.
function calculateCommonAvailability(rows) {
  const available = [];
  if (!rows.length) return available;
  for (let day = 0; day < 7; day++) {
    const statuses = rows.map(row => row.statuses[day]);
    const morning = statuses.every(status => status === 'yes' || status === 'am');
    const afternoon = statuses.every(status => status === 'yes' || status === 'pm');
    if (morning && afternoon) available.push({index:day, kind:'yes'});
    else if (morning) available.push({index:day, kind:'am'});
    else if (afternoon) available.push({index:day, kind:'pm'});
  }
  return available;
}
function renderCommonDays(available, dates) {
  const target = $('allAvailableDays');
  target.replaceChildren();
  if (!available.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-days';
    empty.textContent = '다같이 가능한 요일이 없습니다.';
    target.append(empty);
    return;
  }
  for (const entry of available) {
    const pill = document.createElement('span');
    pill.className = 'day-pill' + (entry.kind === 'pm' ? ' pm-only' : entry.kind === 'am' ? ' am-only' : '');
    const status = entry.kind === 'yes' ? '가능' : entry.kind === 'am' ? '오전' : '오후';
    pill.textContent = `${weekDayNames[entry.index]}요일 ${shortDate(dates[entry.index])} (${status})`;
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
    const notEntered = sanctuaryRows.filter(row => row.statuses[idx] === '').length;
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
    const unavailable = document.createElement('div');
    unavailable.textContent = `미입력: ${notEntered}명` + (no ? ` · 불가: ${no}명` : '');
    content.append(morning, afternoon, unavailable);
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
  sanctuaryPartyCharacters = result.characters || [];
  sanctuaryPartyDetails = result.parties || [];
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

function renderPartyRoster() {
  const rows = sanctuaryPartyRows;
  const assigned = rows.filter(row => row.party_number != null);
  $('partyMemberTotal').textContent = `${rows.length}명`;
  $('partyAssignedTotal').textContent = `${assigned.length}명`;
  $('partyCountTotal').textContent = `${FORCE_COUNT}포스 · ${TOTAL_PARTIES}파티`;
  const times = rows.map(row => Number(row.synced_at) || 0).filter(Boolean);
  $('partyLastSynced').textContent = times.length
    ? `최근 전투력 갱신: ${new Date(Math.max(...times) * 1000).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'})}`
    : '전투력 갱신 정보 없음';

  const dist = new Map();
  rows.forEach(row => { if (row.class_name) dist.set(row.class_name, (dist.get(row.class_name) || 0) + 1); });
  const chips = $('rosterClassDistribution');
  chips.replaceChildren();
  [...dist.entries()].sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([name, total]) => {
    const el = document.createElement('span');
    el.className = 'class-chip';
    el.textContent = `${name} ${total}`;
    chips.append(el);
  });
  if (!dist.size) chips.textContent = '연결된 캐릭터가 없습니다.';

  const container = $('rosterMembers');
  container.replaceChildren();
  if (!rows.length) container.textContent = '고정 참여자가 없습니다. 참여 일정 탭에서 먼저 고정 참여자를 등록해 주세요.';
  const taken = new Set(rows.map(partyPlace).filter(Boolean));
  const heading = document.createElement('div');
  heading.className = 'roster-compact-header';
  for (const text of ['참여자', '캐릭터 선택', '파티 위치 · 징표 함께 배정']) {
    const item = document.createElement('span'); item.textContent = text; heading.append(item);
  }
  if (rows.length) container.append(heading);

  for (const member of rows) {
    const wrap = document.createElement('div');
    wrap.className = 'roster-compact-row';
    const identity = document.createElement('div');
    identity.className = 'roster-compact-identity';
    const name = document.createElement('strong');
    name.textContent = member.nickname;
    const detail = document.createElement('small');
    detail.textContent = member.character_id
      ? `${member.class_name || '-'} · ${Number(member.item_level || 0).toLocaleString('ko-KR')} · ${Number(member.naddol_k || 0).toLocaleString('ko-KR', {maximumFractionDigits:1})}k`
      : '캐릭터 연결 필요';
    identity.append(name, detail);

    const charSelect = document.createElement('select');
    charSelect.setAttribute('aria-label', member.nickname + ' 캐릭터 선택');
    charSelect.add(new Option('캐릭터 자동 연결', ''));
    sanctuaryPartyCharacters.forEach(c => {
      const serverName = serverById.get(Number(c.server_id))?.name || '서버 확인 필요';
      charSelect.add(new Option(`${c.character_name} · ${serverName} (${c.class_name})`, String(c.id)));
    });
    charSelect.value = member.character_id == null ? '' : String(member.character_id);
    charSelect.addEventListener('change', async () => {
      const chosen = charSelect.value ? Number(charSelect.value) : null;
      await updatePartySetting('/api/sanctuary/roster/character',
        {sanctuary:activeSection,nickname:member.nickname,characterId:chosen}, charSelect);
    });

    // 파티 위치와 징표를 한 번의 저장 요청으로 적용한다.
    // 서로 다른 onchange 요청이 목록을 다시 그리면서 선택값을 잃는 문제를 방지한다.
    const assignmentWrap = document.createElement('div');
    assignmentWrap.className = 'roster-assignment';
    const partySelect = document.createElement('select');
    partySelect.setAttribute('aria-label', member.nickname + ' 파티 위치');
    partySelect.add(new Option('미배정', ''));
    for (let party = 1; party <= TOTAL_PARTIES; party++) {
      for (let slot = 1; slot <= PARTY_CAPACITY; slot++) {
        const value = `${party}:${slot}`;
        if (taken.has(value) && partyPlace(member) !== value) continue;
        partySelect.add(new Option(`${partyLabel(party)} · ${slot}번`, value));
      }
    }
    partySelect.value = partyPlace(member);
    const markSelect = document.createElement('select');
    markSelect.setAttribute('aria-label', member.nickname + ' 징표');
    appendMarkOptions(markSelect);
    markSelect.value = member.member_marker || '';
    const saveAssignment = document.createElement('button');
    saveAssignment.type = 'button';
    saveAssignment.className = 'secondary small assignment-save';
    saveAssignment.textContent = '배정 저장';
    saveAssignment.setAttribute('aria-label', member.nickname + ' 파티 및 징표 함께 저장');
    saveAssignment.addEventListener('click', async () => {
      const [p, slot] = partySelect.value ? partySelect.value.split(':').map(Number) : [null, null];
      await updatePartySetting('/api/sanctuary/roster/assignment',
        {sanctuary:activeSection, nickname:member.nickname,
         partyNumber:p, slotNumber:slot, marker:markSelect.value}, saveAssignment);
    });
    assignmentWrap.append(partySelect, markSelect, saveAssignment);
    wrap.append(identity, charSelect, assignmentWrap);
    container.append(wrap);
  }

  const cards = $('partyCards');
  cards.replaceChildren();
  for (let force=1;force<=FORCE_COUNT;force++) {
    const forceCard = document.createElement('section');
    forceCard.className = 'force-card';
    const forceTitle = document.createElement('h3');
    forceTitle.className = 'force-title';
    const forceMembers = rows.filter(r => Math.ceil(Number(r.party_number) / PARTIES_PER_FORCE) === force);
    forceTitle.textContent = `${force}포스 · ${forceMembers.length}/${PARTIES_PER_FORCE * PARTY_CAPACITY}명`;
    forceCard.append(forceTitle);
    const parties = document.createElement('div');
    parties.className = 'force-parties';
    for (let withinForce=1;withinForce<=PARTIES_PER_FORCE;withinForce++) {
      const party = (force - 1) * PARTIES_PER_FORCE + withinForce;
      const card = document.createElement('div');
      card.className='party-card';
      const title = document.createElement('h3');
      const members = rows.filter(r=>Number(r.party_number)===party);
      title.textContent = `${withinForce}파티 · ${members.length}/${PARTY_CAPACITY}명`;
      card.append(title);
      const existingDetails = sanctuaryPartyDetails.find(p => Number(p.party_number) === party) || {};
      const partyFields = document.createElement('div');
      partyFields.className = 'party-edit-fields';
      const partyNoteWrap = document.createElement('label');
      partyNoteWrap.textContent = '파티 비고';
      const partyNote = document.createElement('input');
      partyNote.type = 'text';
      partyNote.maxLength = 150;
      partyNote.placeholder = '예: 1넴 징표 담당';
      partyNote.value = existingDetails.note || '';
      partyNote.setAttribute('aria-label', `${partyLabel(party)} 비고`);
      partyNoteWrap.append(partyNote);
      const saveParty = document.createElement('button');
      saveParty.type = 'button';
      saveParty.className = 'secondary small';
      saveParty.textContent = '비고 저장';
      saveParty.addEventListener('click', () => updatePartySetting(
        '/api/sanctuary/roster/party-details',
        {sanctuary:activeSection, partyNumber:party, note:partyNote.value}, saveParty));
      partyFields.append(partyNoteWrap,saveParty);
      card.append(partyFields);
      for (let slot=1;slot<=PARTY_CAPACITY;slot++) {
        const item = members.find(r=>Number(r.slot_number)===slot);
        const line = document.createElement('div');
        line.className = 'party-slot' + (item?'':' empty');
        const num = document.createElement('span');
        num.className='slot-num'; num.textContent=String(slot);
        const contents=document.createElement('div');
        contents.style.flex='1';
        const name=document.createElement('strong');
        name.textContent = item ? item.nickname : '빈 자리';
        if (item && markText(item.member_marker)) {
          const marker = document.createElement('span');
          marker.className = 'assigned-marker';
          marker.textContent = markText(item.member_marker);
          marker.setAttribute('aria-label', `징표 ${PARTY_MARKS.find(([value]) => value === item.member_marker)?.[1] || item.member_marker}`);
          contents.append(marker);
        }
        contents.append(name);
        if (item) {
          const desc=document.createElement('div');
          desc.className='slot-detail';
          desc.textContent=memberInfo(item);
          contents.append(desc);
        }
        line.append(num,contents);
        card.append(line);
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
    const cell = row.insertCell(); cell.colSpan = 12;
    cell.textContent = '내 캐릭터가 등록되어 있지 않습니다. 캐릭터 관리에서 소유자 닉네임으로 캐릭터를 등록해 주세요.';
  }
  for (const character of rows) {
    const row = tbody.insertRow();
    addCell(row, character.name);
    addCell(row, character.className || '-');
    addCell(row, Number(character.itemLevel || 0).toLocaleString('ko-KR'));
    addCell(row, `${Number(character.naddolK || 0).toLocaleString('ko-KR', {maximumFractionDigits:1})}k`);
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
