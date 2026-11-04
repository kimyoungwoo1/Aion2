// AION2_INQUIRIES_V1. Login is already handled by the site's shared-code session.
(() => {
  const $ = id => document.getElementById(id);
  const tab = document.querySelector('[data-section="inquiries"]');
  const panel = $('inquiriesPanel');
  if (!tab || !panel) return;

  let currentPage = 1;
  let currentId = null;
  let filterMine = false;
  const formatDate = seconds => seconds
    ? new Date(Number(seconds) * 1000).toLocaleString('ko-KR', {
        timeZone:'Asia/Seoul', year:'numeric',month:'2-digit',day:'2-digit',
        hour:'2-digit',minute:'2-digit',hour12:false
      }) : '-';

  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = String(text);
    if (className) element.className = className;
    return element;
  };
  const status = (text, target = 'inqMessage') => { $(target).textContent = text || ''; };
  async function request(path, method = 'GET', body) {
    const response = await fetch(path, {
      method, credentials:'same-origin', cache:'no-store',
      ...(body === undefined ? {} : {headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    });
    let data;
    try { data = await response.json(); }
    catch { throw new Error('서버 응답을 읽지 못했습니다.'); }
    if (!response.ok) throw new Error(data.error || '요청에 실패했습니다.');
    return data;
  }

  function showList() {
    currentId = null;
    $('inqDetail').hidden = true;
    $('inqListArea').hidden = false;
  }
  function toggleNewForm(show) {
    $('inqNewForm').hidden = !show;
    if (show) {
      status('');
      $('inqNewTitle').focus();
    }
  }
  async function loadList() {
    showList();
    status('불러오는 중...');
    const page = currentPage;
    const mine = filterMine;
    try {
      const data = await request(`/api/inquiries?page=${page}&mine=${mine ? 1 : 0}`);
      if (currentId !== null || currentPage !== page || filterMine !== mine) return;
      const list = $('inqList');
      list.replaceChildren();
      if (!data.items.length) {
        list.append(node('div',mine ? '내가 작성한 문의가 없습니다.' : '아직 등록된 문의가 없습니다.','inq-empty'));
      }
      for (const item of data.items) {
        const button = node('button',undefined,'inq-item');
        button.type = 'button';
        const main = node('div',undefined,'inq-item-main');
        main.append(node('span',item.title,'inq-item-title'));
        main.append(node('span',`${item.author_nickname} · ${formatDate(item.created_at)}`,'inq-item-meta'));
        button.append(main,node('span',`답글 ${item.reply_count || 0}`,'inq-pill'));
        button.addEventListener('click',() => openDetail(item.id));
        list.append(button);
      }
      const maxPage = Math.max(1,Math.ceil((data.total || 0) / data.limit));
      $('inqPageText').textContent = `${page} / ${maxPage} 페이지 · 총 ${data.total || 0}건`;
      $('inqPrev').disabled = page <= 1;
      $('inqNext').disabled = page >= maxPage;
      status('');
    } catch(error) { status(error.message); }
  }

  async function openDetail(id) {
    currentId = id;
    toggleNewForm(false);
    $('inqListArea').hidden = true;
    $('inqDetail').hidden = false;
    status('문의 내용을 불러오는 중...','inqDetailMessage');
    try {
      const result = await request(`/api/inquiries/${id}`);
      if (currentId !== id) return;
      const inquiry = result.inquiry;
      $('inqDetailTitle').textContent = inquiry.title;
      $('inqDetailMeta').textContent = `${inquiry.author_nickname} · ${formatDate(inquiry.created_at)}`;
      $('inqDetailBody').textContent = inquiry.content;
      const replyList = $('inqReplies');
      replyList.replaceChildren();
      if (!result.replies.length) replyList.append(node('p','아직 답글이 없습니다.','muted'));
      for (const reply of result.replies) {
        const box = node('div',undefined,'inq-reply');
        box.append(node('div',`${reply.author_nickname} · ${formatDate(reply.created_at)}`,'inq-reply-meta'));
        box.append(node('div',reply.content,'inq-body'));
        replyList.append(box);
      }
      $('inqReplyContent').value = '';
      status('','inqDetailMessage');
    } catch(error) { status(error.message,'inqDetailMessage'); }
  }

  tab.addEventListener('click',() => {
    toggleNewForm(false);
    currentPage = 1;
    filterMine = false;
    $('inqMineOnly').checked = false;
    loadList();
  });
  $('inqReload').addEventListener('click',() => { toggleNewForm(false); loadList(); });
  $('inqOpenNew').addEventListener('click',() => {
    showList();
    toggleNewForm($('inqNewForm').hidden);
  });
  $('inqCancelNew').addEventListener('click',() => toggleNewForm(false));
  $('inqMineOnly').addEventListener('change',event => {
    filterMine = event.target.checked;
    currentPage = 1;
    loadList();
  });
  $('inqPrev').addEventListener('click',() => { if(currentPage > 1) { currentPage--; loadList(); } });
  $('inqNext').addEventListener('click',() => { currentPage++; loadList(); });
  $('inqBack').addEventListener('click',loadList);

  $('inqNewForm').addEventListener('submit',async event => {
    event.preventDefault();
    const title = $('inqNewTitle').value.trim();
    const content = $('inqNewBody').value.trim();
    if (!title || !content || title.length > 100 || content.length > 2000) {
      status('제목은 100자, 문의 내용은 2,000자 이내로 작성해 주세요.');
      return;
    }
    const button = $('inqSubmitNew');
    button.disabled = true;
    status('등록 중...');
    try {
      const result = await request('/api/inquiries','POST',{title,content});
      $('inqNewForm').reset();
      toggleNewForm(false);
      currentPage = 1;
      filterMine = false;
      $('inqMineOnly').checked = false;
      await loadList();
      status('문의가 등록되었습니다.');
      if (result.id) await openDetail(result.id);
    } catch(error) { status(error.message); }
    finally { button.disabled = false; }
  });

  $('inqReplyForm').addEventListener('submit',async event => {
    event.preventDefault();
    if (currentId === null) return;
    const id = currentId;
    const content = $('inqReplyContent').value.trim();
    if (!content || content.length > 1000) {
      status('답글은 1,000자 이내로 작성해 주세요.','inqDetailMessage');
      return;
    }
    const button = $('inqSubmitReply');
    button.disabled = true;
    status('답글을 등록하는 중...','inqDetailMessage');
    try {
      await request(`/api/inquiries/${id}/replies`,'POST',{content});
      await openDetail(id);
      status('답글이 등록되었습니다.','inqDetailMessage');
    } catch(error) { status(error.message,'inqDetailMessage'); }
    finally { button.disabled = false; }
  });
})();
