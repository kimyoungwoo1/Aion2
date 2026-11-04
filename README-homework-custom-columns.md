# Aion2 homework: personal column order and non-resetting custom tasks

## Features

- The default column order is unchanged: abyss, awakening, rudra, invasion,
  muspel, deltras, trials, od purchase & crafting.
- Drag the grip in each homework COLUMN HEADER to reorder columns. This is
  separate from the existing drag handles for CHARACTER ROWS.
- Column order is saved in Cloudflare D1 by the authenticated login nickname.
  Another nickname's column order is unaffected. Refreshes, deployments, and
  weekly resets do not delete the preference.
- The "Add Homework" button opens a dialog asking for a task name. Each
  newly created task appears immediately after od purchase & crafting,
  before the membership checkbox. Up to 20 extra tasks per nickname.
- A custom task gets completion buttons independently for every character
  registered under that nickname. Its completion is persistent: neither the
  Wednesday weekly reset nor the manual "Reset Status" action deletes it.
- Custom tasks are private to the login nickname; they are NOT shared with
  other nicknames. Built-in weekly homework continues its normal resets.
- The original character sorting, Od1/2, membership, auto recovery, admin
  audit, content schedule, inquiry board, and party assignments are retained.

## Apply in /workspaces/Aion2

Upload the ZIP into the project root, then run:

```bash
unzip -o Aion2_Homework_Custom_Columns.zip
python3 scripts/add-homework-custom-columns.py
node --check src/index.js
node --check public/app.js
node tests/test-homework-custom-columns.mjs
python3 tests/test-homework-custom-migration.py
node tests/test-homework-custom-live.mjs
npx wrangler d1 migrations apply aion2-db --remote && npx wrangler deploy
```

The Python patch is deliberately non-destructive. It only changes matching
snippets of the EXISTING files (src/index.js, public/app.js, index.html)
and adds a small extra API module and new migration. If the expected source
shapes have changed, the script fails before modifying existing app files.

This migration is ADDITIVE ONLY; it does not change the homework_progress
or existing Od storage. The actual D1 migration must complete successfully
before deploying the new Worker code.

Commit the updated files to avoid an older GitHub deployment overwriting the
live site:

```bash
git add public/index.html public/app.js src/index.js src/homework-custom-api.js \
  migrations/0024_homework_custom_columns.sql scripts/add-homework-custom-columns.py \
  tests README-homework-custom-columns.md
git diff --cached --stat
git commit -m "Add persistent per-nickname homework columns and custom tasks"
git push origin main
```

Note: this application's shared access-code login allows people to choose
any nickname. The per-nickname isolation is NOT verified account ownership;
a person choosing the same nickname can access its data. Stronger identity
verification is required for real access control.

New tasks are persistent and this version does not add task deletion, because
accidental deletion could destroy recorded completion data.
