// AION2_INQUIRIES_V1 - public-to-logged-in-users questions and replies.
// Authentication and same-origin write protection are handled by src/index.js.
const TITLE_MAX = 100;
const BODY_MAX = 2000;
const REPLY_MAX = 1000;
const PAGE_SIZE = 20;
const nowSeconds = () => Math.floor(Date.now() / 1000);
const safeText = value => typeof value === 'string' ? value.trim() : '';
const allowedText = (value, max) => value.length > 0 && value.length <= max &&
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);

export async function handleInquiriesApi(request, env, path, user, json, readJson) {
  const method = request.method;
  const db = env.DB;
  if (path === '/api/inquiries') {
    if (method === 'GET') {
      const url = new URL(request.url);
      const pageValue = url.searchParams.get('page') || '1';
      if (!/^[1-9]\d{0,2}$/.test(pageValue)) return json({error:'페이지 번호를 확인하세요.'},400);
      const page = Number(pageValue);
      const mine = url.searchParams.get('mine') === '1';
      const where = mine ? 'WHERE q.author_nickname = ?' : '';
      const params = mine ? [user.nickname] : [];
      const count = await db.prepare(`SELECT COUNT(*) AS total FROM aion_inquiries q ${where}`)
        .bind(...params).first();
      const records = await db.prepare(`
        SELECT q.id,q.author_nickname,q.title,q.created_at,
          (SELECT COUNT(*) FROM aion_inquiry_replies r WHERE r.inquiry_id=q.id) AS reply_count
        FROM aion_inquiries q ${where}
        ORDER BY q.id DESC LIMIT ? OFFSET ?
      `).bind(...params,PAGE_SIZE,(page-1)*PAGE_SIZE).all();
      return json({items: records.results || [], page, limit:PAGE_SIZE, total:count?.total || 0});
    }
    if (method !== 'POST') return json({error:'허용되지 않은 요청입니다.'},405);
    const body = await readJson(request);
    const title = safeText(body.title);
    const content = safeText(body.content);
    if (!allowedText(title,TITLE_MAX) || !allowedText(content,BODY_MAX)) {
      return json({error:'제목은 1~100자, 문의 내용은 1~2,000자로 입력해 주세요.'},400);
    }
    const last = await db.prepare('SELECT created_at FROM aion_inquiries WHERE author_nickname=? ORDER BY id DESC LIMIT 1')
      .bind(user.nickname).first();
    const now = nowSeconds();
    if (last && now - last.created_at < 15) {
      return json({error:'문의 등록은 15초 간격으로 가능합니다.'},429);
    }
    const result = await db.prepare(`
      INSERT INTO aion_inquiries(author_nickname,title,content,created_at)
      VALUES(?,?,?,?)
    `).bind(user.nickname,title,content,now).run();
    return json({success:true,id:result.meta.last_row_id},201);
  }

  const detailMatch = path.match(/^\/api\/inquiries\/([1-9]\d*)$/);
  if (detailMatch) {
    if (method !== 'GET') return json({error:'허용되지 않은 요청입니다.'},405);
    const id = Number(detailMatch[1]);
    if (!Number.isSafeInteger(id)) return json({error:'잘못된 문의 번호입니다.'},400);
    const inquiry = await db.prepare(`
      SELECT id,author_nickname,title,content,created_at
      FROM aion_inquiries WHERE id=?
    `).bind(id).first();
    if (!inquiry) return json({error:'문의사항을 찾을 수 없습니다.'},404);
    const replies = await db.prepare(`
      SELECT id,author_nickname,content,created_at
      FROM aion_inquiry_replies WHERE inquiry_id=? ORDER BY id ASC LIMIT 100
    `).bind(id).all();
    return json({inquiry,replies:replies.results || []});
  }

  const replyMatch = path.match(/^\/api\/inquiries\/([1-9]\d*)\/replies$/);
  if (replyMatch) {
    if (method !== 'POST') return json({error:'허용되지 않은 요청입니다.'},405);
    const id = Number(replyMatch[1]);
    if (!Number.isSafeInteger(id)) return json({error:'잘못된 문의 번호입니다.'},400);
    const body = await readJson(request);
    const content = safeText(body.content);
    if (!allowedText(content,REPLY_MAX)) return json({error:'답글은 1~1,000자로 입력해 주세요.'},400);
    const exists = await db.prepare('SELECT id FROM aion_inquiries WHERE id=?').bind(id).first();
    if (!exists) return json({error:'문의사항을 찾을 수 없습니다.'},404);
    const count = await db.prepare('SELECT COUNT(*) AS total FROM aion_inquiry_replies WHERE inquiry_id=?')
      .bind(id).first();
    if (count?.total >= 100) return json({error:'답글은 문의당 최대 100개까지 등록할 수 있습니다.'},400);
    const last = await db.prepare(`
      SELECT created_at FROM aion_inquiry_replies WHERE author_nickname=? ORDER BY id DESC LIMIT 1
    `).bind(user.nickname).first();
    const now = nowSeconds();
    if (last && now - last.created_at < 5) return json({error:'답글은 5초 간격으로 등록할 수 있습니다.'},429);
    await db.prepare(`
      INSERT INTO aion_inquiry_replies(inquiry_id,author_nickname,content,created_at)
      VALUES(?,?,?,?)
    `).bind(id,user.nickname,content,now).run();
    return json({success:true},201);
  }
  return json({error:'지원하지 않는 문의 API입니다.'},404);
}
