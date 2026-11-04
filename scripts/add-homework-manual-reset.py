#!/usr/bin/env python3
"""Apply AION2_HOMEWORK_MANUAL_RESET_V1 without replacing current site files.

Adds an authenticated, owner-scoped, current-period homework completion reset.
Never edits OD balances, memberships, character order, schedules, or wrangler.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'public/index.html'
APP = ROOT / 'public/app.js'
SERVER = ROOT / 'src/index.js'
MARK = 'AION2_HOMEWORK_MANUAL_RESET_V1'

SERVER_BLOCK = '''  // AION2_HOMEWORK_MANUAL_RESET_V1: completed tasks only; other data is untouched.
  if (method === 'POST' && path === '/api/homework/reset') {
    const body = await readJson(request);
    if (body.confirm !== true) {
      return json({error:'초기화 확인이 필요합니다.'},400);
    }
    // The nickname is obtained from the authenticated server-side session.
    // Do not accept user-supplied nicknames or character IDs for bulk reset.
    const week = currentWeekStart();
    const abyssPeriod = abyssResetPeriod();
    const result = await env.DB.prepare(`
      DELETE FROM homework_progress
      WHERE character_id IN (SELECT id FROM characters WHERE owner_name = ?)
        AND ((task_key = 'abyss' AND week_start = ?)
          OR (task_key <> 'abyss' AND week_start = ?))
    `).bind(nickname, abyssPeriod, week).run();
    return json({success:true,weekStart:week,resetCount:Number(result.meta?.changes ?? 0)});
  }

'''

CLIENT_BLOCK = '''// AION2_HOMEWORK_MANUAL_RESET_V1: clear ONLY completed tasks for this nickname.
$('hwReset').addEventListener('click', async () => {
  const resetButton = $('hwReset');
  if (!homeworkData || !user) {
    $('hwMessage').textContent = '숙제 현황을 먼저 불러와 주세요.';
    return;
  }
  const list = homeworkData.characters || [];
  const completed = list.reduce((n, ch) => n + (ch.completed?.length || 0), 0);
  if (list.length === 0 || completed === 0) {
    $('hwMessage').textContent = '현재 초기화할 완료 기록이 없습니다.';
    return;
  }
  const accepted = window.confirm(
    `${user.nickname} 님의 캐릭터 ${list.length}명에서 이번 주 숙제 완료 기록 ${completed}개를 모두 미완료로 초기화할까요?\\n\\n` +
    '어비스회랑의 현재 회차 완료 기록도 초기화됩니다.\\n' +
    '오드1·오드2, 멤버십, 캐릭터 정렬 순서는 유지됩니다.\\n' +
    '초기화한 완료 기록은 자동 복원되지 않습니다.'
  );
  if (!accepted) return;
  resetButton.disabled = true;
  $('hwReload').disabled = true;
  $('hwMessage').textContent = '숙제 완료 기록을 초기화하는 중...';
  try {
    const result = await api('/api/homework/reset', 'POST', {confirm:true});
    await loadHomework();
    $('hwMessage').textContent = `초기화 완료: 완료 기록 ${result.resetCount}개를 미완료로 변경했습니다. 오드와 정렬 순서는 그대로 유지됩니다.`;
  } catch (error) {
    $('hwMessage').textContent = `현황 초기화 실패: ${error.message}`;
  } finally {
    resetButton.disabled = false;
    $('hwReload').disabled = false;
  }
});

'''


def patch(html, app, server):
    presence = [MARK in html, MARK in app, MARK in server]
    if all(presence):
        return None
    if any(presence) or 'id="hwReset"' in html or "path === '/api/homework/reset'" in server:
        raise RuntimeError('이전 부분 적용 흔적이 있습니다. 자동 적용을 중단했습니다.')

    # Insert right before the existing reload button, preserving surrounding layout.
    reload_button = re.search(r"""<button\b[^>]*\bid=['"]hwReload['"][^>]*>\s*새로고침\s*</button>""", html)
    if not reload_button:
        # One more attempt allowing attributes and label changes.
        reload_button = re.search(r"""<button\b[^>]*\bid=['"]hwReload['"][^>]*>.*?</button>""", html, re.S)
    if not reload_button:
        raise RuntimeError('public/index.html: hwReload 버튼을 찾지 못했습니다.')
    new_button = (
        '<!-- AION2_HOMEWORK_MANUAL_RESET_V1 -->'
        '<button class="danger small" id="hwReset" type="button" '
        'title="현재 로그인한 닉네임의 숙제 완료 상태만 초기화합니다">현황 초기화</button> '
    )
    html = html[:reload_button.start()] + new_button + html[reload_button.start():]

    reload_listener = "$('hwReload').addEventListener('click'"
    if app.count(reload_listener) != 1:
        raise RuntimeError('public/app.js: hwReload 이벤트 연결 위치가 변경되었습니다.')
    app = app.replace(reload_listener, CLIENT_BLOCK + reload_listener, 1)

    order_route = "  if (method === 'POST' && path === '/api/homework/order') {"
    if server.count(order_route) != 1 or 'async function homeworkApi(' not in server:
        raise RuntimeError('src/index.js: 숙제 API 연결 위치가 변경되었습니다.')
    server = server.replace(order_route, SERVER_BLOCK + order_route, 1)

    return html, app, server


def main():
    for file in (HTML, APP, SERVER):
        if not file.is_file():
            raise RuntimeError(f'필수 파일이 없습니다: {file}')
    original = [file.read_text(encoding='utf-8') for file in (HTML, APP, SERVER)]
    changed = patch(*original)
    if changed is None:
        print('이미 현황 초기화 기능이 적용되어 있습니다. 변경하지 않았습니다.')
        return
    # Prepare all new contents before writing. Leave local backups for emergency restoration.
    backups = ROOT / '.aion2-backups' / 'homework-manual-reset'
    backups.mkdir(parents=True, exist_ok=True)
    for file, text in zip((HTML, APP, SERVER), original):
        target = backups / file.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_text(text, encoding='utf-8')
    for file, text in zip((HTML, APP, SERVER), changed):
        file.write_text(text, encoding='utf-8')
    print('완료: 현황 초기화 버튼 + 로그인 닉네임별 숙제 초기화 API 추가 (오드·정렬·멤버십 유지)')
    print('새 D1 마이그레이션은 필요하지 않습니다.')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'오류: {e}', file=sys.stderr)
        sys.exit(1)
