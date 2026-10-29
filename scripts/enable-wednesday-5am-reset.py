#!/usr/bin/env python3
"""기존 wrangler.jsonc 바인딩·Secret·D1 UUID를 보존하며 수요일 05:00 KST cron만 갱신."""
import json
from pathlib import Path

p=Path('wrangler.jsonc')
if not p.exists(): raise SystemExit('프로젝트 최상위에서 실행하세요.')
original=p.read_text(encoding='utf-8')
try: config=json.loads(original)
except json.JSONDecodeError: raise SystemExit('wrangler.jsonc의 주석을 제거하거나 triggers.crons를 직접 수정하세요.')
triggers=config.setdefault('triggers',{})
old_crons={'0 15 * * SUN','0 15 * * TUE','0 20 * * TUE'}
others=[c for c in triggers.get('crons',[]) if c not in old_crons]
triggers['crons']=[*others,'0 20 * * TUE']
updated=json.dumps(config,ensure_ascii=False,indent=2)+'\n'
if updated != original:
    backup=Path('wrangler.jsonc.before-5am.bak')
    if not backup.exists(): backup.write_text(original,encoding='utf-8')
    p.write_text(updated,encoding='utf-8')
print('설정 완료: 매주 수요일 05:00 KST (UTC 화요일 20:00)')
print('triggers.crons =',triggers['crons'])
