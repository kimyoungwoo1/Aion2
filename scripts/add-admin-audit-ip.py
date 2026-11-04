#!/usr/bin/env python3
"""Add administrator-only source IPs to previously installed AION2 audit events.
Patch existing files instead of replacing users' current modified project files.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
MARK = 'AION2_ADMIN_AUDIT_IP_V1'


def replace_once(data, needle, replacement, label):
    count = data.count(needle)
    if count != 1:
        raise ValueError(f'{label}: expected one match, found {count}; unchanged.')
    return data.replace(needle, replacement, 1)


def audit_module(source):
    if MARK in source:
        return source
    source = replace_once(source,
        "const MAX_JSON = 3500;",
        """const MAX_JSON = 3500;

// AION2_ADMIN_AUDIT_IP_V1: trusted Cloudflare edge address only.
// Never take an address from request JSON, X-Forwarded-For or X-Real-IP.
export function readClientIp(request) {
  const value = (request.headers.get('CF-Connecting-IP') || '').trim();
  if (!value || value.length > 45) return null;
  if (/^\\d{1,3}(?:\\.\\d{1,3}){3}$/.test(value)) {
    return value.split('.').every(part => Number(part) <= 255) ? value : null;
  }
  // Cloudflare can supply compressed IPv6; validate plausible text and length.
  if (value.includes(':') && /^[0-9a-fA-F:.]+$/.test(value) &&
      (value.match(/:/g) || []).length >= 2) return value;
  return null;
}""",
        'audit IP reader')
    source = replace_once(source,
        '(occurred_at,actor_nickname,category,action,target,summary,details_json,previous_json,current_json)\n      VALUES (?,?,?,?,?,?,?,?,?)',
        '(occurred_at,actor_nickname,actor_ip,category,action,target,summary,details_json,previous_json,current_json)\n      VALUES (?,?,?,?,?,?,?,?,?,?)',
        'audit insert SQL')
    source = replace_once(source,
        '.bind(Math.floor(Date.now()/1000), actor, kind.category, kind.action, kind.target,',
        '.bind(Math.floor(Date.now()/1000), actor, readClientIp(request), kind.category, kind.action, kind.target,',
        'audit insert bindings')
    return source


def admin_api(source):
    if MARK in source:
        return source
    source = replace_once(source,
        "    const actor = (url.searchParams.get('actor') || '').trim().slice(0,30);",
        "    const actor = (url.searchParams.get('actor') || '').trim().slice(0,30);\n" +
        "    const ipFilter = (url.searchParams.get('ip') || '').trim().slice(0,45); // AION2_ADMIN_AUDIT_IP_V1",
        'admin filter')
    source = replace_once(source,
        'SELECT id,occurred_at,actor_nickname,category,action,target,summary,',
        'SELECT id,occurred_at,actor_nickname,actor_ip,category,action,target,summary,',
        'admin list SELECT')
    source = replace_once(source,
        "    if (cursor) { sql += ' AND id<?'; args.push(cursor); }",
        """    if (ipFilter) {
      // Bound parameter and escaped LIKE wildcards; filter never bypasses admin auth.
      sql += " AND actor_ip LIKE ? ESCAPE '\\\\'";
      args.push('%' + ipFilter.replace(/[\\\\%_]/g,'\\\\$&') + '%');
    }
    if (cursor) { sql += ' AND id<?'; args.push(cursor); }""",
        'admin IP filter SQL')
    source = replace_once(source,
        'id: row.id, occurredAt:row.occurred_at, actor:row.actor_nickname, category:row.category,',
        'id: row.id, occurredAt:row.occurred_at, actor:row.actor_nickname, ip:row.actor_ip || null, category:row.category,',
        'admin event response')
    return source


def admin_js(source):
    if MARK in source:
        return source
    source = replace_once(source,
        'textCell(row,date);textCell(row,item.actor);',
        "textCell(row,date);textCell(row,item.actor);const ipCell=textCell(row,item.ip || '기록 없음');ipCell.className='ip-cell'; // AION2_ADMIN_AUDIT_IP_V1",
        'IP column render')
    source = replace_once(source,
        'cell.colSpan=6;', 'cell.colSpan=7;', 'empty row colspan')
    source = replace_once(source,
        "    if(actor)qs.set('actor',actor);",
        "    if(actor)qs.set('actor',actor);\n    const ip=$('ipFilter').value.trim();if(ip)qs.set('ip',ip);",
        'IP filter query')
    source = replace_once(source,
        "$('actorFilter').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();nextCursor=null;loadHistory();}});",
        "$('actorFilter').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();nextCursor=null;loadHistory();}});\n" +
        "$('ipFilter').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();nextCursor=null;loadHistory();}});",
        'IP filter enter')
    return source


def admin_html(source):
    if MARK in source:
        return source
    source = replace_once(source,
        "        <label>로그인 닉네임\n          <input id=\"actorFilter\" maxlength=\"30\" placeholder=\"전체 사용자\">\n        </label>",
        """        <label>로그인 닉네임
          <input id="actorFilter" maxlength="30" placeholder="전체 사용자">
        </label>
        <!-- AION2_ADMIN_AUDIT_IP_V1 -->
        <label>접속 IP
          <input id="ipFilter" maxlength="45" placeholder="전체 IP / 일부 입력">
        </label>""",
        'IP search field')
    source = replace_once(source,
        '<th>변경 시각 (KST)</th><th>닉네임</th><th>기능</th>',
        '<th>변경 시각 (KST)</th><th>닉네임</th><th>IP 주소</th><th>기능</th>',
        'IP column header')
    source = replace_once(source,
        '<p class="footer-note">이력에는 로그인할 때 사용한 닉네임이 표시됩니다.',
        '<p class="footer-note">관리 목적으로 변경 요청 시 접속 IP 주소가 기록되며, 관리자에게만 표시됩니다. IP는 공용망·VPN 등에서 여러 사용자가 공유할 수 있으므로 개인 식별을 보장하지 않습니다. 기존 기록의 IP는 소급 수집할 수 없습니다.<br>이력에는 로그인할 때 사용한 닉네임이 표시됩니다.',
        'IP data notice')
    # Force updated admin JS and CSS requests to avoid stale browser assets.
    source = source.replace('admin.js?v=20261104', 'admin.js?v=20261104ip1')
    source = source.replace('admin.css?v=20261104', 'admin.css?v=20261104ip1')
    return source


def admin_css(source):
    if MARK in source:
        return source
    source = replace_once(source,
        'td:nth-child(4){min-width:170px}',
        'td:nth-child(5){min-width:170px}',
        'admin table column numbering')
    source = replace_once(source,
        'table{border-collapse:collapse;width:100%;min-width:850px}',
        'table{border-collapse:collapse;width:100%;min-width:1020px}',
        'wider admin table with IP')
    return source + "\n/* AION2_ADMIN_AUDIT_IP_V1 */\n.ip-cell{white-space:nowrap;font-variant-numeric:tabular-nums;color:#cbd9ea}\n"



def admin_audit_test(source):
    if MARK in source:
        return source
    source = replace_once(source,
        'const [time,actor,category,action,object,summary,detail,oldValue,newValue]=persisted[0].args;',
        'const [time,actor,ip,category,action,object,summary,detail,oldValue,newValue]=persisted[0].args; // AION2_ADMIN_AUDIT_IP_V1',
        'existing test destructuring')
    source = replace_once(source,
        "assert.equal(actor,'슬롱');assert.equal(category,'od');assert.equal(action,'balance');",
        "assert.equal(actor,'슬롱');assert.equal(ip,null);assert.equal(category,'od');assert.equal(action,'balance');",
        'existing audit test')
    return source


def main():
    paths = {
        ROOT / 'src/audit-log.js':audit_module,
        ROOT / 'src/admin-api.js':admin_api,
        ROOT / 'public/admin.js':admin_js,
        ROOT / 'public/admin.html':admin_html,
        ROOT / 'public/admin.css':admin_css,
    }
    old_test = ROOT / 'tests/test-admin-audit.mjs'
    if old_test.is_file(): paths[old_test] = admin_audit_test
    sql = ROOT / 'migrations/0023_admin_audit_ip.sql'
    if not sql.is_file():
        raise ValueError('Migration 0023_admin_audit_ip.sql missing. Unzip the patch first.')
    collisions = [p.name for p in (ROOT / 'migrations').glob('0023_*.sql') if p.name != sql.name]
    if collisions:
        raise ValueError('Migration 0023 collides: ' + ', '.join(collisions) + '. Resolve before applying.')
    missing = [str(p) for p in paths if not p.is_file()]
    if missing:
        raise ValueError('Install the previous admin history feature first. Missing: ' + ', '.join(missing))
    before = {p:p.read_text(encoding='utf-8') for p in paths}
    # Preflight all edits so failed anchor checks leave the project unchanged.
    after = {p:fn(before[p]) for p,fn in paths.items()}
    changed = [p for p in paths if before[p] != after[p]]
    if not changed:
        print('Already applied: no files changed.')
        return
    backup = ROOT / '.aion2-backups' / 'audit-ip'
    backup.mkdir(parents=True,exist_ok=True)
    for p in changed:
        dest = backup / (p.relative_to(ROOT).as_posix().replace('/','__') + '.before-ip.bak')
        if not dest.exists():dest.write_text(before[p],encoding='utf-8')
    for p in changed:p.write_text(after[p],encoding='utf-8')
    print(f'OK: added IP auditing to {len(changed)} admin files; other site files untouched.')
    print('Next: migrate D1, then deploy. Historic audit entries will show IP as missing.')

if __name__ == '__main__':
    try:main()
    except (ValueError,OSError) as error:
        print('STOP:',error,file=sys.stderr)
        sys.exit(1)
