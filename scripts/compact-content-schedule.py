#!/usr/bin/env python3
"""Small, additive patch: compact content tab and editable persisted server matching.

Only edits existing public/index.html, public/content-schedule.css, src/index.js.
Do not overwrite wrangler.jsonc, existing homework, user text, credentials, or D1 data.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'public/index.html'
CSS = ROOT / 'public/content-schedule.css'
JS = ROOT / 'src/index.js'
MARK = 'AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1'


def once(text, old, new, tag):
    count = text.count(old)
    if count != 1:
        raise ValueError(f'{tag}: anchor expected once, got {count}. No changes applied.')
    return text.replace(old, new, 1)


ENDPOINT = r'''  // AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1
  // 21 Korean server matchings are site data, not a code deployment.
  // Existing shared-code login is reused: every authenticated nickname can edit.
  if (path === '/api/content-schedule/matches') {
    if (method === 'GET') {
      const record = await env.DB.prepare(
        'SELECT payload_json,updated_by,updated_at,revision FROM content_schedule_server_matches WHERE id=1'
      ).first();
      return json(record ? {
        config: JSON.parse(record.payload_json), updatedBy: record.updated_by,
        updatedAt: record.updated_at, revision: record.revision
      } : {config:null,revision:0});
    }
    if (method !== 'POST') return json({error:'허용되지 않은 요청입니다.'},405);
    const body = await readJson(request);
    const dateValid = str => {
      if (typeof str !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(str)) return false;
      const date = new Date(str + 'T00:00:00Z');
      return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === str;
    };
    const {startDate,endDate,rows} = body;
    const revision = body.revision;
    if (!dateValid(startDate) || !dateValid(endDate) || startDate > endDate ||
        !Array.isArray(rows) || rows.length !== 21 ||
        !Number.isSafeInteger(revision) || revision < 0) {
      return json({error:'적용 날짜, 21개 서버 매칭 또는 수정 버전을 확인하세요.'},400);
    }
    const seen = new Set();
    const normalized = [];
    for (const item of rows) {
      const num = item && item.number;
      const group = item && item.group;
      const west = item && typeof item.west === 'string' ? item.west.trim() : '';
      const east = item && typeof item.east === 'string' ? item.east.trim() : '';
      if (!Number.isSafeInteger(num) || num < 1 || num > 21 || seen.has(num) ||
          group !== ((num - 1) % 3) + 1 || !validLabel(west,40) || !validLabel(east,40)) {
        return json({error:'매칭 번호는 1~21을 한 번씩, 올바른 그룹과 서부·동부 서버명을 입력하세요.'},400);
      }
      seen.add(num);
      normalized.push({number:num,group,west,east});
    }
    normalized.sort((a,b) => a.number-b.number);
    const config = JSON.stringify({startDate,endDate,rows:normalized});
    const updatedAt = Math.floor(Date.now()/1000);
    const saved = await env.DB.prepare(`
      INSERT INTO content_schedule_server_matches(id,payload_json,updated_by,updated_at,revision)
      VALUES (1,?,?,?,1)
      ON CONFLICT(id) DO UPDATE SET
        payload_json=excluded.payload_json,updated_by=excluded.updated_by,
        updated_at=excluded.updated_at,revision=content_schedule_server_matches.revision+1
      WHERE content_schedule_server_matches.revision=?
    `).bind(config,user.nickname,updatedAt,revision).run();
    if (!saved.meta.changes) return json({error:'다른 사용자가 먼저 수정했습니다. 새로고침 후 다시 수정해 주세요.'},409);
    return json({success:true,config:JSON.parse(config),updatedAt,updatedBy:user.nickname,revision:revision+1});
  }
'''
# Convert four escaped slashes originating in raw Python string to proper JS regex slashes.
ENDPOINT = ENDPOINT.replace(r'/^\\d', r'/^\d').replace(r'-\\d', r'-\d')

EDIT_PANEL = '''
          <div class="cs-edit-actions">
            <button type="button" class="secondary small" id="csEditMatches">서버 매칭 수정</button>
            <span class="cs-edit-meta" id="csEditMeta">이미지 기준 매칭표</span>
          </div>
          <div class="cs-match-editor" id="csMatchEditor" hidden>
            <p>적용 기간과 서버를 수정하면 DB에 저장돼요. 21줄을 <strong>번호 / 서부 / 동부</strong> 순으로 입력하세요. 엑셀에서 복사한 탭 구분 표도 붙여넣을 수 있어요.</p>
            <div class="cs-period-fields">
              <label>시작일 <input type="date" id="csStartDate" required></label>
              <label>종료일 <input type="date" id="csEndDate" required></label>
            </div>
            <label for="csServerRows">서버 매칭 (21줄)</label>
            <textarea id="csServerRows" rows="11" spellcheck="false" placeholder="1&#9;시엘&#9;이스라펠"></textarea>
            <div class="cs-edit-actions">
              <button type="button" class="primary small" id="csSaveMatches">매칭표 저장</button>
              <button type="button" class="secondary small" id="csCancelMatches">취소</button>
            </div>
            <p class="cs-edit-status" id="csMatchStatus" role="status"></p>
          </div>
'''

COMPACT_CSS = '''
/* AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1: compact reference + D1 edit UI */
body.content-schedule-mode main { max-width: 1250px; }
.cs-wrap { padding: 17px 19px 20px; }
.cs-wrap .cs-page-header { padding: 2px 0 12px; margin-bottom: 2px; }
.cs-wrap .cs-page-header h1 { font-size: 25px; margin-bottom: 3px; }
.cs-wrap .cs-page-header p { font-size: 12px; }
.cs-logo { font-size: 34px; }
.cs-section-heading { margin: 15px 0 9px; }
.cs-section-heading h2 { font-size: 16px; }
.cs-legend { gap: 5px; margin: 9px 0 12px; }
.cs-event { font-size: 11px; padding: 3px 4px; border-radius: 4px; }
.cs-week-table { min-width: 760px; }
.cs-week-table thead th { padding: 7px 3px; font-size: 12px; }
.cs-week-table th.cs-time { width: 71px; font-size: 11px; }
.cs-week-table th,.cs-week-table td { padding: 3px 2px; font-size: 11px; }
.cs-week-table td { height: 31px; min-height: 0; }
.cs-week-table td .cs-event { font-size: 11px; padding: 3px 2px; margin: 1px 0; }
.cs-week-table .cs-full-event .cs-event { font-size: 12px; }
.cs-guides { gap: 6px; }
.cs-guide-card { min-height: 107px; }
.cs-guide-heading .cs-event { font-size: 12px; padding: 6px 2px; }
.cs-guide-card strong { font-size: 12px; margin: 7px 4px 3px; }
.cs-guide-card p { margin: 1px 4px; font-size: 11px; line-height: 1.5; }
.cs-guide-card small { font-size: 10px; margin: auto 4px 4px; }
.cs-group-table th,.cs-group-table td { padding: 6px; font-size: 12px; }
.cs-group-table th { font-size: 12px; }
.cs-group-table td:first-child .cs-event { padding: 6px 9px; font-size: 12px; }
.cs-group-table td:nth-child(n+3) { font-size: 14px; }
.cs-server-details { border: 1px solid #344154; border-radius: 9px; margin-top: 17px; overflow: hidden; }
.cs-server-details > summary { cursor: pointer; padding: 10px 14px; background: #182338; display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; list-style: none; }
.cs-server-details > summary::-webkit-details-marker { display: none; }
.cs-server-details > summary::before { content: '▸'; color: #e9be78; font-size: 16px; }
.cs-server-details[open] > summary::before { content: '▾'; }
.cs-server-details .cs-summary-title { font-size: 15px; font-weight: 800; margin-right: auto; }
.cs-server-details .cs-summary-period { font-size: 11px; color: #b8c7da; }
.cs-server-panel { padding: 11px 12px 14px; }
.cs-server-grid { gap: 8px; }
.cs-server-card h3 { padding: 7px 5px; font-size: 14px; }
.cs-server-card th,.cs-server-card td { font-size: 11px; padding: 5px 3px; }
.cs-edit-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.cs-edit-meta { color: #9bb0c9; font-size: 11px; }
.cs-match-editor { margin-top: 13px; padding: 13px; background: #152033; border: 1px solid #354760; border-radius: 8px; }
.cs-match-editor p { font-size: 12px; line-height: 1.55; margin: 0 0 8px; }
.cs-match-editor label { display: block; font-size: 12px; margin: 8px 0 4px; }
.cs-period-fields { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; max-width: 500px; }
.cs-period-fields input { margin-top: 5px; padding: 7px 8px; font-size: 12px; }
.cs-match-editor textarea { width: 100%; min-height: 170px; resize: vertical; font: 12px/1.5 ui-monospace,Consolas,monospace; padding: 9px; }
.cs-edit-status { color: #e9be78; min-height: 16px; margin-top: 9px !important; }
.cs-reference-note { margin: 11px 0 0; font-size: 11px; }
@media(max-width:750px) {
 .cs-wrap { padding: 13px 9px; }
 .cs-server-grid { grid-template-columns: 1fr; }
 .cs-week-table { min-width: 760px; }
 .cs-logo { font-size: 27px; }
 .cs-legend { grid-template-columns: repeat(4,minmax(0,1fr)); }
 .cs-guides { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
'''


def patch(html,css,js):
    if MARK in html or MARK in css or MARK in js:
        if all(MARK in item for item in (html,css,js)):
            raise ValueError('Already installed. Nothing modified (idempotent).')
        raise ValueError('Partial installation detected. Nothing modified; inspect files first.')
    if 'AION2_CONTENT_SCHEDULE_V1' not in html or 'contentSchedulePanel' not in html:
        raise ValueError('The Content Schedule tab must be installed first. Nothing modified.')
    if '/api/content-schedule/matches' in js:
        raise ValueError('A content-schedule API already exists. Nothing modified.')
    old_head = '<div class="cs-section-heading cs-matches-head"><h2>서버 매칭표</h2><p>적용 기간 2026.10.21 ~ 2026.11.11</p></div>'
    new_head = '''<!-- AION2_COMPACT_EDITABLE_SERVER_MATCHES_V1 -->
        <details class="cs-server-details" id="csServerDetails">
          <summary><span class="cs-summary-title">서버 매칭표 펼치기</span><span class="cs-summary-period" id="csServerPeriod">적용 기간 2026.10.21 ~ 2026.11.11</span></summary>
          <div class="cs-server-panel">'''
    html = once(html,old_head,new_head,'server matching heading')
    html = once(html,'<div class="cs-server-grid">','<div class="cs-server-grid" id="csServerGrid">','server grid ID')
    original_note = '<p class="cs-reference-note">첨부 이미지 기준 일정표입니다. 종료 또는 변경된 콘텐츠 일정은 별도 업데이트가 필요합니다.</p>'
    html = once(html, original_note, EDIT_PANEL + '          </div>\n        </details>\n        <p class="cs-reference-note">일정은 첨부 이미지 기준이며, 서버 매칭 정보는 이 사이트에서 직접 수정할 수 있습니다.</p>', 'server matching close/editor')
    html = once(html,'</body>','  <script type="module" src="/content-schedule-manage.js"></script>\n</body>','editor script include')
    css = css.rstrip() + '\n' + COMPACT_CSS
    js = once(js,"  if (path.startsWith('/api/homework')) return homeworkApi(request, env, path, user, now);",
                  ENDPOINT + "\n  if (path.startsWith('/api/homework')) return homeworkApi(request, env, path, user, now);",
                  'authenticated API anchor')
    return html,css,js


def main():
    for path in (HTML,CSS,JS):
        if not path.is_file():
            raise ValueError(f'Missing required file: {path}')
    old = [p.read_text(encoding='utf-8') for p in (HTML,CSS,JS)]
    new = patch(*old)
    # All guards pass before writes. Create backups to make a rollback easy.
    for path, before, after in zip((HTML,CSS,JS), old, new):
        backup_dir = ROOT / '.aion2-backups'
        backup_dir.mkdir(exist_ok=True)
        backup = backup_dir / ('__'.join(path.relative_to(ROOT).parts) + '.bak')
        backup.write_text(before,encoding='utf-8')
        path.write_text(after,encoding='utf-8')
    print('OK: compact display, collapsible server matching, and D1 API installed.')
    print('Backups saved to .aion2-backups/ (do not git add this directory). wrangler.jsonc unchanged.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError,OSError) as err:
        print('STOP:',err,file=sys.stderr)
        sys.exit(1)
