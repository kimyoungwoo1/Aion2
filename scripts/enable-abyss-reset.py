#!/usr/bin/env python3
"""Wrangler 바인딩/기존 Secret 설정 보존, 어비스회랑 Cron 추가."""
from pathlib import Path
import json
path = Path('wrangler.jsonc')
if not path.exists(): raise SystemExit('프로젝트 최상위(/workspaces/Aion2)에서 실행하세요.')
original = path.read_text(encoding='utf-8')
try:
    config = json.loads(original)
except json.JSONDecodeError:
    raise SystemExit('wrangler.jsonc에 주석이 있으면 triggers.crons에 수동으로 추가해 주세요.')
triggers = config.setdefault('triggers', {})
existing = triggers.get('crons', [])
if not isinstance(existing,list): raise SystemExit('triggers.crons는 배열이어야 합니다.')
# 일반 숙제/성역은 수요일 05:00 KST = 화요일 20:00 UTC
# 어비스회랑은 수/토 21:00 KST = 수/토 12:00 UTC
needed = ['0 20 * * TUE', '0 12 * * WED,SAT']
obsolete = {'0 15 * * SUN', '0 15 * * TUE'}
triggers['crons'] = list(dict.fromkeys([*(c for c in existing if c not in obsolete), *needed]))
updated = json.dumps(config, ensure_ascii=False, indent=2) + '\n'
if updated != original:
    backup=Path('wrangler.jsonc.before-abyss-reset.bak')
    if not backup.exists(): backup.write_text(original,encoding='utf-8')
    path.write_text(updated,encoding='utf-8')
print('Cron 설정:', triggers['crons'])
