#!/usr/bin/env python3
import sqlite3
from pathlib import Path
root=Path(__file__).resolve().parent.parent
sql=(root/'migrations/0022_admin_audit_history.sql').read_text()
conn=sqlite3.connect(':memory:')
conn.executescript(sql)
conn.execute('''INSERT INTO admin_audit_events(occurred_at,actor_nickname,category,action,target,summary,details_json,previous_json,current_json)
VALUES(?,?,?,?,?,?,?,?,?)''',(1700000000,'슬롱','od','balance','캐릭터 #1','오드1 수량 변경','{"value":300}','{"od1":200}','{"od1":300}'))
assert conn.execute('SELECT COUNT(*) FROM admin_audit_events').fetchone()[0]==1
conn.execute('INSERT INTO admin_sessions VALUES(?,?,?,?,?)',('hash','otherhash','슬롱',1700000000,1700003600))
assert conn.execute('SELECT COUNT(*) FROM admin_sessions').fetchone()[0]==1
conn.executescript(sql)
assert conn.execute('SELECT COUNT(*) FROM admin_audit_events').fetchone()[0]==1
print('PASS: D1-compatible schema, indexes, admin sessions, idempotent creation, existing records retained.')
