#!/usr/bin/env bash
# Install safely, verify all generated source files, optionally migrate and deploy.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mode="${1:---deploy}"
if [[ "$mode" != "--deploy" && "$mode" != "--check-only" ]]; then
  echo "Usage: bash scripts/install-homework-custom-columns.sh [--deploy|--check-only]" >&2
  exit 2
fi
if [[ ! -f wrangler.jsonc || ! -f public/index.html || ! -f src/index.js ]]; then
  echo "ERROR: Run from your Aion2 project; expected wrangler.jsonc, public/index.html and src/index.js." >&2
  exit 2
fi
printf '\n[1/5] Update the actual source files...\n'
python3 scripts/add-homework-custom-columns.py
printf '\n[2/5] Verify code was inserted and bust browser JS cache...\n'
python3 scripts/verify-homework-custom-columns.py
printf '\n[3/5] Check syntax and custom-task tests...\n'
node --check public/app.js
node --check src/index.js
node --check src/homework-custom-api.js
node tests/test-homework-custom-columns.mjs
python3 tests/test-homework-custom-migration.py
if [[ "$mode" == "--check-only" ]]; then
  echo 'PASS: Local changes verified. Run with --deploy to apply D1 and deploy.'
  exit 0
fi
printf '\n[4/5] Apply new D1 tables (if not already applied), then deploy...\n'
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
printf '\n[5/5] Check what Cloudflare is actually serving...\n'
checkUrl="https://aion2.ksmsy1.workers.dev/?homework_check=$(date +%s)"
if command -v curl >/dev/null 2>&1; then
  verify_html="$(mktemp)"
  if curl --connect-timeout 15 --max-time 30 -fsSL "$checkUrl" -o "$verify_html"; then
    if grep -q 'id="hwAddTask"' "$verify_html"; then
      echo 'PASS: Production HTML contains the 숙제 추가 button.'
    else
      echo 'WARNING: Production HTML does not yet contain id="hwAddTask".'
      echo 'Inspect active Worker deployment or GitHub auto-deploy status.'
      rm -f "$verify_html"
      exit 1
    fi
  else
    echo 'WARNING: Production URL could not be reached. Verify deploy status manually.'
    rm -f "$verify_html"
    exit 1
  fi
  rm -f "$verify_html"
else
  echo 'NOTICE: curl unavailable; verify production HTML manually.'
fi
printf '\nCOMPLETE. To prevent GitHub auto-deploy reverting these files, commit and push:\n'
printf '%s\n' 'git add public/index.html public/app.js src/index.js src/homework-custom-api.js migrations/0024_homework_custom_columns.sql scripts tests README-homework-custom-columns.md' 'git commit -m "Install persistent homework columns"' 'git push origin main'
