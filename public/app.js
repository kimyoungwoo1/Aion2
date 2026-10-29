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
  $('loginView').hidden = true;
  $('appView').hidden = false;
  $('logout').hidden = false;
  $('currentNick').textContent = `${nickname} 님`;
}

function showLogin() {
  user = null;
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
const weekDayNames = ['월', '화', '수', '목', '금', '토', '일'];
const availabilityLabels = { '': '미입력', yes: '가능', pm: '오후 가능', no: '불가능' };
let activeSection = 'characters';
let activeWeek = mondayFor(seoulToday());
let sanctuaryRows = [];
let sanctuaryIsMember = false;

function seoulToday() {
  return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
}
function shiftDay(date, days) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function mondayFor(date) {
  const d = new Date(date + 'T00:00:00Z');
  return shiftDay(date, -((d.getUTCDay() + 6) % 7));
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
    for (const [value, text] of Object.entries(availabilityLabels)) select.add(new Option(text, value));
    wrap.append(label, select);
    container.append(wrap);
  });
  const dates = weekDates();
  $('weekLabel').textContent = `${activeWeek} ~ ${dates[6]}`;
}
function getMyRow() {
  return sanctuaryRows.find(row => row.nickname.toLocaleLowerCase('ko-KR') === user.nickname.toLocaleLowerCase('ko-KR'));
}
// 현재 성역에 등록된 전원이 참여할 수 있는 요일을 계산한다.
// 미입력은 '가능'으로 간주하지 않아 과도한 참가 인원 표시를 방지한다.
function calculateCommonAvailability(rows) {
  const morning = [];
  const afternoon = [];
  if (!rows.length) return { morning, afternoon };
  for (let day = 0; day < 7; day++) {
    if (rows.every(row => row.statuses[day] === 'yes')) morning.push(day);
    if (rows.every(row => row.statuses[day] === 'yes' || row.statuses[day] === 'pm')) afternoon.push(day);
  }
  return { morning, afternoon };
}

function renderCommonDays(containerId, indices, dates) {
  const target = $(containerId);
  target.replaceChildren();
  if (!indices.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-days';
    empty.textContent = '없음';
    target.append(empty);
    return;
  }
  indices.forEach(idx => {
    const day = document.createElement('span');
    day.className = 'day-pill';
    day.textContent = `${weekDayNames[idx]} ${shortDate(dates[idx])}`;
    target.append(day);
  });
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
  mineStatuses.forEach((status, index) => { $(`avail-${index}`).value = status; });
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
    const pm = sanctuaryRows.filter(row => row.statuses[idx] === 'pm').length;
    const no = sanctuaryRows.filter(row => row.statuses[idx] === 'no').length;
    const tile = document.createElement('div');
    const day = document.createElement('div');
    day.className = 'sumdate';
    day.textContent = `${weekDayNames[idx]} ${shortDate(date)}`;
    const content = document.createElement('div');
    content.className = 'sumcount';
    const morning = document.createElement('div');
    morning.textContent = `오전: ${yes}명`;
    const afternoon = document.createElement('div');
    afternoon.textContent = `오후: ${yes + pm}명`;
    const unavailable = document.createElement('div');
    unavailable.textContent = `불가: ${no}명`;
    content.append(morning, afternoon, unavailable);
    tile.append(day, content);
    summary.append(tile);
  });
  const common = calculateCommonAvailability(sanctuaryRows);
  renderCommonDays('allAvailableMorning', common.morning, weekDates());
  renderCommonDays('allAvailableAfternoon', common.afternoon, weekDates());
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
      cell.className = 'schedule-cell ' + ({yes:'status-yes',pm:'status-pm',no:'status-no'}[status] || '');
    });
    addCell(row, person.note || '-');
    addCell(row, person.updatedAt ? new Date(person.updatedAt * 1000).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'}) : '-');
  }
}
async function loadSanctuary() {
  if (!user || activeSection === 'characters') return;
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
  document.querySelectorAll('[data-section]').forEach(button => {
    button.classList.toggle('active', button.dataset.section === section);
    button.setAttribute('aria-selected', button.dataset.section === section ? 'true' : 'false');
  });
  $('characterPanel').hidden = section !== 'characters';
  $('sanctuaryPanel').hidden = section === 'characters';
  if (section !== 'characters') {
    $('sanctuaryTitle').textContent = sanctuaryNames[section];
    $('scheduleMessage').textContent = '';
    try { await loadSanctuary(); }
    catch (error) { $('scheduleMessage').textContent = error.message; }
  }
}

document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => switchSection(button.dataset.section));
});
async function moveWeek(days) {
  activeWeek = shiftDay(activeWeek, days);
  $('scheduleMessage').textContent = '';
  try { await loadSanctuary(); }
  catch (error) { $('scheduleMessage').textContent = error.message; }
}
$('prevWeek').addEventListener('click', () => moveWeek(-7));
$('nextWeek').addEventListener('click', () => moveWeek(7));
$('thisWeek').addEventListener('click', () => {
  activeWeek = mondayFor(seoulToday());
  moveWeek(0);
});
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
