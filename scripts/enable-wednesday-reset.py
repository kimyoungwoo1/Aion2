#!/usr/bin/env python3
"""wrangler.jsonc의 기존 설정과 Secret/D1/서비스 바인딩은 유지하며 수요일 초기화 Cron만 교체."""
import json
from pathlib import Path
p=Path('wrangler.jsonc')
if not p.exists():
    raise SystemExit('프로젝트 최상위(/workspaces/Aion2)에서 실행해 주세요.')
raw=p.read_text(encoding='utf-8')
try:
    conf=json.loads(raw)
except ValueError:
    raise SystemExit('wrangler.jsonc가 주석이 있는 JSONC입니다. 주석을 제거하거나 triggers.crons를 직접 수정해 주세요.')
crons=conf.get('triggers',{}).get('crons',[])
old='0 15 * * SUN'
new='0 15 * * TUE'
updated=[cron for cron in crons if cron != old]
if new not in updated: updated.append(new)
conf.setdefault('triggers',{})['crons']=updated
if conf != json.loads(raw):
    backup=p.with_name('wrangler.jsonc.before-wednesday.bak')
    if not backup.exists(): backup.write_text(raw,encoding='utf-8')
    p.write_text(json.dumps(conf,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('wrangler.jsonc 설정 갱신 완료 (기존 설정 백업됨)')
else:
    print('Cron 설정이 이미 최신 상태입니다.')
print('수요일 00:00 KST = 화요일 15:00 UTC:', ', '.join(updated))
