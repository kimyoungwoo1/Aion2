import sqlite3
from pathlib import Path

sql=Path('migrations/0024_homework_custom_columns.sql').read_text('utf-8')
conn=sqlite3.connect(':memory:')
conn.execute('PRAGMA foreign_keys = ON')
conn.executescript('''
CREATE TABLE characters(id INTEGER PRIMARY KEY,owner_name TEXT NOT NULL);
CREATE TABLE homework_progress(week_start TEXT,character_id INTEGER,task_key TEXT,completed INTEGER);
''')
conn.executescript(sql)
conn.executemany('INSERT INTO characters VALUES (?,?)',[(1,'ownerA'),(2,'ownerB')])
conn.execute("INSERT INTO homework_custom_tasks(owner_name,title,created_at) VALUES ('ownerA','No reset',1)")
conn.execute('INSERT INTO homework_custom_progress(task_id,character_id,completed,updated_at) VALUES(1,1,1,1)')
conn.execute("INSERT INTO homework_progress VALUES('2026-11-04',1,'trial',1)")
# Simulate weekly and manual reset; only built-in homework_progress is modified.
conn.execute("DELETE FROM homework_progress WHERE week_start<'2026-11-11'")
conn.execute('DELETE FROM homework_progress WHERE character_id IN (SELECT id FROM characters WHERE owner_name=?)',('ownerA',))
assert conn.execute('SELECT completed FROM homework_custom_progress').fetchone()[0]==1
conn.execute("INSERT INTO homework_task_column_orders VALUES('ownerA','[\"craft\"]',1)")
assert conn.execute('SELECT owner_name FROM homework_task_column_orders').fetchone()[0]=='ownerA'
conn.execute('DELETE FROM characters WHERE id=1')
assert conn.execute('SELECT COUNT(*) FROM homework_custom_progress').fetchone()[0]==0
print('PASS: SQL migration, weekly/manual reset never delete custom progress, owner-specific order, character cascade')
