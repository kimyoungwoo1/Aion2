#!/usr/bin/env python3
"""Move only sanctuary participation reset to Monday 00:00 KST.

Keeps Wed-Tue date headings, homework/abyss triggers, and all permanent roster data.
Patches existing files in-place, retaining user modifications. Fail-closed.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
PATHS = [ROOT / 'src/index.js', ROOT / 'public/app.js', ROOT / 'public/index.html']
MARKER = 'AION2_SANCTUARY_MONDAY_RESET_KEEP_WED_TUE_V2'


def replace_once(text, before, after, name):
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'{name}: expected 1 occurrence, found {count}; no files changed')
    return text.replace(before, after, 1)


def worker(text):
    if MARKER in text:
        return text
    if 'AION2_SANCTUARY_MONDAY_RESET_V1' in text:
        raise RuntimeError('Earlier Mon-Sun draft is present. Restore its .aion2-backups before using this patch.')
    hook = 'function currentWeekStart(timestamp = Date.now()) {'
    add = '''// AION2_SANCTUARY_MONDAY_RESET_KEEP_WED_TUE_V2
// Sanctuary's stored key is still a Wednesday (seven columns: Wed..Tue),
// but it switches at Monday 00:00 KST instead of Wednesday 05:00.
// Mon/Tue point at the upcoming Wednesday, so Wednesday itself does NOT reset again.
function currentSanctuaryWeekStart(timestamp = Date.now()) {
  const korea = new Date(timestamp + 9 * 60 * 60 * 1000);
  const daysSinceMonday = (korea.getUTCDay() + 6) % 7;
  korea.setUTCDate(korea.getUTCDate() - daysSinceMonday + 2);
  return korea.toISOString().slice(0, 10);
}

'''
    text = replace_once(text, hook, add + hook, 'sanctuary period helper')
    checks = 'weekStart !== currentWeekStart()'
    if text.count(checks) != 2:
        raise RuntimeError(f'sanctuary week checks: expected 2, found {text.count(checks)}')
    text = text.replace(checks, 'weekStart !== currentSanctuaryWeekStart()')
    # Both the GET and POST continue to validate the Wednesday key; no schema changes.
    if text.count('validWednesday(weekStart)') != 2:
        raise RuntimeError('Sanctuary date validation has changed; patch aborted')
    signature = 'async function cleanOldWeeklyData(env, week = currentWeekStart(), abyssPeriod = abyssResetPeriod()) {'
    text = replace_once(text, signature,
        'async function cleanOldWeeklyData(env, week = currentWeekStart(), abyssPeriod = abyssResetPeriod(), sanctuaryWeek = currentSanctuaryWeekStart()) {',
        'cleanup function signature')
    # No destructive cleanup of non-schedule data. Shared 4/3 notes remain synced.
    tables = ['sanctuary_shared_availability', 'sanctuary_shared_schedule_notes', 'sanctuary_schedules']
    for table in tables:
        before = "env.DB.prepare('DELETE FROM " + table + " WHERE week_start < ?').bind(week)"
        text = replace_once(text, before, before.replace('.bind(week)', '.bind(sanctuaryWeek)'), f'{table} cleanup')
    call = 'await cleanOldWeeklyData(env, currentWeekStart(controller.scheduledTime), abyssResetPeriod(controller.scheduledTime));'
    text = replace_once(text, call,
        'await cleanOldWeeklyData(env, currentWeekStart(controller.scheduledTime), abyssResetPeriod(controller.scheduledTime), currentSanctuaryWeekStart(controller.scheduledTime));',
        'scheduled cleanup')
    return text


def app(text):
    if MARKER in text:
        return text
    if 'AION2_SANCTUARY_MONDAY_RESET_V1' in text:
        raise RuntimeError('Earlier Mon-Sun draft is present. Restore its .aion2-backups before using this patch.')
    if "const weekDayNames = ['수', '목', '금', '토', '일', '월', '화'];" not in text:
        raise RuntimeError('Wed-Tue order was not found; patch aborted')
    # The display ordering and weekDates() are not changed, only when the key switches.
    before = '''function wednesdayFor(date) {
  const d = new Date(date + 'T00:00:00Z');
  return shiftDay(date, -((d.getUTCDay() + 4) % 7));
}'''
    after = before + '''
// AION2_SANCTUARY_MONDAY_RESET_KEEP_WED_TUE_V2
// Calendar columns remain Wed..Tue. At Monday midnight, switch to the next
// Wednesday's seven-day view; do not switch again on Wednesday morning.
function sanctuaryWednesdayForCurrentCycle() {
  const kstDay = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  return wednesdayFor(shiftDay(kstDay, 2));
}'''
    text = replace_once(text, before, after, 'frontend Wednesday view helper')
    start = 'wednesdayFor(seoulResetDay())'
    if text.count(start) != 2:
        raise RuntimeError(f'active week references: expected 2, found {text.count(start)}')
    text = text.replace(start, 'sanctuaryWednesdayForCurrentCycle()')
    # Clarify that the old special Wednesday 05:00 date helper no longer applies to sanctuary.
    old_day = '''// 한국시간 수요일 05:00을 주간 경계로 취급합니다.
// 05:00 이전의 수요일은 아직 직전 주입니다.
function seoulResetDay() {
  return new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
}
'''
    text = replace_once(text, old_day, '', 'remove obsolete frontend reset helper')
    text = text.replace('// 이번 주만 유지: 매주 수요일 오전 5시(KST)에 새 주차로 전환한다.',
        '// 성역 일정은 매주 월요일 00:00(KST)에 다음 수~화 주차로 전환한다.')
    text = text.replace('// 사이트를 수요일 오전 5시에도 계속 열어 놓았으면 다음 주로 전환한다.',
        '// 월요일 00:00(KST)에 계속 열어 둔 화면도 새 성역 주차로 전환한다.')
    return text


def html(text):
    if MARKER in text:
        return text
    old = '성역 참여 일정은 <strong>매주 수요일 오전 5시(KST)</strong>'
    new = '성역 참여 일정은 <strong>매주 월요일 00:00(KST)</strong> <!-- AION2_SANCTUARY_MONDAY_RESET_KEEP_WED_TUE_V2 -->'
    return replace_once(text, old, new, 'sanctuary reset label')


def main():
    for path in PATHS:
        if not path.is_file():
            raise RuntimeError(f'Missing: {path.relative_to(ROOT)}')
    original = [p.read_text(encoding='utf-8') for p in PATHS]
    updated = [worker(original[0]), app(original[1]), html(original[2])]
    backup = ROOT / '.aion2-backups' / 'sanctuary-reset-mon-keep-wed-tue'
    # All validations completed; make backups and write only changed files.
    for path, old, new in zip(PATHS, original, updated):
        if new != old:
            dest = backup / path.relative_to(ROOT)
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists():
                dest.write_text(old, encoding='utf-8')
            path.write_text(new, encoding='utf-8')
            print('Patched:', path.relative_to(ROOT))
        else:
            print('Already patched:', path.relative_to(ROOT))
    print('Sanctuary 4/3/2: weekly view Wed-Tue, period switches Monday 00:00 KST.')
    print('Homework still resets Wed 05:00 KST. No D1 migration is required.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('ERROR:', exc, file=sys.stderr)
        sys.exit(1)
