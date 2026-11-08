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

// A day is off when it is a weekly break day or inside a pause goal { start, end } (end exclusive).
const isOff = (d, breaks, pause) => breaks.includes(weekday(d)) || !!(pause && d >= pause.start && d < pause.end);

function activeDays(from, to, breaks, pause) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (!isOff(d, breaks, pause)) n++;
  return n;
}

// stock = what is left now, consumedToday = already smoked today (already deducted from stock).
// Off days (breaks, pause) get 0 g; their share is spread over the other days.
function budget(stock, consumedToday, today, until, breaks = [], pause = null) {
  if (until < today) return null;
  const isBreak = isOff(today, breaks, pause);
  const days = activeDays(today, until, breaks, pause);
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

// Longest stretch of days without consumption, including the running one (today counts as clean).
function longestBreak(logs, today) {
  const dates = [...new Set(logs.map(l => l.date).filter(d => d <= today))].sort();
  let best = dates.length ? daysBetween(dates[dates.length - 1], today) : 0;
  for (let i = 1; i < dates.length; i++) best = Math.max(best, daysBetween(dates[i - 1], dates[i]) - 1);
  return best;
}

// Reduction plan { on, from, start, pct, target }: daily limit drops by pct every 7 days, never below target.
function planLimit(plan, d) {
  if (!plan || !plan.on) return null;
  const weeks = Math.max(0, Math.floor(daysBetween(plan.from, d) / 7));
  return Math.max(plan.target, plan.start * (1 - plan.pct / 100) ** weeks);
}
const weeksToTarget = p => p.target >= p.start ? 0 : p.pct <= 0 ? Infinity : Math.ceil(Math.log(p.target / p.start) / Math.log(1 - p.pct / 100));

// When consumption happens: grams by time of day [morning 5-11, midday 11-17, evening 17-22, night 22-5]
// (from the logging time) and by weekday, Monday first. Entries moved to another day have no usable time.
function patterns(logs) {
  const times = [0, 0, 0, 0], weekdays = [0, 0, 0, 0, 0, 0, 0];
  let timed = 0;
  for (const l of logs) {
    weekdays[(weekday(l.date) + 6) % 7] += l.grams;
    const t = new Date(l.id);
    if (t.toLocaleDateString('sv') !== l.date) continue;
    const h = t.getHours();
    times[h >= 5 && h < 11 ? 0 : h >= 11 && h < 17 ? 1 : h >= 17 && h < 22 ? 2 : 3] += l.grams;
    timed++;
  }
  return { times, weekdays, timed };
}

// Next streak goal: [days, label]
const MILESTONES = [[1, '1 Tag'], [3, '3 Tage'], [7, '1 Woche'], [14, '2 Wochen'], [30, '1 Monat'],
  [60, '2 Monate'], [90, '3 Monate'], [180, '6 Monate'], [365, '1 Jahr']];
const nextMilestone = days => MILESTONES.find(([d]) => d > days)
  || (y => [y * 365, `${y} Jahre`])(Math.ceil((days + 1) / 365));

if (typeof module !== 'undefined') module.exports = { parseLabel, budget, num, dailyAvg, daysSinceLast, activeDays, absorbedMg, addDays, longestBreak, nextMilestone, planLimit, weeksToTarget, patterns };
