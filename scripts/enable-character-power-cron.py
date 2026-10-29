#!/usr/bin/env python3
"""Preserve existing wrangler.jsonc settings while enabling character auto-refresh Cron.
Adds existing weekly and abyss reset crons if missing, to avoid disabling them.
"""
import json
import pathlib
import re
import shutil
import sys

path = pathlib.Path('wrangler.jsonc')
if not path.is_file():
    sys.exit('wrangler.jsonc not found. Run this in /workspaces/Aion2.')
raw = path.read_text(encoding='utf-8')
# Wrangler JSONC may contain comments; remove them for validation only.
def strip_jsonc_comments(data):
    out = []
    pos = 0
    quoted = False
    escaped = False
    while pos < len(data):
        ch = data[pos]
        if quoted:
            out.append(ch)
            if escaped: escaped = False
            elif ch == '\\': escaped = True
            elif ch == '"': quoted = False
            pos += 1
        elif ch == '"':
            quoted = True
            out.append(ch)
            pos += 1
        elif ch == '/' and data[pos:pos+2] in ('//', '/*'):
            if data[pos:pos+2] == '//':
                end = data.find('\n', pos+2)
                pos = len(data) if end == -1 else end
            else:
                end = data.find('*/', pos+2)
                if end == -1: raise ValueError('Unclosed comment')
                pos = end+2
        else:
            out.append(ch)
            pos += 1
    return re.sub(r',\s*([}\]])', r'\1', ''.join(out))

try:
    config = json.loads(strip_jsonc_comments(raw))
except (ValueError, json.JSONDecodeError) as err:
    sys.exit(f'Cannot parse wrangler.jsonc: {err}. No changes made.')
if not isinstance(config, dict):
    sys.exit('Unexpected wrangler root. No changes made.')
triggers = config.setdefault('triggers', {})
if not isinstance(triggers, dict):
    sys.exit('triggers field must be an object. No changes made.')
crons = triggers.setdefault('crons', [])
if not isinstance(crons, list) or not all(isinstance(x, str) for x in crons):
    sys.exit('triggers.crons must be a list of strings. No changes made.')
required = [
    '0 20 * * TUE',        # KST Wed 05:00
    '0 12 * * WED,SAT',    # KST Wed/Sat 21:00
    '*/5 9,21 * * *'       # KST 06:00-06:55,18:00-18:55
]
added = [item for item in required if item not in crons]
if not added:
    print('All required Cron Triggers are already configured; no change.')
    sys.exit(0)
if len(crons) + len(added) > 5:
    sys.exit('Too many Cron Triggers for Workers Free plan (max 5). No changes made.')
crons.extend(added)
backup = path.with_name('wrangler.jsonc.before-power-cron.bak')
if not backup.exists(): shutil.copy2(path, backup)
# Original properties, IDs, secrets and service bindings remain in the config.
path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Added:', ', '.join(added))
print('Preserved all existing settings. Backup:', backup)
