const $ = id => document.getElementById(id);
let nextCursor = null, loading = false;
const labels = {character:'캐릭터',homework:'숙제',od:'오드·멤버십',sanctuary:'성역 일정',party:'파티',content:'컨텐츠 일정표',inquiry:'문의사항',other:'기타'};

async function callApi(url, method='GET', data) {
  const options = { method, credentials:'same-origin', cache:'no-store' };
  if (data !== undefined) {options.headers={'Content-Type':'application/json'};options.body=JSON.stringify(data);}
  const response = await fetch(url,options);
  let result = {};
  try {result = await response.json();} catch { /* network/server may not be JSON */ }
  if (!response.ok) throw new Error(result.error || `서버 오류 (${response.status})`);
  return result;
}
function authorized(value) {
  $('unlockPanel').hidden = value;
  $('historyPanel').hidden = !value;
  $('adminLogout').hidden = !value;
}
function textCell(row,value) {
  const cell=document.createElement('td');cell.textContent=String(value ?? '');row.append(cell);return cell;
}
function pretty(value) {return value === null || value === undefined ? '-' : JSON.stringify(value,null,2);}
function makeDetails(item) {
  const cell=document.createElement('td');
  const details=document.createElement('details');details.className='details';
  const summary=document.createElement('summary');summary.textContent='보기';details.append(summary);
  const grid=document.createElement('div');grid.className='details-grid';
  for(const [name,value] of [['변경 요청',item.details],['변경 전',item.before],['변경 후',item.after]]) {
    const wrapper=document.createElement('div');const heading=document.createElement('b');heading.textContent=name;
    const pre=document.createElement('pre');pre.textContent=pretty(value);
    wrapper.append(heading,pre);grid.append(wrapper);
  }
  details.append(grid);cell.append(details);return cell;
}
function draw(items, append) {
  if (!append) $('historyRows').replaceChildren();
  for(const item of items) {
    const row=document.createElement('tr');
    const date = new Date(item.occurredAt*1000).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    textCell(row,date);textCell(row,item.actor);const ipCell=textCell(row,item.ip || '기록 없음');ipCell.className='ip-cell'; // AION2_ADMIN_AUDIT_IP_V1
    const cat=textCell(row,'');const chip=document.createElement('span');chip.className='category';chip.textContent=labels[item.category] || item.category;cat.append(chip);
    textCell(row,item.summary || item.action);textCell(row,item.target);row.append(makeDetails(item));
    $('historyRows').append(row);
  }
  if (!$('historyRows').childElementCount) {
    const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=7;
    cell.textContent='표시할 변경 이력이 없습니다.';row.append(cell);$('historyRows').append(row);
  }
}
async function loadHistory(append=false) {
  if(loading) return;
  loading=true;$('historyMessage').textContent='';
  for(const id of ['searchHistory','reloadHistory','moreHistory']) $(id).disabled=true;
  try {
    const qs=new URLSearchParams();
    const category=$('categoryFilter').value,actor=$('actorFilter').value.trim();
    if(category)qs.set('category',category);
    if(actor)qs.set('actor',actor);
    const ip=$('ipFilter').value.trim();if(ip)qs.set('ip',ip);
    if(append&&nextCursor)qs.set('before',nextCursor);
    const response=await callApi('/api/admin/history?'+qs);
    draw(response.events,append);
    nextCursor=response.nextCursor;
    $('moreHistory').hidden=!response.hasMore;
  } catch(error) {
    $('historyMessage').textContent=error.message;
    if (/인증/.test(error.message)) authorized(false);
  } finally {
    loading=false;
    for(const id of ['searchHistory','reloadHistory','moreHistory']) $(id).disabled=false;
  }
}
$('adminLoginForm').addEventListener('submit',async event=>{
  event.preventDefault();$('unlockMessage').textContent='';$('adminLoginSubmit').disabled=true;
  try {
    await callApi('/api/admin/login','POST',{password:$('adminPassword').value});
    $('adminPassword').value='';authorized(true);await loadHistory();
  } catch(error) {$('unlockMessage').textContent=error.message;}
  finally {$('adminLoginSubmit').disabled=false;}
});
$('adminLogout').addEventListener('click',async()=>{
  try {await callApi('/api/admin/logout','POST',{});} catch { /* discard UI access */ }
  authorized(false);$('historyRows').replaceChildren();nextCursor=null;
});
$('searchHistory').addEventListener('click',()=>{nextCursor=null;loadHistory();});
$('reloadHistory').addEventListener('click',()=>{nextCursor=null;loadHistory();});
$('moreHistory').addEventListener('click',()=>loadHistory(true));
$('actorFilter').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();nextCursor=null;loadHistory();}});
$('ipFilter').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();nextCursor=null;loadHistory();}});
(async()=>{
  try {const state=await callApi('/api/admin/status');authorized(state.authorized);if(state.authorized)await loadHistory();}
  catch(error){$('unlockMessage').textContent=error.message;}
})();
