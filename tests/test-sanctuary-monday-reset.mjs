import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const backend = fs.readFileSync(path.join(root, 'src/index.js'), 'utf8');
const frontend = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const wrangler = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');

function functionSource(code, name) {
  const start = code.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} function missing`);
  const opening = code.indexOf('{', start);
  let depth = 0;
  for (let pos = opening; pos < code.length; pos++) {
    if (code[pos] === '{') depth++;
    if (code[pos] === '}') depth--;
    if (depth === 0) return code.slice(start, pos + 1);
  }
  throw new Error(`${name} has no closing brace`);
}

const backendFunctions = ['currentSanctuaryWeekStart', 'currentWeekStart', 'validWednesday']
  .map(name => functionSource(backend, name)).join('\n');
const frontendFunctions = ['shiftDay', 'wednesdayFor', 'sanctuaryWednesdayForCurrentCycle']
  .map(name => functionSource(frontend, name)).join('\n');

function keyAt(kstIso) {
  const timestamp = new Date(kstIso).getTime();
  const backendKey = vm.runInNewContext(
    backendFunctions + `\ncurrentSanctuaryWeekStart(${timestamp})`, { Date }
  );
  class DateAt extends Date { static now() { return timestamp; } }
  const frontendKey = vm.runInNewContext(
    frontendFunctions + '\nsanctuaryWednesdayForCurrentCycle()', { Date: DateAt }
  );
  assert.equal(backendKey, frontendKey, `server/browser week key differs at ${kstIso}`);
  const valid = vm.runInNewContext(
    backendFunctions + `\nvalidWednesday('${backendKey}')`, { Date }
  );
  assert.equal(valid, true, `week key must remain a Wednesday: ${backendKey}`);
  return backendKey;
}

const samples = [
  ['2026-11-01T23:59:59+09:00', '2026-10-28'], // Sunday, before reset
  ['2026-11-02T00:00:00+09:00', '2026-11-04'], // Monday reset
  ['2026-11-03T23:59:59+09:00', '2026-11-04'], // Tuesday no further reset
  ['2026-11-04T04:59:59+09:00', '2026-11-04'], // Wednesday 05 does not reset
  ['2026-11-04T05:00:00+09:00', '2026-11-04'],
  ['2026-11-08T23:59:59+09:00', '2026-11-04'],
  ['2026-11-09T00:00:00+09:00', '2026-11-11'],
  ['2026-11-11T05:00:00+09:00', '2026-11-11'],
];
for (const [kst, expected] of samples) assert.equal(keyAt(kst), expected, kst);

assert.ok(frontend.includes("const weekDayNames = ['수', '목', '금', '토', '일', '월', '화'];"), 'Wed-Tue display changed');
assert.equal(frontend.match(/sanctuaryWednesdayForCurrentCycle\(\)/g)?.length, 3, 'frontend week key not connected');
assert.ok(html.includes('성역 참여 일정은 <strong>매주 월요일 00:00(KST)</strong>'), 'sanctuary reset label mismatch');
assert.ok(html.includes('어비스회랑'), 'existing homework view missing');
assert.equal((backend.match(/weekStart !== currentSanctuaryWeekStart\(\)/g) ?? []).length, 2, 'backend week validation missing');
assert.equal((backend.match(/validWednesday\(weekStart\)/g) ?? []).length, 2, 'Wednesday key validation changed');
assert.ok(backend.includes("WHERE task_key <> 'abyss' AND week_start < ?\").bind(week)"), 'homework reset changed');
for (const table of ['sanctuary_shared_availability','sanctuary_shared_schedule_notes','sanctuary_schedules']) {
  assert.ok(backend.includes(`DELETE FROM ${table} WHERE week_start < ?').bind(sanctuaryWeek)`), `cleanup missing: ${table}`);
}
for (const cron of ['0 20 * * TUE','0 12 * * WED,SAT','*/5 9,21 * * *','0 15 * * SUN']) {
  assert.ok(wrangler.includes(cron), `cron missing: ${cron}`);
}
console.log('PASS: Wed-Tue headings, reset Mon 00:00 KST, no second Wed reset, 4/3 shared and 2 independent, homework untouched, Crons preserved.');
