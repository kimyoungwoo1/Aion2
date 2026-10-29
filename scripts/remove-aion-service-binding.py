#!/usr/bin/env python3
"""기존 wrangler.jsonc에서 aion2-api Service Binding만 제거한다.

D1, Cron Trigger, Secret 요구 사항 등 기존 설정은 그대로 둔다.
"""
import json
import pathlib
import shutil
import sys

path = pathlib.Path('wrangler.jsonc')
if not path.is_file():
    sys.exit('wrangler.jsonc 파일이 없습니다. 프로젝트 최상위에서 실행해 주세요.')

try:
    config = json.loads(path.read_text(encoding='utf-8'))
except json.JSONDecodeError as exc:
    sys.exit(f'wrangler.jsonc를 읽지 못했습니다: {exc}. 직접 services 설정을 확인해 주세요.')

services = config.get('services', [])
if not isinstance(services, list):
    sys.exit('services 설정이 배열이 아닙니다. 수동 확인이 필요합니다.')
remaining = [entry for entry in services if not (
    isinstance(entry, dict) and entry.get('binding') == 'AION_API' and entry.get('service') == 'aion2-api'
)]
if remaining == services:
    print('AION_API Service Binding이 없습니다. 변경하지 않았습니다.')
    sys.exit(0)

backup = path.with_name('wrangler.jsonc.before-api-integration.bak')
if not backup.exists():
    shutil.copy2(path, backup)
if remaining:
    config['services'] = remaining
else:
    config.pop('services', None)
path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('AION_API Service Binding만 제거했습니다.')
print('기존 설정 백업:', backup)
