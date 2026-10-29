// AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1
// The 21 entries initially shown in the static screenshot are a fallback until saved to D1.
// The server matching table is not a public official live game feed.
(() => {
  const $ = id => document.getElementById(id);
  const panel = $('contentSchedulePanel');
  if (!panel) return;
  const tab = document.querySelector('[data-section="contents"]');
  const summary = panel.querySelector('.cs-summary-title');
  const editor = $('csMatchEditor');
  const editButton = $('csEditMatches');
  const saveButton = $('csSaveMatches');
  const cancelButton = $('csCancelMatches');
  const status = $('csMatchStatus');
  const meta = $('csEditMeta');
  const PERIOD_DEFAULT = {startDate:'2026-10-21',endDate:'2026-11-11'};

  function staticRows() {
    const all = [];
    panel.querySelectorAll('.cs-server-card').forEach(card => {
      const groupText = card.querySelector('h3')?.textContent || '';
      const group = Number(groupText.replace(/[^0-9]/g,''));
      card.querySelectorAll('tbody tr').forEach(tr => {
        const values = [...tr.querySelectorAll('td')].map(x => x.textContent.trim());
        if (values.length === 3) all.push({number:Number(values[0]),group,west:values[1],east:values[2]});
      });
    });
    return all.sort((a,b) => a.number-b.number);
  }

  const fallback = { ...PERIOD_DEFAULT, rows:staticRows() };
  let current = structuredClone(fallback);
  let revision = 0;
  let editorOpen = false;

  function formatDate(date) { return date.replaceAll('-','.'); }
  function renderMatching(data) {
    const grid = $('csServerGrid');
    const cards = [];
    for (const group of [1,2,3]) {
      const card = document.createElement('div'); card.className = 'cs-server-card';
      const heading = document.createElement('h3'); heading.className = 'cs-group-'+group;
      heading.textContent = group + '그룹'; card.append(heading);
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const titleRow = document.createElement('tr');
      for (const name of ['번호','서부','동부']) {
        const th = document.createElement('th'); th.textContent = name; titleRow.append(th);
      }
      thead.append(titleRow); table.append(thead);
      const tbody = document.createElement('tbody');
      for (const item of data.rows.filter(r => r.group === group).sort((a,b)=>a.number-b.number)) {
        const row = document.createElement('tr');
        for (const field of ['number','west','east']) {
          const td = document.createElement('td');
          td.textContent = String(item[field]);
          if (field==='number') td.className = 'cs-server-num';
          row.append(td);
        }
        tbody.append(row);
      }
      table.append(tbody); card.append(table); cards.push(card);
    }
    grid.replaceChildren(...cards);
    $('csServerPeriod').textContent = `적용 기간 ${formatDate(data.startDate)} ~ ${formatDate(data.endDate)}`;
    summary.textContent = '서버 매칭표';
  }

  function setEditorFromCurrent() {
    $('csStartDate').value = current.startDate;
    $('csEndDate').value = current.endDate;
    $('csServerRows').value = [...current.rows].sort((a,b)=>a.number-b.number)
      .map(r => [r.number,r.west,r.east].join('\t')).join('\n');
  }

  function parseEditor() {
    const startDate = $('csStartDate').value;
    const endDate = $('csEndDate').value;
    if (!startDate || !endDate || startDate > endDate) {
      throw new Error('적용 기간의 시작일과 종료일을 확인해 주세요.');
    }
    const lines = $('csServerRows').value.trim().split(/\r?\n/).filter(x => x.trim());
    if (lines.length !== 21) throw new Error(`서버 매칭은 21줄이어야 해요. 현재 ${lines.length}줄입니다.`);
    const rows = lines.map((line,i) => {
      const parts = line.split('\t').map(s => s.trim());
      if (parts.length !== 3) throw new Error(`${i+1}번째 줄은 번호, 서부, 동부의 탭 구분 3칸으로 입력해 주세요.`);
      const num = Number(parts[0]);
      if (!Number.isInteger(num) || num < 1 || num > 21 ||
          !parts[1] || parts[1].length > 40 || !parts[2] || parts[2].length > 40) {
        throw new Error(`${i+1}번째 줄의 번호 또는 서버명을 확인해 주세요.`);
      }
      return {number:num,group:((num-1)%3)+1,west:parts[1],east:parts[2]};
    });
    if (new Set(rows.map(r=>r.number)).size !== 21) throw new Error('1~21번 번호를 중복 없이 입력해 주세요.');
    return {startDate,endDate,rows};
  }

  async function jsonRequest(method, body) {
    const response = await fetch('/api/content-schedule/matches', {
      method, credentials:'same-origin', cache:'no-store',
      ...(body ? {headers:{'Content-Type':'application/json'},body:JSON.stringify(body)} : {})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '서버 매칭 정보를 처리하지 못했습니다.');
    return result;
  }

  async function load() {
    if (!panel || !tab || panel.hidden) return;
    meta.textContent = '서버 매칭 불러오는 중...';
    try {
      const result = await jsonRequest('GET');
      revision = result.revision || 0;
      current = result.config || structuredClone(fallback);
      renderMatching(current);
      meta.textContent = result.updatedBy
        ? `최근 수정: ${result.updatedBy} · ${new Date(result.updatedAt*1000).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}`
        : '이미지 기준 초기 서버 매칭';
      // Do not overwrite any unsaved changes while editing.
      if (!editorOpen) setEditorFromCurrent();
    } catch (error) {
      meta.textContent = '서버 매칭 불러오기 오류: ' + error.message;
    }
  }

  editButton.addEventListener('click', () => {
    editorOpen = !editorOpen;
    editor.hidden = !editorOpen;
    editButton.textContent = editorOpen ? '편집 닫기' : '서버 매칭 수정';
    if (editorOpen) { setEditorFromCurrent(); status.textContent = ''; }
  });
  cancelButton.addEventListener('click', () => {
    editorOpen = false; editor.hidden = true; editButton.textContent = '서버 매칭 수정';
    status.textContent = '';
  });
  saveButton.addEventListener('click', async () => {
    try {
      const data = parseEditor();
      saveButton.disabled = true;
      status.textContent = '저장 중...';
      const result = await jsonRequest('POST', {...data,revision});
      revision = result.revision;
      current = result.config;
      renderMatching(current);
      meta.textContent = `최근 수정: ${result.updatedBy} · ${new Date(result.updatedAt*1000).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}`;
      status.textContent = '저장 완료! 모든 사용자가 다음 조회부터 이 서버 매칭표를 보게 됩니다.';
    } catch(error) {
      status.textContent = error.message;
    } finally {
      saveButton.disabled = false;
    }
  });
  tab?.addEventListener('click', () => { void load(); });
})();
