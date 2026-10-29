#!/usr/bin/env python3
"""Safely patch the current Aion2 project without replacing customized files.

- Live Od1 next natural recovery countdown beside Abyss reset text.
- Shared 4/3 sanctuary schedule notes, preserving independent 2-sanctuary
  and per-character party notes.
Requires migration 0019_shared_sanctuary_schedule_notes.sql before deployment.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / 'public/app.js'
HTML = ROOT / 'public/index.html'
WORKER = ROOT / 'src/index.js'


def replace_once(source: str, old: str, new: str, context: str):
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f'{context}: expected 1 matching fragment, found {count}; no files changed')
    return source.replace(old, new, 1)


def change_frontend(source: str) -> str:
    if 'AION2_OD_COUNTDOWN_SHARED_NOTES_V1' in source:
        return source
    if not re.search(r'import\s*\{[^}]*nextOdRecoveryAt', source):
        raise RuntimeError('public/app.js must already import nextOdRecoveryAt from od-recovery.js')

    # Match the current label assignment, including older natural-recovery-time patch.
    pattern = re.compile(r"(?m)^(?P<indent>[ \t]*)\$\('hwWeekLabel'\)\.textContent[ \t]*=[ \t]*(?P<value>[^\n;]*);[ \t]*$")
    matches = list(pattern.finditer(source))
    if len(matches) != 1 or '어비스회랑:' not in matches[0].group('value'):
        raise RuntimeError('Expected one hwWeekLabel assignment containing 어비스회랑')
    match = matches[0]
    # Delete only the obsolete static schedule label, not other user customizations.
    value = re.sub(r'[ \t]*·[ \t]*오드1[ \t]+자연회복:[ \t]*매일[ \t]*02·05·08·11·14·17·20·23시[ \t]*\(KST\)', '', match.group('value'))
    indent = match.group('indent')
    new_label = (
        f"{indent}$('hwWeekLabel').textContent = {value};\n"
        f"{indent}// AION2_OD_COUNTDOWN_SHARED_NOTES_V1: display live countdown beside Abyss schedule.\n"
        f"{indent}const odCountdown = document.createElement('span');\n"
        f"{indent}odCountdown.id = 'od1NextRecoveryCountdown';\n"
        f"{indent}odCountdown.className = 'od1-next-recovery-countdown';\n"
        f"{indent}$('hwWeekLabel').append(' · ', odCountdown);\n"
        f"{indent}updateOd1NextRecoveryCountdown();"
    )
    source = source[:match.start()] + new_label + source[match.end():]

    if 'function updateOd1NextRecoveryCountdown(' in source:
        raise RuntimeError('Countdown helper already exists but patch marker absent; needs manual review')
    helper = '''
// Live countdown uses the same official KST refill boundaries as the Od1 balance calculation.
function updateOd1NextRecoveryCountdown() {
  const target = $('od1NextRecoveryCountdown');
  if (!target || !target.isConnected || activeSection !== 'homework') return;
  const now = Math.floor(Date.now() / 1000);
  const next = nextOdRecoveryAt(now);
  const seconds = Math.max(0, next - now);
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const atKst = new Date((next + 9 * 3600) * 1000).toISOString().slice(11, 16);
  target.textContent = `오드1 다음 자연회복까지 ${hh}:${mm}:${ss} (${atKst} 예정)`;
}
// No network calls, D1 writes, or cron; only update the visible label.
setInterval(updateOd1NextRecoveryCountdown, 1000);
'''
    source += helper

    source = replace_once(source,
        '비고는 성역별로 관리됩니다.',
        '일정 비고도 4·3성역에서 자동 동기화됩니다. 캐릭터별 파티 비고는 성역별로 유지됩니다.',
        '4/3 shared schedule message')
    source = replace_once(source,
        '다른 성역의 요일별 일정도 동기화되었습니다.',
        '다른 성역의 요일별 일정과 비고도 동기화되었습니다.',
        'save confirmation')
    return source


def change_worker(source: str) -> str:
    if 'AION2_OD_COUNTDOWN_SHARED_NOTES_V1' in source:
        return source
    source = replace_once(source,
        '// 2성역은 독립적이다. 성역별 비고도 별도로 저장한다.',
        '// 2성역은 독립적이다. 일정 비고는 4·3성역에서 공통 저장하고, 캐릭터별 파티 비고는 성역별로 보관한다.',
        'shared schedule note comment')
    source = replace_once(source,
        "env.DB.prepare('DELETE FROM sanctuary_shared_availability WHERE week_start < ?').bind(week),",
        "env.DB.prepare('DELETE FROM sanctuary_shared_availability WHERE week_start < ?').bind(week),\n"
        "    env.DB.prepare('DELETE FROM sanctuary_shared_schedule_notes WHERE week_start < ?').bind(week),",
        'weekly note cleanup')

    old_get = '''        "COALESCE(local.note, '') AS note, COALESCE(shared.updated_by, '') AS updated_by, " +
        'COALESCE(shared.updated_at, 0) AS updated_at ' +
        'FROM sanctuary_members m ' +
        'LEFT JOIN sanctuary_shared_availability shared ' +
        'ON shared.week_start = ? AND shared.nickname = m.nickname ' +
        'LEFT JOIN sanctuary_schedules local ' +
        'ON local.sanctuary = m.sanctuary AND local.week_start = ? AND local.nickname = m.nickname ' +
        'WHERE m.sanctuary = ? ORDER BY m.nickname COLLATE NOCASE LIMIT 300'
    '''
    new_get = '''        "COALESCE(shared_note.note, '') AS note, COALESCE(shared.updated_by, shared_note.updated_by, '') AS updated_by, " +
        'COALESCE(shared.updated_at, shared_note.updated_at, 0) AS updated_at ' +
        'FROM sanctuary_members m ' +
        'LEFT JOIN sanctuary_shared_availability shared ' +
        'ON shared.week_start = ? AND shared.nickname = m.nickname ' +
        'LEFT JOIN sanctuary_shared_schedule_notes shared_note ' +
        'ON shared_note.week_start = ? AND shared_note.nickname = m.nickname ' +
        'WHERE m.sanctuary = ? ORDER BY m.nickname COLLATE NOCASE LIMIT 300'
    '''
    source = replace_once(source, old_get.rstrip(), new_get.rstrip(), '4/3 shared note SELECT')

    old_post = '''      const noteSave = empty
        ? env.DB.prepare('DELETE FROM sanctuary_schedules WHERE sanctuary = ? AND week_start = ? AND nickname = ?')
          .bind(sanctuary, weekStart, user.nickname)
        : env.DB.prepare(
          'INSERT INTO sanctuary_schedules (sanctuary, week_start, nickname, statuses, note, updated_by, updated_at) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(sanctuary, week_start, nickname) DO UPDATE SET ' +
          'note = excluded.note, statuses = excluded.statuses, updated_by = excluded.updated_by, updated_at = excluded.updated_at'
        ).bind(sanctuary, weekStart, user.nickname, text, note, user.nickname, now);'''
    new_post = '''      // AION2_OD_COUNTDOWN_SHARED_NOTES_V1: 4/3 schedule notes are shared per week+nickname.
      const noteSave = note === ''
        ? env.DB.prepare('DELETE FROM sanctuary_shared_schedule_notes WHERE week_start = ? AND nickname = ?')
          .bind(weekStart, user.nickname)
        : env.DB.prepare(
          'INSERT INTO sanctuary_shared_schedule_notes (week_start, nickname, note, updated_by, updated_at) ' +
          'VALUES (?, ?, ?, ?, ?) ON CONFLICT(week_start, nickname) DO UPDATE SET ' +
          'note = excluded.note, updated_by = excluded.updated_by, updated_at = excluded.updated_at'
        ).bind(weekStart, user.nickname, note, user.nickname, now);'''
    source = replace_once(source, old_post, new_post, '4/3 shared note UPSERT')
    return source


def change_html(source: str) -> str:
    if 'AION2_OD_COUNTDOWN_SHARED_NOTES_V1' in source:
        return source
    css = '''    /* AION2_OD_COUNTDOWN_SHARED_NOTES_V1 */
    .od1-next-recovery-countdown { display:inline-block; font-variant-numeric:tabular-nums; color:var(--gold); font-weight:700; white-space:nowrap; }
'''
    source = replace_once(source, '</style>', css + '  </style>', 'countdown style')
    # Preserve any manually customized naming such as 오드구매&제작.
    return source


def main():
    paths = [JS, HTML, WORKER]
    for path in paths:
        if not path.is_file():
            raise RuntimeError(f'File not found: {path}')
    originals = [p.read_text(encoding='utf-8') for p in paths]
    replacements = [change_frontend(originals[0]), change_html(originals[1]), change_worker(originals[2])]
    for path, old, new in zip(paths, originals, replacements):
        if old == new:
            print(f'Skipped (already patched): {path.relative_to(ROOT)}')
        else:
            path.write_text(new, encoding='utf-8')
            print(f'Patched: {path.relative_to(ROOT)}')
    print('Next: apply D1 migration 0019, then deploy. Do NOT deploy if migration fails.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        sys.exit(1)
