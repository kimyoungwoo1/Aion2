#!/usr/bin/env python3
"""현재 Wrangler 설정을 보존하면서 한국시간 월요일 00시 Cron을 추가한다."""
import json
from pathlib import Path
p=Path('wrangler.jsonc')
if not p.is_file():
    raise SystemExit('프로젝트 최상위에서 실행하세요 (wrangler.jsonc를 찾지 못함)')
raw=p.read_text(encoding='utf-8')
try:
    data=json.loads(raw)
except ValueError:
    raise SystemExit('wrangler.jsonc에 JSON 주석이 있으면 수동으로 triggers 설정을 추가하세요.')
old=data.get('triggers',{}).get('crons',[])
if '0 15 * * SUN' not in old:
    data.setdefault('triggers',{})['crons'] = old + ['0 15 * * SUN']
    p.with_suffix('.jsonc.backup').write_text(raw,encoding='utf-8')
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('기존 설정 백업: wrangler.jsonc.backup')
print('설정 완료: 일요일 15:00 UTC = 월요일 00:00 KST')
