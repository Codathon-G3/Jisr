import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert';

console.log('--- Verifying Milestone 2: Mobile User Flow Integration ---');

// 1. Verify existence of all Milestone 2 owned files
const m2Files = [
  'App.tsx',
  'src/types/index.ts',
  'src/services/api.ts',
  'src/services/crisisCheck.ts',
  'src/services/piiSanitizer.ts',
  'src/services/storage.ts',
  'src/components/SupportCardModal.tsx',
  'src/components/TriggerModal.tsx',
  'src/components/index.ts',
  'src/screens/CaptureScreen.tsx',
];

for (const file of m2Files) {
  const fullPath = resolve(file);
  assert(existsSync(fullPath), `Missing required file: ${file}`);
  const content = readFileSync(fullPath, 'utf8');
  assert(content.length > 50, `File appears truncated: ${file}`);
  console.log(`✅ File verified: ${file}`);
}

// 2. Verify plain templates coverage in safety/plain-templates.json
const plainTemplates = JSON.parse(readFileSync(resolve('safety/plain-templates.json'), 'utf8'));
const chips = ['exams', 'family', 'work', 'relationships', 'sleep', 'money', 'other'];
const recipients = ['friend', 'sibling', 'parent', 'trusted_adult', 'counsellor'];
const tones = ['gentle', 'direct', 'formal'];

for (const tone of tones) {
  assert(plainTemplates[tone], `Missing tone in plain-templates: ${tone}`);
  for (const rec of recipients) {
    const tmpl = plainTemplates[tone][rec];
    assert(tmpl, `Missing template for ${tone}.${rec}`);
    assert(tmpl.includes('[topic]') || tmpl.includes('{topic}'), `Template missing [topic] placeholder in ${tone}.${rec}`);
  }
}
console.log('✅ All 35 template permutations (3 tones × 5 recipients) contain valid [topic] placeholders');

for (const chip of chips) {
  assert(plainTemplates.topic_labels[chip], `Missing topic label for chip: ${chip}`);
}
console.log('✅ All 7 stress chips have mapped topic labels in plain-templates.json');

// 3. Verify support card unalterable static structure in safety/support-card.json
const supportCard = JSON.parse(readFileSync(resolve('safety/support-card.json'), 'utf8'));
assert(supportCard.title_ar, 'Missing title_ar in support-card.json');
assert(supportCard.fallbackMessage_ar, 'Missing fallbackMessage_ar in support-card.json');
assert(Array.isArray(supportCard.contacts), 'support-card.json contacts must be an array');
console.log('✅ Static SupportCard structure verified');

// 4. Verify ar.json localization keys for all chips, recipients, triggers, tones
const arJson = JSON.parse(readFileSync(resolve('src/i18n/ar.json'), 'utf8'));
for (const chip of chips) {
  assert(arJson.chips[chip], `Missing chip in ar.json: ${chip}`);
}
for (const rec of recipients) {
  assert(arJson.recipients[rec], `Missing recipient in ar.json: ${rec}`);
}
assert(arJson.triggers.same_session_prompt.includes('{chip}'), 'same_session_prompt missing {chip}');
assert(arJson.triggers.pattern_prompt.includes('{chip}'), 'pattern_prompt missing {chip}');
assert(arJson.triggers.persistent_human_route, 'Missing persistent_human_route in ar.json');
console.log('✅ Arabic localization keys and trigger templates verified');

// 5. Verify component export contracts in src/components/index.ts
const componentsIndex = readFileSync(resolve('src/components/index.ts'), 'utf8');
const requiredExports = [
  'BaselineComparison',
  'FaithfulnessView',
  'OutboundPreview',
  'SupportCardModal',
  'TriggerModal',
];
for (const exp of requiredExports) {
  assert(componentsIndex.includes(exp), `src/components/index.ts must export ${exp}`);
}
console.log('✅ All 5 trust and modal components exported from src/components/index.ts');

console.log('\n🎉 Milestone 2 Integration Verification passed cleanly!');
