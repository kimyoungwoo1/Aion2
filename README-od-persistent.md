# Permanent od balances

- Od1 (840), Od2 (2000) are stored by character ID, not by week.
- Od total is always computed as od1 + od2; no extra column is stored.
- Weekly homework and abyss completion resets are unchanged.
- Remove redundant help notes and the public access-code disclaimer text from the visual UI; sorting/dragging and authentication behavior are unchanged.
- Character order, sanctuary assignments and markers, notes, character refresh, and sessions are untouched.
- Migration 0015 creates `homework_od_balances` and moves the latest existing od entry per character from the old `homework_od_amounts` table. Explicit cleared values (NULL) are preserved. The legacy table is left intact; the Worker no longer writes to or deletes from it.
- If a previous weekly reset already deleted older od entries, it is not possible to reconstruct those deleted entries from the current table.
- This ZIP is a flat update for /workspaces/Aion2. It does not overwrite wrangler.jsonc or the direct official Aion API module.

Deploy:

    unzip -o Aion2_Permanent_Od_Clean_UI.zip
    npx wrangler d1 migrations apply aion2-db --remote
    node tests/test-homework-od.mjs
    node tests/test-homework-order.mjs
    npx wrangler deploy

Re-deploy only after applying the migration. D1 data and credentials are never deleted.
