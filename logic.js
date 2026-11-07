// Pure logic, shared by index.html and test.js
const num = s => parseFloat(String(s).replace(',', '.'));

// Pulls name / THC % / CBD % / grams out of scanned label text.
// ponytail: regex heuristic, handles "THC: 22 %" and "22% THC" layouts; add more patterns when a label fails.
function parseLabel(text) {
  const N = '(\\d+(?:[.,]\\d+)?)';
  const first = text.match(new RegExp(N + '\\s*%\\s*(?:THC|CBD)|THC|CBD', 'i'));
  const numFirst = !!(first && first[1]);
  const pct = k => {
    const m = text.match(numFirst
      ? new RegExp(N + '\\s*%\\s*' + k, 'i')
      : new RegExp(k + '[^\\d\\n]{0,15}' + N + '\\s*%', 'i'));
    return m ? num(m[1]) : null;
  };
  const g = text.match(/(\d+(?:[.,]\d+)?)\s*g(?:ramm)?\b/i);
  const name = text.split('\n').map(l => l.trim())
    .find(l => l && !/thc|cbd|%|\d\s*g\b/i.test(l)) || '';
  return { name, thc: pct('THC'), cbd: pct('CBD'), grams: g ? num(g[1]) : null };
}

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

// stock = what is left now, consumedToday = already smoked today (already deducted from stock).
function budget(stock, consumedToday, today, until) {
  const days = daysBetween(today, until) + 1;
  if (days < 1) return null;
  const perDay = (stock + consumedToday) / days;
  return { days, perDay, leftToday: perDay - consumedToday };
}

if (typeof module !== 'undefined') module.exports = { parseLabel, budget, num };
