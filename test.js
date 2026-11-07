// node test.js
const assert = require('node:assert');
const { parseLabel, budget } = require('./logic.js');

assert.deepStrictEqual(parseLabel('Amnesia Haze\nTHC: 22,5 %\nCBD: <1 %\nInhalt: 10 g'),
  { name: 'Amnesia Haze', thc: 22.5, cbd: 1, grams: 10 });
assert.deepStrictEqual(parseLabel('GORILLA GLUE #4\n18% THC  0.1% CBD\n5g'),
  { name: 'GORILLA GLUE #4', thc: 18, cbd: 0.1, grams: 5 });
assert.deepStrictEqual(parseLabel('THC 20% CBD 1%'), { name: '', thc: 20, cbd: 1, grams: null });

const b = budget(9, 1, '2026-11-07', '2026-11-30'); // 24 days incl. today, 10 g total
assert.strictEqual(b.days, 24);
assert.ok(Math.abs(b.perDay - 10 / 24) < 1e-9);
assert.ok(Math.abs(b.leftToday - (10 / 24 - 1)) < 1e-9);
assert.strictEqual(budget(5, 0, '2026-11-07', '2026-11-06'), null);
assert.strictEqual(budget(3, 0, '2026-03-29', '2026-03-31').days, 3); // DST switch

console.log('ok');
