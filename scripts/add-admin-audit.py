#!/usr/bin/env python3
"""Add admin-only audit functionality to the current Aion2 Worker without replacing unrelated files."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
WORKER = ROOT / 'src' / 'index.js'
MARK = 'AION2_ADMIN_AUDIT_V1'


def once(data, old, new, label):
    count = data.count(old)
    if count != 1:
        raise ValueError(f'{label}: expected one anchor, found {count}. No files changed.')
    return data.replace(old, new, 1)


def patch(source):
    if MARK in source:
        print('Already installed: no changes needed.')
        return source
    anchor = 'import { lookupOfficialCharacter, OfficialAionLookupError } from "./aion-api.js";'
    source = once(source, anchor,
        anchor + '\nimport { handleAdminApi } from "./admin-api.js"; // AION2_ADMIN_AUDIT_V1'
        '\nimport { withAudit } from "./audit-log.js";', 'module imports')
    auth = "  if (path.startsWith('/api/homework')) return homeworkApi(request, env, path, user, now);"
    source = once(source, auth,
        "  // AION2_ADMIN_AUDIT_V1: gated by a separate admin secret and session cookie.\n"
        "  if (path.startsWith('/api/admin/')) {\n"
        "    return handleAdminApi(request, env, path, user, json, readJson);\n"
        "  }\n\n" + auth, 'admin API routes')
    # Keep existing asset routing unchanged. Cloudflare's default HTML handling
    # serves public/admin.html at /admin without a redirect loop.
    source = once(source, '      return await api(request, env, path);',
        '      return await withAudit(request, env, path, () => api(request, env, path), currentUser);',
        'audit successful mutations')
    return source


def main():
    required = [ROOT / f for f in [
        'src/admin-api.js', 'src/audit-log.js', 'public/admin.html',
        'public/admin.js', 'public/admin.css', 'migrations/0022_admin_audit_history.sql'
    ]]
    missing = [str(p) for p in [WORKER] + required if not p.is_file()]
    if missing:
        raise ValueError('Required file(s) missing: ' + ', '.join(missing))
    migrations = sorted((ROOT / 'migrations').glob('0022_*.sql'))
    if len(migrations) != 1 or migrations[0].name != '0022_admin_audit_history.sql':
        raise ValueError('Migration 0022 conflict; rename audit migration to the next unused number before applying.')
    before = WORKER.read_text(encoding='utf-8')
    after = patch(before)
    if before != after:
        backups = ROOT / '.aion2-backups'
        backups.mkdir(exist_ok=True)
        backup = backups / 'src__index.js.before-admin-audit.bak'
        if not backup.exists():
            backup.write_text(before, encoding='utf-8')
        WORKER.write_text(after, encoding='utf-8')
        print('OK: admin page, authenticated routes and audit logging integrated.')
    print('No changes to public/index.html, public/app.js, wrangler.jsonc or existing database rows.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError) as error:
        print('STOP:', error, file=sys.stderr)
        sys.exit(1)
