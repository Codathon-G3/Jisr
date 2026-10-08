// Safety evaluation runner — Person 3.
//
// Phrase layer only:
//   node safety/evaluate.mjs safety/dev-set.json
// Phrase layer + live API (combined check):
//   RISK_API_URL=https://jisr-api.onrender.com/api/check-risk RISK_API_DELAY_MS=6000 \
//   RISK_API_OUT=safety/results/heldout-api.json node safety/evaluate.mjs safety/heldout-set.json
//
// A set is either an array of items or { "_about": {...}, "items": [...] }.
// Items labelled "ambiguous" (or whose "type" starts with "ambiguous") are reported separately,
// so they don't silently inflate or deflate the main figures.
//
// /api/check-risk fails closed: if the model errors, it reports risk with method "model". A
// model outage would therefore look like a run of detections, so with RISK_API_URL set a benign
// canary is checked before, halfway through and after the run, and the run stops if one is flagged.

import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCrisisList, checkCrisisPhrases } from './lib/crisis-check.mjs';

const setPath = process.argv[2] ?? 'safety/test-set.json';
const crisisJson = JSON.parse(readFileSync(new URL('./crisis-phrases.json', import.meta.url), 'utf8'));
const rawSet = JSON.parse(readFileSync(setPath, 'utf8'));
const items = Array.isArray(rawSet) ? rawSet : rawSet.items;
const prepared = prepareCrisisList(crisisJson);
const apiUrl = process.env.RISK_API_URL;
const apiDelayMs = Number(process.env.RISK_API_DELAY_MS ?? 0);
const apiOut = process.env.RISK_API_OUT;
const CANARY = 'عندي امتحان بكرة ونبي نراجع مع صاحبي';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries only when the request never reached the server (connection errors); an HTTP
// error status still stops the run.
async function post(text, attemptsLeft = 3) {
  try {
    return await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, chips: [], language: 'ar' }),
    });
  } catch (error) {
    if (attemptsLeft <= 1) throw error;
    await sleep(5000);
    return post(text, attemptsLeft - 1);
  }
}

async function apiCheck(text) {
  const started = Date.now();
  const res = await post(text);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const body = await res.json();
  const ms = Date.now() - started;
  if (apiDelayMs) await sleep(apiDelayMs);
  return { riskDetected: body.riskDetected === true, method: body.method, ms };
}

async function canary(when) {
  const result = await apiCheck(CANARY);
  console.log(`Canary (${when}): flagged=${result.riskDetected} method=${result.method} ${result.ms}ms`);
  if (result.riskDetected) {
    throw new Error(`benign canary flagged ${when}: the model is probably failing (fail-closed), results invalid`);
  }
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

if (apiUrl) await canary('before the run');

const rows = [];
for (const [index, item] of items.entries()) {
  const phrase = checkCrisisPhrases(item.text, prepared).riskDetected;
  const ambiguous = item.label === 'ambiguous' || String(item.type ?? '').startsWith('ambiguous');
  const row = { ...item, ambiguous, phrase };
  if (apiUrl) {
    if (index === Math.floor(items.length / 2)) await canary('halfway');
    const api = await apiCheck(item.text);
    // The server runs its own copy of the phrase list; "model" or "both" means the model said yes.
    row.apiMethod = api.method;
    row.apiMs = api.ms;
    row.model = api.method === 'model' || api.method === 'both';
    row.combined = phrase || api.riskDetected;
  }
  rows.push(row);
}

if (apiUrl) await canary('after the run');

console.log(`Set: ${setPath} — ${rows.length} items, ${prepared.phrases.length} phrases in list`);
summarise('Phrase layer only', rows, 'phrase');
if (apiUrl) {
  summarise('Model layer alone (method model or both)', rows, 'model');
  summarise('Combined (phrase OR model)', rows, 'combined');
}

if (apiOut) {
  const out = {
    set: setPath,
    api: apiUrl,
    ranAt: new Date().toISOString(),
    rows: rows.map(({ id, label, type, phrase, model, combined, apiMethod, apiMs }) => ({
      id, label, type, phrase, model, combined, apiMethod, apiMs,
    })),
  };
  writeFileSync(apiOut, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nPer-item results written to ${apiOut}`);
}
