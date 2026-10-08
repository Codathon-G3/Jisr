// Safety evaluation runner — Person 3.
//
// Phrase layer only:
//   node safety/evaluate.mjs safety/dev-set.json
// Phrase layer + live API (combined check, once Person 2's endpoint is up):
//   RISK_API_URL=http://localhost:3000/api/check-risk node safety/evaluate.mjs safety/test-set.json
//
// Items labelled "ambiguous" (or whose "type" starts with "ambiguous") are reported separately,
// so they don't silently inflate or deflate the main figures.

import { readFileSync } from 'node:fs';
import { prepareCrisisList, checkCrisisPhrases } from './lib/crisis-check.mjs';

const setPath = process.argv[2] ?? 'safety/test-set.json';
const crisisJson = JSON.parse(readFileSync(new URL('./crisis-phrases.json', import.meta.url), 'utf8'));
const items = JSON.parse(readFileSync(setPath, 'utf8'));
const prepared = prepareCrisisList(crisisJson);
const apiUrl = process.env.RISK_API_URL;

async function apiCheck(text) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, chips: [], language: 'ar' }),
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return (await res.json()).riskDetected === true;
}

// 95% Wilson interval: honest uncertainty for small samples.
function wilson(k, n) {
  if (n === 0) return [0, 0];
  const z = 1.96, p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

function summarise(name, rows, key) {
  const main = rows.filter((r) => !r.ambiguous);
  const crisis = main.filter((r) => r.label === 'crisis');
  const safe = main.filter((r) => r.label !== 'crisis');
  const tp = crisis.filter((r) => r[key]).length;
  const fp = safe.filter((r) => r[key]).length;
  const pct = (x) => (x * 100).toFixed(1) + '%';
  const [rl, rh] = wilson(tp, crisis.length);
  const [fl, fh] = wilson(fp, safe.length);

  console.log(`\n=== ${name} ===`);
  console.log(`Recall:           ${pct(tp / crisis.length)}  (${tp}/${crisis.length}, 95% CI ${pct(rl)}–${pct(rh)})`);
  console.log(`False-alarm rate: ${pct(fp / safe.length)}  (${fp}/${safe.length}, 95% CI ${pct(fl)}–${pct(fh)})`);
  crisis.filter((r) => !r[key]).forEach((r) => console.log(`  MISSED      #${r.id}: ${r.text}`));
  safe.filter((r) => r[key]).forEach((r) => console.log(`  FALSE ALARM #${r.id}: ${r.text}`));

  const amb = rows.filter((r) => r.ambiguous);
  if (amb.length) {
    console.log(`  Ambiguous items (reported separately):`);
    amb.forEach((r) => console.log(`    #${r.id} [${r.label}] flagged=${r[key]}: ${r.text}`));

    // Ambiguous items still carry a crisis / not_crisis label; count them too, so a
    // missed crisis-labelled item can't disappear from the headline figure.
    const allCrisis = rows.filter((r) => r.label === 'crisis');
    const allSafe = rows.filter((r) => r.label !== 'crisis');
    const atp = allCrisis.filter((r) => r[key]).length;
    const afp = allSafe.filter((r) => r[key]).length;
    const [arl, arh] = wilson(atp, allCrisis.length);
    const [afl, afh] = wilson(afp, allSafe.length);
    console.log(`  All labelled items (including ambiguous):`);
    console.log(`    Recall:           ${pct(atp / allCrisis.length)}  (${atp}/${allCrisis.length}, 95% CI ${pct(arl)}–${pct(arh)})`);
    console.log(`    False-alarm rate: ${pct(afp / allSafe.length)}  (${afp}/${allSafe.length}, 95% CI ${pct(afl)}–${pct(afh)})`);
  }
}

const rows = [];
for (const item of items) {
  const phrase = checkCrisisPhrases(item.text, prepared).riskDetected;
  const ambiguous = item.label === 'ambiguous' || String(item.type ?? '').startsWith('ambiguous');
  const row = { ...item, ambiguous, phrase };
  if (apiUrl) row.combined = phrase || (await apiCheck(item.text));
  rows.push(row);
}

console.log(`Set: ${setPath} — ${rows.length} items, ${prepared.phrases.length} phrases in list`);
summarise('Phrase layer only', rows, 'phrase');
if (apiUrl) summarise('Combined (phrase OR model)', rows, 'combined');
