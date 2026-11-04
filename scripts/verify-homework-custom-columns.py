#!/usr/bin/env python3
"""Check that the feature is physically present in the files Wrangler deploys."""
from pathlib import Path
import re
root = Path.cwd()
required = {
    'public/index.html': ['id="hwAddTask"', 'id="hwAddTaskDialog"'],
    'public/app.js': ['AION2_HOMEWORK_TASK_COLUMNS_V1', 'renderHomeworkTaskHeaders', 'for (const task of taskColumns)', '/api/homework/task-order'],
    'src/index.js': ['AION2_HOMEWORK_CUSTOM_COLUMNS_V1', './homework-custom-api.js'],
    'src/homework-custom-api.js': ['getCustomHomeworkData', 'customHomeworkApi'],
    'migrations/0024_homework_custom_columns.sql': ['homework_custom_tasks', 'homework_custom_progress', 'homework_task_column_orders'],
}
failed = []
for file, tokens in required.items():
    path = root / file
    if not path.is_file():
        failed.append(f'Missing {file}')
        continue
    text = path.read_text('utf-8')
    for token in tokens:
        if token not in text:
            failed.append(f'{file} missing: {token}')
if failed:
    for reason in failed: print('FAIL:',reason)
    raise SystemExit('New feature is not installed in the deployed source files.')
# Update only the cache-busting query parameter on the existing /app.js script.
html = root / 'public/index.html'
text = html.read_text('utf-8')
script = re.search(r'(?P<prefix>src=["\']\/app\.js)(?:\?v=[^"\']*)?(?P<suffix>["\'])',text)
if script:
    new = f"{script.group('prefix')}?v=homework-custom-columns-20261104-v3{script.group('suffix')}"
    if script.group(0) != new:
        html.write_text(text[:script.start()] + new + text[script.end():], 'utf-8')
        print('UPDATED: app.js query string to refresh browser cache')
else:
    print('NOTICE: /app.js script tag not found; check if bundler changed the HTML')
print('PASS: button, dialog, drag handles, route, module and migration are present.')
