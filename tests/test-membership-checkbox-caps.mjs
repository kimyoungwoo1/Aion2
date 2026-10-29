import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { OD1_INPUT_MAX, OD2_INPUT_MAX } from '../public/od-recovery.js';

assert.equal(OD1_INPUT_MAX, 840);
assert.equal(OD2_INPUT_MAX, 2000);
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const server=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const head=html.match(/<table class="homework-table"><thead><tr>(.*?)<\/tr>/s)?.[1];
assert.ok(head);
const ths=[...head.matchAll(/<th\b[^>]*>(.*?)<\/th>/g)].map(match=>match[1].replace(/<[^>]+>/g,''));
assert.equal(ths.length,16);
assert.equal(ths.at(-2),'오드구매');
assert.equal(ths.at(-1),'멤버십');
assert.match(app,/membershipCheckbox\.type = 'checkbox'/);
assert.match(app,/const membershipCell = row\.insertCell\(\);/);
assert.match(app,/membershipCell\.append\(membershipCheckbox\)/);
assert.doesNotMatch(app,/membershipSelect/);
assert.match(app,/odWarnings\[field\] = warning/);
assert.match(app,/if \(!validateOdInput\(field, input\)\) return;/);
assert.match(app,/input\.max = String\(getOdMaximum\(field\)\)/);
assert.match(server,/value > maxValue/);
assert.match(server,/OD1_INPUT_MAX, OD2_INPUT_MAX/);

// Migration corrects legacy overflow, keeps configured subscription and starts
// new normal recovery without retroactively accruing previous weeks.
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE homework_od_balances (
  character_id INTEGER PRIMARY KEY,od1 INTEGER,od2 INTEGER,
  od1_updated_at INTEGER,od1_membership INTEGER,updated_at INTEGER);
INSERT INTO homework_od_balances VALUES(1,900,3500,NULL,NULL,50);
INSERT INTO homework_od_balances VALUES(2,770,1900,1234,1,50);
INSERT INTO homework_od_balances VALUES(3,300,1500,NULL,NULL,50);
INSERT INTO homework_od_balances VALUES(4,NULL,100,NULL,NULL,50);`);
db.exec(readFileSync(new URL('../migrations/0018_homework_od_caps_membership_default.sql',import.meta.url),'utf8'));
assert.deepEqual({...db.prepare('SELECT od1,od2,od1_membership FROM homework_od_balances WHERE character_id=1').get()},{od1:840,od2:2000,od1_membership:0});
assert.deepEqual({...db.prepare('SELECT od1,od2,od1_updated_at,od1_membership FROM homework_od_balances WHERE character_id=2').get()},{od1:770,od2:1900,od1_updated_at:1234,od1_membership:1});
assert.ok(db.prepare('SELECT od1_updated_at FROM homework_od_balances WHERE character_id=3').get().od1_updated_at>0);
assert.equal(db.prepare('SELECT od1_updated_at FROM homework_od_balances WHERE character_id=4').get().od1_updated_at,null);
assert.equal(db.prepare('SELECT od1_membership FROM homework_od_balances WHERE character_id=4').get().od1_membership,0);
assert.deepEqual([...db.prepare('SELECT character_id,original_od1,original_od2 FROM homework_od_limit_backup_20261029').all()].map(x=>({...x})), [{character_id:1,original_od1:900,original_od2:3500}]);
db.close();
console.log('PASS: checkbox right of od-purchase, frontend max warning, server cap, legacy migration, membership preserved');
