#!/usr/bin/env python3
"""Remove AION2 admin password 12-character minimum without overwriting admin/IP changes."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
API = ROOT / "src" / "admin-api.js"
HTML = ROOT / "public" / "admin.html"


def patch_api(original: str) -> str:
    old_check = "env.ADMIN_PASSWORD.length >= 12"
    new_check = "env.ADMIN_PASSWORD.length > 0"
    old_message = "ADMIN_PASSWORD Secret을 12자 이상으로 설정해 주세요."
    new_message = "ADMIN_PASSWORD Secret 설정을 확인해 주세요. (공용 접속 코드와 다른 값이어야 합니다.)"
    if old_check not in original and new_check not in original:
        raise ValueError("관리자 비밀번호 검사 코드를 찾지 못했습니다. 파일을 확인해 주세요.")
    if original.count(old_check) > 1 or original.count(old_message) > 1:
        raise ValueError("관리자 비밀번호 검사 코드가 중복되어 있습니다. 자동 수정을 중단합니다.")
    result = original.replace(old_check, new_check, 1)
    result = result.replace(old_message, new_message, 1)
    # Never weaken the separate-secret rule or accidental very long secrets.
    if "env.ADMIN_PASSWORD !== env.ACCESS_CODE" not in result:
        raise ValueError("기존 공용 접속 코드와 구분하는 보안 검사가 없어 수정하지 않습니다.")
    return result


def patch_html(original: str) -> str:
    if 'id="adminPassword"' not in original:
        raise ValueError("관리자 비밀번호 입력칸을 찾지 못했습니다.")
    if original.count('minlength="12"') > 1:
        raise ValueError("12자 제한이 여러 곳에 있어 자동 수정을 중단합니다.")
    return original.replace(' minlength="12"', '', 1)


def main():
    for f in (API, HTML):
        if not f.is_file():
            raise FileNotFoundError(f"필수 파일 없음: {f}")
    original_api = API.read_text(encoding='utf-8')
    original_html = HTML.read_text(encoding='utf-8')
    updated_api = patch_api(original_api)
    updated_html = patch_html(original_html)
    changed = []
    if updated_api != original_api:
        API.write_text(updated_api, encoding='utf-8')
        changed.append(str(API.relative_to(ROOT)))
    if updated_html != original_html:
        HTML.write_text(updated_html, encoding='utf-8')
        changed.append(str(HTML.relative_to(ROOT)))
    print('수정 완료: ' + (', '.join(changed) if changed else '이미 12자 제한이 해제되어 있습니다.'))
    print('기존 관리자 비밀번호 인증, IP 이력, 별도 Secret 정책은 유지됩니다.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
