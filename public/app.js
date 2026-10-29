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
  message.textContent = `${character.character_name} API 정보 조회 중...`;
  try {
    await api(`/api/characters/${character.id}/refresh`, 'POST');
    await loadCharacters();
    message.textContent = `${character.character_name} 정보 갱신 완료`;
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
    refresh.textContent = 'API 갱신';
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
  $('characterMessage').textContent = '외부 캐릭터 API 조회 및 저장 중...';
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
