#!/usr/bin/env python3
import sqlite3
from pathlib import Path
migration=Path(__file__).resolve().parent.parent/'migrations/0023_admin_audit_ip.sql'
con=sqlite3.connect(':memory:')
con.executescript('''
CREATE TABLE admin_audit_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 occurred_at INTEGER NOT NULL, actor_nickname TEXT NOT NULL, category TEXT NOT NULL,
 action TEXT NOT NULL, target TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL DEFAULT '',
 details_json TEXT, previous_json TEXT, current_json TEXT
);
INSERT INTO admin_audit_events (occurred_at,actor_nickname,category,action)
VALUES (1730000000,'슬롱','homework','toggle');
''')
con.executescript(migration.read_text())
columns=[row[1] for row in con.execute('PRAGMA table_info(admin_audit_events)')]
assert 'actor_ip' in columns
assert con.execute('SELECT actor_nickname,actor_ip FROM admin_audit_events').fetchone()==('슬롱',None)
con.execute('INSERT INTO admin_audit_events (occurred_at,actor_nickname,actor_ip,category,action) VALUES (?,?,?,?,?)',
            (1730000100,'니코틴','2001:db8::1','party','assignment'))
assert con.execute('SELECT actor_ip FROM admin_audit_events WHERE actor_nickname=?',('니코틴',)).fetchone()[0]=='2001:db8::1'
assert any('idx_admin_audit_events_ip' in row[1] for row in con.execute('PRAGMA index_list(admin_audit_events)'))
print('PASS: old audit rows preserved with NULL IP; new IPv4/IPv6 column and index supported.')
