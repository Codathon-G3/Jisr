import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert';

console.log('--- Verifying stated limits, support-card continuation and honest UI wording ---');

const read = (path) => readFileSync(resolve(path), 'utf8');

// R23: the stated limits name everything the product is not.
const limits = JSON.parse(read('safety/stated-limits.json'));
for (const phrase of ['مش دكتور', 'مش معالج', 'مش أداة تشخيص', 'مش بديل عن المختصين', 'مش خدمة طوارئ']) {
  assert.ok(limits.ar.includes(phrase), `stated-limits.json ar is missing: ${phrase}`);
}
for (const phrase of ['not a doctor', 'not a therapist', 'not a diagnosis tool', 'not a replacement for specialists', 'not an emergency service']) {
  assert.ok(limits.en.includes(phrase), `stated-limits.json en is missing: ${phrase}`);
}
for (const file of ['App.tsx', 'src/screens/CaptureScreen.tsx', 'src/app/page.js']) {
  assert.ok(read(file).includes('stated-limits.json'), `${file} must show safety/stated-limits.json`);
}
console.log('[PASS] Stated limits name all five limits and are shown on the app and the web page');

// Q5: the minors position is stated in the interface.
assert.ok(limits.minors_ar && limits.minors_ar.includes('18'), 'stated-limits.json needs minors_ar');
for (const file of ['src/screens/CaptureScreen.tsx', 'src/app/page.js']) {
  assert.ok(read(file).includes('minors_ar'), `${file} must show the minors notice`);
}
console.log('[PASS] Minors notice is shown on the app and the web page');

// R10: after the support card the user can continue to the note.
assert.ok(read('src/components/SupportCardModal.tsx').includes('onContinue'), 'SupportCardModal must offer onContinue');
assert.ok(read('App.tsx').includes('onContinue='), 'App.tsx must pass onContinue to the support card');
assert.ok(read('src/app/page.js').includes('handleContinueAfterSupport'), 'page.js must let the user continue after the card');
console.log('[PASS] The support card offers "continue to my note" on mobile and web');

// R18: trust views do not claim more than they show.
const banned = [
  'بدون تأليف أو هلوسة', // "no fabrication or hallucination"
  'لم يخترع', // "the AI did not invent"
  'نص جاهز وجامد', // template labelled as rigid
  'النص نظيف تماماً', // "completely clean"
  'لا يتم تخزين هذا النص في أي خادم', // "never stored on any server" (the model provider receives it)
];
for (const file of [
  'src/components/BaselineComparison.tsx',
  'src/components/FaithfulnessView.tsx',
  'src/components/OutboundPreview.tsx',
  'src/i18n/ar.json',
]) {
  const content = read(file);
  for (const phrase of banned) {
    assert.ok(!content.includes(phrase), `${file} still claims: ${phrase}`);
  }
}
console.log('[PASS] Trust views use neutral, accurate wording');

// R5: the record is excluded from Android cloud backup.
const appJson = JSON.parse(read('app.json'));
assert.strictEqual(appJson.expo.android.allowBackup, false, 'app.json must set android.allowBackup to false');
for (const permission of ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'SYSTEM_ALERT_WINDOW']) {
  assert.ok(
    (appJson.expo.android.blockedPermissions || []).includes(`android.permission.${permission}`),
    `app.json must block the unused ${permission} permission`
  );
}
console.log('[PASS] Android backup is off for on-device data');

// C1: the web page runs the Guardian check and drafts through the backend.
const page = read('src/app/page.js');
assert.ok(page.includes('checkLocalCrisis'), 'page.js must run the on-device crisis check');
assert.ok(page.includes('/api/generate-drafts'), 'page.js must draft through the backend');
assert.ok(page.includes('/api/check-risk'), 'page.js must run the model risk check before drafting');
assert.ok(read('App.tsx').includes('checkRisk('), 'App.tsx must run the model risk check before drafting');
assert.ok(page.includes('sanitizePii'), 'page.js must remove identifiers before sending');
console.log('[PASS] Web page has the Guardian check and AI drafting');

console.log('[SUCCESS] Honest UI and safety wiring verified.');
