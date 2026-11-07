// node test.js
const assert = require('node:assert');
const { parseLabel, budget, dailyAvg, daysSinceLast, activeDays, absorbedMg, addDays, longestBreak, nextMilestone } = require('./logic.js');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

assert.deepStrictEqual(parseLabel('Amnesia Haze\nTHC: 22,5 %\nCBD: <1 %\nInhalt: 10 g'),
  { name: 'Amnesia Haze', thc: 22.5, cbd: 1, grams: 10 });
assert.deepStrictEqual(parseLabel('GORILLA GLUE #4\n18% THC  0.1% CBD\n5g'),
  { name: 'GORILLA GLUE #4', thc: 18, cbd: 0.1, grams: 5 });
assert.deepStrictEqual(parseLabel('THC 20% CBD 1%'), { name: '', thc: 20, cbd: 1, grams: null });

// budget without breaks: 24 days incl. today, 10 g total
let b = budget(9, 1, '2026-11-07', '2026-11-30');
assert.strictEqual(b.days, 24); near(b.perDay, 10 / 24); near(b.leftToday, 10 / 24 - 1);
assert.strictEqual(budget(5, 0, '2026-11-07', '2026-11-06'), null);
assert.strictEqual(budget(3, 0, '2026-03-29', '2026-03-31').days, 3); // DST switch

// breaks: 2026-11-07 is a Saturday (6), 2026-11-08 a Sunday (0)
assert.strictEqual(activeDays('2026-11-02', '2026-11-08', [1, 2]), 5);
b = budget(5, 0, '2026-11-07', '2026-11-13', [1, 2]); // Sa So Mi Do Fr active
assert.strictEqual(b.days, 5); near(b.perDay, 1); assert.strictEqual(b.isBreak, false);
b = budget(4, 0.5, '2026-11-07', '2026-11-08', [6]); // today is a break day, consumed anyway
assert.strictEqual(b.isBreak, true); assert.strictEqual(b.days, 1); near(b.perDay, 4); near(b.leftToday, -0.5);
assert.strictEqual(budget(4, 0, '2026-11-07', '2026-11-07', [6]).perDay, 0); // only break days left

// average over the real history, not a fixed 30 days
const logs = [{ date: '2026-11-05', grams: 0.4, price: 10 }, { date: '2026-11-07', grams: 0.2, price: 10 }];
const a = dailyAvg(logs, '2026-11-07');
assert.strictEqual(a.days, 3); near(a.grams, 0.2); near(a.cost, 2);
assert.strictEqual(dailyAvg([], '2026-11-07'), null);
assert.strictEqual(daysSinceLast(logs, '2026-11-07'), 0);
assert.strictEqual(daysSinceLast(logs, '2026-11-10'), 3);
assert.strictEqual(daysSinceLast([], '2026-11-07'), null);

near(absorbedMg({ grams: 0.4, thc: 20, form: 'Edible' }), 8); // 80 mg contained, 10 %
assert.strictEqual(addDays('2026-10-31', 1), '2026-11-01');

// clean days: Nov 1 -> Nov 5 leaves 2,3,4 clean (3); running streak after Nov 7 counts today
const br = [{ date: '2026-11-01' }, { date: '2026-11-05' }, { date: '2026-11-07' }];
assert.strictEqual(longestBreak(br, '2026-11-08'), 3);
assert.strictEqual(longestBreak(br, '2026-11-12'), 5);
assert.strictEqual(longestBreak([], '2026-11-12'), 0);
assert.deepStrictEqual(nextMilestone(3), [7, '1 Woche']);
assert.strictEqual(nextMilestone(400)[0], 730);

console.log('ok');
