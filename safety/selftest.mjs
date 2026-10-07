// Safety self-test — Person 3.
// Run before every commit:  node safety/selftest.mjs
// Exits with code 1 if anything fails, so it can also run in CI later.

import { readFileSync } from 'node:fs';
import { prepareCrisisList, checkCrisisPhrases } from './lib/crisis-check.mjs';
import { prepareForbiddenTerms, checkDraft } from './lib/output-check.mjs';
import { normalizeText } from './lib/normalize.mjs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL:', msg); } };
const load = (f) => JSON.parse(readFileSync(new URL(`./${f}`, import.meta.url), 'utf8'));

// 1. Files parse
let crisisJson, forbiddenJson, templates, card, dev;
try {
  crisisJson = load('crisis-phrases.json'); forbiddenJson = load('forbidden-terms.json');
  templates = load('plain-templates.json'); card = load('support-card.json'); dev = load('dev-set.json');
  pass++;
} catch (e) { console.log('FAIL: a JSON file does not parse —', e.message); process.exit(1); }

const crisis = prepareCrisisList(crisisJson);
const terms = prepareForbiddenTerms(forbiddenJson);

// 2. Crisis list structure
const seen = new Set();
for (const p of crisisJson.phrases) {
  ok(p.text && p.category, `phrase missing text/category: ${JSON.stringify(p)}`);
  const n = normalizeText(p.text);
  ok(!seen.has(n), `duplicate phrase after normalising: ${p.text}`);
  seen.add(n);
}

// 3. Crisis check is robust to spelling and formatting variants
const mustFlag = [
  'نبي نموت', 'نـبـي نـمـوت', 'نَبي نَموت', 'نبي   نموت!!', 'أفكر في الانتحار', 'افكر في الانتحار',
  'I WANT TO KILL MYSELF', "I can't do this anymore", 'msh gader nkamel', 'خلاص ما نقدر نكمل 😔',
  'نبي نموت من الضحك ونبي نموت بجد',
];
const mustPass = ['نبي نموت من الضحك', 'عندي امتحان بكرة ومتوتر', 'نموت فيك يا خوي', ''];
mustFlag.forEach((t) => ok(checkCrisisPhrases(t, crisis).riskDetected, `should flag: ${t}`));
mustPass.forEach((t) => ok(!checkCrisisPhrases(t, crisis).riskDetected, `should not flag: ${t}`));

// 4. Output check: everyday words allowed, clinical words blocked
const allowed = ['أنا قلقان من الامتحانات', 'عندي ضغط كبير', 'نبي نحكي مع المرشد النفسي'];
const blocked = ['يمكن عندي اكتئاب', 'حاسة إني مكتئبة', 'لازم تاخذ دواء', 'I have DEPRESSION'];
allowed.forEach((t) => ok(checkDraft(t, terms).passed, `should pass output check: ${t}`));
blocked.forEach((t) => ok(!checkDraft(t, terms).passed, `should fail output check: ${t}`));

// 5. Every filled template is safe
const tones = ['gentle', 'direct', 'formal'];
const recipients = ['friend', 'sibling', 'parent', 'trusted_adult', 'counsellor'];
for (const tone of tones) for (const r of recipients) {
  const tpl = templates[tone]?.[r];
  ok(typeof tpl === 'string' && tpl.includes('[topic]'), `template ${tone}/${r} missing or has no [topic]`);
  for (const [chip, label] of Object.entries(templates.topic_labels ?? {})) {
    const filled = String(tpl).replaceAll('[topic]', label);
    ok(checkDraft(filled, terms).passed, `template ${tone}/${r}/${chip} fails output check`);
    ok(!checkCrisisPhrases(filled, crisis).riskDetected, `template ${tone}/${r}/${chip} triggers crisis check`);
  }
}

// 6. Support card never shows an unverified contact
ok(card.title_ar && card.message_ar && card.fallbackMessage_ar, 'support card missing title/message/fallback');
for (const c of card.contacts ?? []) {
  ok(c.verified === true && c.verifiedBy && c.verifiedOn, `contact not fully verified: ${c.name ?? JSON.stringify(c)}`);
}

// 7. Dev set labels are valid
dev.forEach((d) => ok(['crisis', 'not_crisis'].includes(d.label) && d.text, `bad dev-set item #${d.id}`));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
