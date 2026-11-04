#!/usr/bin/env python3
"""Add only UTC Sunday 15:00 (KST Monday 00:00) sanctuary cleanup trigger.
Preserves existing triggers, comments, and all other Wrangler configuration.
"""
from pathlib import Path
import re
import json
import sys

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / 'wrangler.jsonc'
CRON = '0 15 * * SUN'


def strip_jsonc(s):
    # Simple scanner: recognize both JSONC comment styles without removing // in strings.
    out, i, quoted, escaped = [], 0, False, False
    while i < len(s):
        c = s[i]
        if quoted:
            out.append(c)
            if escaped: escaped = False
            elif c == '\\': escaped = True
            elif c == '"': quoted = False
            i += 1
        elif c == '"': quoted = True; out.append(c); i += 1
        elif s[i:i+2] == '//':
            end = s.find('\n', i)
            i = len(s) if end == -1 else end
        elif s[i:i+2] == '/*':
            end = s.find('*/', i+2)
            if end == -1: raise RuntimeError('Unclosed JSONC block comment')
            i = end+2
        else: out.append(c); i += 1
    return re.sub(r',\s*([}\]])', r'\1', ''.join(out))


def main():
    if not FILE.exists(): raise RuntimeError('wrangler.jsonc not found')
    raw = FILE.read_text(encoding='utf-8')
    config = json.loads(strip_jsonc(raw))
    triggers = config.get('triggers', {})
    if not isinstance(triggers, dict): raise RuntimeError('Invalid triggers')
    crons = triggers.get('crons', [])
    if not isinstance(crons, list): raise RuntimeError('Invalid triggers.crons')
    if CRON in crons:
        print('Already configured:', CRON)
        return
    if len(crons) >= 5: raise RuntimeError('Five Cron triggers already configured; inspect before adding')
    # Replace ONLY the existing cron array if present, otherwise add a new triggers block.
    match = re.search(r'("crons"\s*:\s*)\[([^\]]*)\]', raw, re.S)
    if match:
        existing = match.group(2)
        # Reject unfamiliar constructs rather than modify a comment with surprising syntax.
        if '/*' in existing or '//' in existing:
            raise RuntimeError('Comments within crons array need manual review')
        array = match.group(0)
        prefix = ', ' if existing.strip() else ''
        new_array = match.group(1) + '[' + existing.rstrip() + prefix + json.dumps(CRON) + ']'
        result = raw[:match.start()] + new_array + raw[match.end():]
    elif '"triggers"' not in raw:
        # Insert triggers before closing top-level object, preserving all settings.
        last = raw.rfind('}')
        if last < 0: raise RuntimeError('Invalid JSONC root')
        before = raw[:last].rstrip()
        sep = '' if before.endswith('{') or before.endswith(',') else ','
        result = before + sep + '\n  "triggers": {"crons": ["' + CRON + '"]}\n' + raw[last:]
    else:
        raise RuntimeError('Existing triggers section has no crons array; add Cron manually')
    parsed = json.loads(strip_jsonc(result))
    expected = crons + [CRON]
    if parsed['triggers']['crons'] != expected:
        raise RuntimeError('Cron verification failed')
    for key in ('d1_databases','secrets','services','assets','name','main'):
        if parsed.get(key) != config.get(key):
            raise RuntimeError(f'Unexpected change to {key}')
    backup = ROOT / '.aion2-backups' / 'sanctuary-reset-mon-keep-wed-tue' / 'wrangler.jsonc'
    backup.parent.mkdir(parents=True, exist_ok=True)
    if not backup.exists(): backup.write_text(raw, encoding='utf-8')
    FILE.write_text(result, encoding='utf-8')
    print('Added:', CRON, '(Monday 00:00 KST)')
    print('All other triggers preserved:', ', '.join(expected))


if __name__ == '__main__':
    try: main()
    except Exception as exc:
        print('ERROR:', exc, file=sys.stderr)
        sys.exit(1)
