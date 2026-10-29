#!/usr/bin/env python3
"""Add image-matched content schedule without replacing customized Aion2 files.

The schedule is a static reference copied from the image supplied by the owner.
It is independent of D1, cron, existing homework and other navigation panels.
"""
from pathlib import Path
from html import escape
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'public/index.html'
JS = ROOT / 'public/app.js'
MARKER = 'AION2_CONTENT_SCHEDULE_V1'

COLORS = {
    '카이아': ('sun', '☼'),
    '아그로': ('agro', '♨'),
    '아티쟁': ('artifact', '◈'),
    '어비스 보스': ('boss', '♙'),
    '나흐마': ('nahma', '♛'),
    '아웃랜드': ('outland', '◎'),
    '균열지대': ('rift', '◉'),
    '시공쟁탈전': ('riftwar', '⚔'),
}


def badge(name, display_name=None):
    style, icon = COLORS[name]
    return f'<span class="cs-event cs-{style}"><span aria-hidden="true">{icon}</span> {escape(display_name or name)}</span>'


def row(times, default=None, special=None, merge=False):
    time = f'<th scope="row" class="cs-time">{times}</th>'
    if merge:
        name = '어비스 아웃랜드' if default == '아웃랜드' else default
        return f'<tr>{time}<td colspan="7" class="cs-full-event">{badge(default, name)}</td>{time}</tr>'
    cells = []
    for day in range(7):
        contents = list(default or []) if isinstance(default, list) else ([default] if default else [])
        if special is not None:
            contents = special.get(day, contents)
        item = ''.join(badge(c) for c in contents) if contents else '<span class="cs-dash">—</span>'
        cells.append(f'<td>{item}</td>')
    return f'<tr>{time}{"".join(cells)}{time}</tr>'


def server_card(group, data):
    rows = ''.join(f'<tr><td class="cs-server-num">{num}</td><td>{escape(west)}</td><td>{escape(east)}</td></tr>'
                   for num, west, east in data)
    return f'''<div class="cs-server-card">
      <h3 class="cs-group-{group}">{group}그룹</h3>
      <table><thead><tr><th>번호</th><th>서부</th><th>동부</th></tr></thead><tbody>{rows}</tbody></table>
    </div>'''


def content_html():
    table_rows = [
        row('01:00', '카이아'),
        row('05:00', '카이아'),
        row('09:00', '아그로'),
        row('11:00<br>~ 13:30', '아웃랜드', merge=True),
        row('13:00', '카이아'),
        row('17:00', '카이아'),
        row('20:00', special={0:['시공쟁탈전'],3:['시공쟁탈전'],5:['시공쟁탈전']}),
        row('20:00<br>~ 23:30', '아웃랜드', merge=True),
        row('21:00', ['카이아', '아그로']),
        row('22:00', special={1:['균열지대'],3:['균열지대']}),
        row('23:00', special={0:['시공쟁탈전'],3:['시공쟁탈전'],5:['시공쟁탈전']}),
    ]
    days = ['월','화','수','목','금','토','일']
    header = ''.join(f'<th class="cs-day cs-day-{i}" scope="col">{d}{"<small>주간 리셋</small>" if d == "수" else ""}</th>' for i,d in enumerate(days))
    legend = ''.join(badge(name) for name in COLORS)
    guides = [
      ('카이아','매일 · 4시간마다','01:00 / 05:00 / 09:00<br>13:00 / 17:00 / 21:00',''),
      ('아그로','매일','09:00 / 21:00',''),
      ('아웃랜드','매일','11:00 ~ 13:30<br>20:00 ~ 23:30','운영 시간 내 30분마다 입장 가능'),
      ('균열지대','화 · 목','22:00',''),
      ('시공쟁탈전','월 · 목 · 토','20:00 / 23:00','11월 11일 종료'),
    ]
    guide_html = ''.join(f'''<div class="cs-guide-card">
      <div class="cs-guide-heading">{badge(name, '어비스 아웃랜드' if name == '아웃랜드' else name)}</div>
      <strong>{escape(timing)}</strong><p>{times}</p>
      {f'<small>{escape(note)}</small>' if note else ''}
    </div>''' for name,timing,times,note in guides)
    group_rows = [('아티쟁','수 · 토',['21:20','21:50','22:20']),
                  ('어비스 보스','수 · 토',['21:45','22:15','22:45']),
                  ('나흐마','금 · 일',['22:00','22:30','23:00'])]
    groups = ''.join(f'<tr><td>{badge(name)}</td><td>{days}</td>' + ''.join(f'<td>{val}</td>' for val in times) + '</tr>' for name,days,times in group_rows)
    servers = {
      1: [(1,'시엘','이스라펠'),(4,'트리니엘','네몬'),(7,'아리엘','마르쿠탄'),
          (10,'히타니에','루터스'),(13,'타하바타','코치룽'),(16,'카샤카','브리트라'),(19,'이스타르','지켈')],
      2: [(2,'네자칸','루드라'),(5,'카이시넬','바바룽'),(8,'에레슈키갈','루미엘'),
          (11,'나니아','무닌'),(14,'페르노스','메스람타에다'),(17,'젠카카','울고른'),(20,'티아마트','크로메데')],
      3: [(3,'바이젤','아스펠'),(6,'유스티엘','바카르마'),(9,'프레기온','이스할겐'),
          (12,'하달','파프니르'),(15,'다미누','오다르'),(18,'챈카룽','인드나흐'),(21,'포에타','콰이링')]
    }
    servers_html = ''.join(server_card(i, records) for i,records in servers.items())
    return f'''<!-- {MARKER}: user-provided 2026-10-29 screenshot reference -->
      <section id="contentSchedulePanel" class="cs-wrap" hidden aria-labelledby="contentScheduleTitle">
        <header class="cs-page-header">
          <div><h1 id="contentScheduleTitle">컨텐츠 일정표</h1><p>24시간 기준 (KST)</p></div>
          <div class="cs-logo" aria-label="AION 2">AION<span>2</span></div>
        </header>
        <div class="cs-section-heading"><h2>주간 시간표</h2></div>
        <div class="cs-legend" aria-label="콘텐츠 종류">{legend}</div>
        <div class="cs-scroll"><table class="cs-week-table" aria-label="월요일부터 일요일까지 주간 콘텐츠 시간표">
          <thead><tr><th scope="col">시간</th>{header}<th scope="col">시간</th></tr></thead>
          <tbody>{''.join(table_rows)}</tbody>
        </table></div>
        <div class="cs-section-heading"><h2>콘텐츠별 안내</h2></div>
        <div class="cs-guides">{guide_html}</div>
        <div class="cs-section-heading"><h2>그룹별 일정</h2></div>
        <div class="cs-scroll"><table class="cs-group-table" aria-label="1~3그룹 콘텐츠 일정">
          <thead><tr><th scope="col">콘텐츠</th><th scope="col">요일</th><th scope="col">1그룹</th><th scope="col">2그룹</th><th scope="col">3그룹</th></tr></thead>
          <tbody>{groups}</tbody>
        </table></div>
        <div class="cs-section-heading cs-matches-head"><h2>서버 매칭표</h2><p>적용 기간 2026.10.21 ~ 2026.11.11</p></div>
        <div class="cs-server-grid">{servers_html}</div>
        <p class="cs-reference-note">첨부 이미지 기준 일정표입니다. 종료 또는 변경된 콘텐츠 일정은 별도 업데이트가 필요합니다.</p>
      </section>
'''


