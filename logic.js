// Pure logic, shared by index.html and test.js
const num = s => parseFloat(String(s).replace(',', '.'));
const sum = a => a.reduce((t, l) => t + l.grams, 0);
const cost = a => a.reduce((t, l) => t + l.grams * (l.price || 0), 0);

// Share of THC that actually reaches the blood, per form of consumption.
// ponytail: rough midpoints of published ranges (smoked 10–35 %, oral 4–12 %), an estimate, not a measurement.
const FORMS = { Joint: 0.25, Bong: 0.3, Vaporizer: 0.35, Edible: 0.1 };
const absorbedMg = l => l.grams * (l.thc || 0) * 10 * (FORMS[l.form] ?? FORMS.Joint);

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

// Dates are 'YYYY-MM-DD' strings; parsed as UTC so DST never shifts a day.
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const addDays = (d, n) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);
const weekday = d => new Date(Date.parse(d)).getUTCDay(); // 0 = Sunday

function activeDays(from, to, breaks) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (!breaks.includes(weekday(d))) n++;
  return n;
}

// stock = what is left now, consumedToday = already smoked today (already deducted from stock).
// breaks = weekdays without consumption; their share is spread over the other days.
function budget(stock, consumedToday, today, until, breaks = []) {
  if (until < today) return null;
  const isBreak = breaks.includes(weekday(today));
  const days = activeDays(today, until, breaks);
  const perDay = days ? (isBreak ? stock : stock + consumedToday) / days : 0;
  return { days, perDay, isBreak, leftToday: (isBreak ? 0 : perDay) - consumedToday };
}

// Average grams and money per day over the last `span` days, or since the first entry if that is newer.
function dailyAvg(logs, today, span = 30) {
  const past = logs.filter(l => l.date <= today);
  if (!past.length) return null;
  const first = past.reduce((m, l) => (l.date < m ? l.date : m), today);
  const days = Math.min(span, daysBetween(first, today) + 1);
  const recent = past.filter(l => l.date >= addDays(today, 1 - days));
  return { days, grams: sum(recent) / days, cost: cost(recent) / days };
}

// Days since the last consumption (0 = consumed today, null = never).
function daysSinceLast(logs, today) {
  const dates = logs.map(l => l.date).filter(d => d <= today);
  return dates.length ? daysBetween(dates.reduce((a, b) => (a > b ? a : b)), today) : null;
}

if (typeof module !== 'undefined') module.exports = { parseLabel, budget, num, dailyAvg, daysSinceLast, activeDays, absorbedMg, addDays };
