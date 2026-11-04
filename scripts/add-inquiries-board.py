#!/usr/bin/env python3
"""AION2_INQUIRIES_V1. Add an authenticated inquiry board without replacing existing files.

Only patches public/index.html, public/app.js and src/index.js.
Keeps wrangler.jsonc, custom labels, content schedule and all existing DB rows.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'public/index.html'
APP = ROOT / 'public/app.js'
SERVER = ROOT / 'src/index.js'
MARK = 'AION2_INQUIRIES_V1'

PANEL = '''      <!-- AION2_INQUIRIES_V1 -->
      <section id="inquiriesPanel" hidden aria-labelledby="inquiriesTitle">
        <div class="card inq-board">
          <div class="inq-header">
            <div>
              <h1 id="inquiriesTitle">문의사항</h1>
              <p class="muted">궁금한 점이나 개선 요청을 남기고 답글을 확인할 수 있습니다.</p>
            </div>
            <div class="inq-actions">
              <button type="button" class="primary small" id="inqOpenNew">새 문의 작성</button>
              <button type="button" class="secondary small" id="inqReload">새로고침</button>
            </div>
          </div>
          <form id="inqNewForm" class="inq-box" hidden>
            <h2>문의 작성</h2>
            <label for="inqNewTitle">제목</label>
            <input id="inqNewTitle" maxlength="100" required placeholder="문의 제목을 입력해 주세요">
            <label for="inqNewBody">내용</label>
            <textarea id="inqNewBody" maxlength="2000" required rows="6" placeholder="문의 내용이나 개선 요청을 자세히 적어 주세요"></textarea>
            <p class="muted" style="font-size:12px">작성자 닉네임은 현재 로그인한 이름으로 등록됩니다. 개인정보나 비밀번호는 입력하지 마세요.</p>
            <div class="actions">
              <button type="submit" class="primary" id="inqSubmitNew">문의 등록</button>
              <button type="button" class="secondary" id="inqCancelNew">취소</button>
            </div>
          </form>
          <div id="inqListArea">
            <div class="inq-filters">
              <label><input type="checkbox" id="inqMineOnly"> 내 문의만 보기</label>
              <span class="muted" style="font-size:12px">최신 문의순</span>
            </div>
            <p id="inqMessage" class="inq-message" role="status" aria-live="polite"></p>
            <div id="inqList" class="inq-list" aria-label="문의 목록"></div>
            <div class="inq-pager">
              <button type="button" class="secondary small" id="inqPrev">이전</button>
              <span id="inqPageText" class="muted" style="font-size:12px"></span>
              <button type="button" class="secondary small" id="inqNext">다음</button>
            </div>
          </div>
          <div id="inqDetail" hidden>
            <button type="button" class="secondary small" id="inqBack">← 목록으로</button>
            <h2 class="inq-detail-title" id="inqDetailTitle"></h2>
            <p class="muted" id="inqDetailMeta" style="font-size:12px"></p>
            <div id="inqDetailBody" class="inq-body inq-box"></div>
            <h3>답글</h3>
            <div id="inqReplies" class="inq-box"></div>
            <form id="inqReplyForm" class="inq-box">
              <label for="inqReplyContent">답글 남기기</label>
              <textarea id="inqReplyContent" required maxlength="1000" rows="3" placeholder="답글을 입력해 주세요"></textarea>
              <div class="actions"><button type="submit" class="primary" id="inqSubmitReply">답글 등록</button></div>
            </form>
            <p id="inqDetailMessage" class="inq-message" role="status" aria-live="polite"></p>
          </div>
        </div>
      </section>
'''


def replace_one(text, old, new, name):
    found = text.count(old)
    if found != 1:
        raise ValueError(f'{name}: expected one anchor, found {found}. No files changed.')
    return text.replace(old, new, 1)


def patch(html, app, server):
    if MARK in html or MARK in app or MARK in server:
        if MARK in html and MARK in app and MARK in server:
            raise ValueError('Inquiry board already installed. No files changed.')
        raise ValueError('Partial inquiry installation found. Check files before retrying.')
    if 'contentSchedulePanel' not in html or 'contentSchedulePanel' not in app:
        raise ValueError('Content Schedule tab not found. Install it before this patch.')
    if "if (section === 'contents') return;" not in app:
        raise ValueError('Expected Content Schedule tab handler not found; app.js was not modified.')
    if "  if (path.startsWith('/api/homework')) return homeworkApi(request, env, path, user, now);" not in server:
        raise ValueError('Expected authenticated API insertion point not found; src/index.js was not modified.')

    nav = '<button class="main-tab" type="button" data-section="contents">컨텐츠 일정표</button>'
    html = replace_one(html, nav, nav + '\n        <button class="main-tab" type="button" data-section="inquiries">문의사항</button>', 'inquiry tab')
    # Include the panel just before existing Content Schedule, keeping the whole page structure intact.
    match = re.search(r'(?m)^([ \t]*)<section id="contentSchedulePanel"', html)
    if not match:
        raise ValueError('Content Schedule panel not found. No files changed.')
    html = html[:match.start()] + PANEL + html[match.start():]
    html = replace_one(html, '</head>', '  <link rel="stylesheet" href="/inquiries.css">\n</head>', 'inquiry stylesheet')
    html = replace_one(html, '</body>', '  <script type="module" src="/inquiries.js"></script>\n</body>', 'inquiry client module')
    # Bump only the app.js URL query to avoid a browser reusing a cached pre-patch module.
    app_tag = re.search(r'src="(/app\.js(?:\?[^"\s]*)?)"', html)
    if not app_tag:
        raise ValueError('app.js script tag not found. No files changed.')
    app_url = app_tag.group(1)
    html = html[:app_tag.start(1)] + app_url + ('&' if '?' in app_url else '?') + 'inquiries=20261104' + html[app_tag.end(1):]
    # Preserve all other content while respecting existing user's requested terminology.
    html = html.replace('카이아', '카이라')
    html = html.replace('>오드구매</th>', '>오드구매&제작</th>')
    html = re.sub(r'<div class="cs-logo"[^>]*>AION<span>2</span></div>', '', html)

    app = replace_one(app, "  $('contentSchedulePanel').hidden = section !== 'contents';",
                      "  $('contentSchedulePanel').hidden = section !== 'contents';\n  // AION2_INQUIRIES_V1\n  $('inquiriesPanel').hidden = section !== 'inquiries';", 'inquiry visibility')
    app = replace_one(app, "  if (section === 'contents') return;",
                      "  if (section === 'contents' || section === 'inquiries') return;", 'inquiry navigation')

    server = replace_one(server, 'import { lookupOfficialCharacter, OfficialAionLookupError } from "./aion-api.js";',
                        'import { lookupOfficialCharacter, OfficialAionLookupError } from "./aion-api.js";\n'
                        'import { handleInquiriesApi } from "./inquiries-api.js"; // AION2_INQUIRIES_V1', 'inquiry API import')
    auth_anchor = "  if (path.startsWith('/api/homework')) return homeworkApi(request, env, path, user, now);"
    server = replace_one(server, auth_anchor,
                         "  if (path === '/api/inquiries' || path.startsWith('/api/inquiries/')) {\n"
                         "    return handleInquiriesApi(request, env, path, user, json, readJson);\n"
                         "  }\n\n" + auth_anchor, 'inquiry authenticated routes')
    return html, app, server


def main():
    files = (HTML, APP, SERVER)
    missing = [str(path) for path in files if not path.is_file()]
    additions = (ROOT / 'public/inquiries.css', ROOT / 'public/inquiries.js',
                 ROOT / 'src/inquiries-api.js', ROOT / 'migrations/0021_inquiries_board.sql')
    missing += [str(path) for path in additions if not path.is_file()]
    if missing:
        raise ValueError('Missing files:\n' + '\n'.join(missing))
    texts = [path.read_text(encoding='utf-8') for path in files]
    changed = patch(*texts)
    backups = ROOT / '.aion2-backups'
    backups.mkdir(exist_ok=True)
    for path, before, after in zip(files, texts, changed):
        backup = backups / ('__'.join(path.relative_to(ROOT).parts) + '.before-inquiries.bak')
        if not backup.exists():
            backup.write_text(before, encoding='utf-8')
        path.write_text(after, encoding='utf-8')
    print('OK: inquiry board tab, authenticated API, and stylesheet linked.')
    print('Existing homework, custom labels, character / party data and wrangler.jsonc preserved.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as error:
        print('STOP:', error, file=sys.stderr)
        sys.exit(1)
