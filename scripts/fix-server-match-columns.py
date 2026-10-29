#!/usr/bin/env python3
"""Narrow patch for Aion2 content schedule server matches.

Fix a global 780px table min-width leaking into three ~380px server cards.
Keep server matching permanently visible by replacing its details/summary with
non-collapsible section/header. Do not replace any other user files.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'public/index.html'
CSS = ROOT / 'public/content-schedule.css'
JS = ROOT / 'public/content-schedule-manage.js'
MARK = 'AION2_SERVER_MATCHES_VISIBLE_COLUMNS_V1'

ADDED_CSS = '''
/* AION2_SERVER_MATCHES_VISIBLE_COLUMNS_V1: display all three matching columns */
.cs-server-details > .cs-static-heading {
  padding: 10px 14px;
  background: #182338;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.cs-server-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cs-server-card { min-width: 0; }
/* The site's global `table { min-width:780px }` was clipping 2/3 columns! */
.cs-server-card table {
  min-width: 0;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}
.cs-server-card th,.cs-server-card td {
  box-sizing: border-box;
  text-align: center;
  vertical-align: middle;
  padding: 6px 4px;
  overflow-wrap: anywhere;
  white-space: normal;
  line-height: 1.4;
  font-size: 12px;
}
.cs-server-card th:nth-child(1),.cs-server-card td:nth-child(1),
.cs-server-card .cs-server-num { width: 17%; }
.cs-server-card th:nth-child(2),.cs-server-card td:nth-child(2) { width: 38%; }
.cs-server-card th:nth-child(3),.cs-server-card td:nth-child(3) { width: 45%; }
@media (max-width: 750px) {
  .cs-server-grid { grid-template-columns: minmax(0, 1fr); }
}
'''


def change_once(value, old, new, label):
    count = value.count(old)
    if count != 1:
        raise ValueError(f'{label}: expected 1 occurrence, got {count}; no changes applied')
    return value.replace(old, new, 1)


def patch(html, css, js):
    if MARK in css:
        raise ValueError('This layout fix was already applied; no changes made')
    if 'csServerDetails' not in html or 'csServerGrid' not in html:
        raise ValueError('Editable server matching view must be installed first')
    html = change_once(html,
        '<details class="cs-server-details" id="csServerDetails">',
        '<section class="cs-server-details" id="csServerDetails">',
        'server matching wrapper')
    html = change_once(html,
        '<summary><span class="cs-summary-title">서버 매칭표 펼치기</span><span class="cs-summary-period" id="csServerPeriod">',
        '<div class="cs-static-heading"><span class="cs-summary-title">서버 매칭표</span><span class="cs-summary-period" id="csServerPeriod">',
        'server matching header')
    # The only server header line ends with </summary>.
    html = change_once(html,
        '</span></summary>\n          <div class="cs-server-panel">',
        '</span></div>\n          <div class="cs-server-panel">',
        'server matching header close')
    html = change_once(html,
        '          </div>\n        </details>\n        <p class="cs-reference-note">',
        '          </div>\n        </section>\n        <p class="cs-reference-note">',
        'server matching wrapper close')
    js = change_once(js,
        "summary.textContent = '서버 매칭표 펼치기';",
        "summary.textContent = '서버 매칭표';",
        'dynamic header label')
    css = css.rstrip() + '\n' + ADDED_CSS
    return html,css,js


def main():
    for file in (HTML,CSS,JS):
        if not file.is_file():
            raise ValueError(f'Required file missing: {file}')
    originals = [file.read_text(encoding='utf-8') for file in (HTML,CSS,JS)]
    edited = patch(*originals)
    for file,before,after in zip((HTML,CSS,JS),originals,edited):
        backup = ROOT / '.aion2-backups'
        backup.mkdir(exist_ok=True)
        (backup / ('__'.join(file.relative_to(ROOT).parts)+'.before-server-column-fix.bak')).write_text(before,encoding='utf-8')
        file.write_text(after,encoding='utf-8')
    print('OK: server matching always visible; number/west/east all fit in each card.')
    print('Unrelated content, existing D1/API and wrangler config untouched.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError) as error:
        print('STOP:', error, file=sys.stderr)
        sys.exit(1)