def replace_once(value, old, new, label):
    count = value.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one anchor, found {count}; no files modified')
    return value.replace(old, new, 1)


def main():
    html = HTML.read_text(encoding='utf-8')
    js = JS.read_text(encoding='utf-8')
    if MARKER in html:
        if "section === 'contents'" in js and 'contentSchedulePanel' in js:
            print('Content schedule tab already installed (nothing changed).')
            return
        raise RuntimeError('Schedule HTML exists but navigation integration is missing; stop to avoid duplication')
    nav = '<button class="main-tab" type="button" data-section="homework">숙제</button>'
    html = replace_once(html, nav, nav + '\n        <button class="main-tab" type="button" data-section="contents">컨텐츠 일정표</button>', 'tab position after homework')
    html = replace_once(html, '<section id="homeworkPanel" hidden>', content_html() + '      <section id="homeworkPanel" hidden>', 'new schedule panel')
    html = replace_once(html, '</head>', '  <link rel="stylesheet" href="/content-schedule.css">\n</head>', 'schedule stylesheet')
    js = replace_once(js, "document.body.classList.toggle('homework-mode', section === 'homework');",
                      "document.body.classList.toggle('homework-mode', section === 'homework');\n  document.body.classList.toggle('content-schedule-mode', section === 'contents');", 'full width mode')
    js = replace_once(js, "$('homeworkPanel').hidden = section !== 'homework';",
                      "$('homeworkPanel').hidden = section !== 'homework';\n  $('contentSchedulePanel').hidden = section !== 'contents';", 'panel visibility')
    js = replace_once(js, "  if (section !== 'characters') {",
                      "  if (section === 'contents') return;\n  if (section !== 'characters') {", 'prevent sanctuary fetch for contents')
    # Normalize the text coming back from the backend without changing the homework task key.
    old_task_line = 'const tasks = homeworkData.tasks || [];'
    if old_task_line in js:
        js = js.replace(old_task_line, "const tasks = (homeworkData.tasks || []).map(task => ({ ...task, label: task.label === '오드구매' ? '오드구매&제작' : task.label }));", 1)
    # Preserve all other user modifications, including custom homework labels.
    # Explicitly honor the desired name without changing existing D1 task identifiers.
    html = html.replace('오드구매 완료 기록', '오드구매&제작 완료 기록')
    html = html.replace('>오드구매</th>', '>오드구매&제작</th>')
    JS.write_text(js, encoding='utf-8')
    HTML.write_text(html, encoding='utf-8')
    print('Added content schedule tab and screenshot-matched content.')
    print('Existing homework, D1, server code, user overrides and wrangler.jsonc preserved.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, RuntimeError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
