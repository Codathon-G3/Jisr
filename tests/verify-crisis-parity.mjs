import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert';
import ts from 'typescript';

import { prepareCrisisList, checkCrisisPhrases } from '../safety/lib/crisis-check.mjs';

console.log('--- Verifying mobile crisis check parity with safety/lib/crisis-check.mjs ---');

// Transpile the exact src/services/crisisCheck.ts the APK ships, so the test
// cannot drift from the app code.
const crisisCheckPath = resolve('src/services/crisisCheck.ts');
const { outputText } = ts.transpileModule(readFileSync(crisisCheckPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
});
const mobileModule = { exports: {} };
new Function('require', 'module', 'exports', outputText)(
  createRequire(crisisCheckPath),
  mobileModule,
  mobileModule.exports
);
const mobile = mobileModule.exports;

const crisisData = JSON.parse(readFileSync(resolve('safety/crisis-phrases.json'), 'utf8'));
const devSet = JSON.parse(readFileSync(resolve('safety/dev-set.json'), 'utf8'));
const reference = prepareCrisisList(crisisData);

// Spellings a user can type for the same phrase on a phone keyboard.
const variants = (text) => [
  text,
  `والله ${text} خلاص`,
  `${text}!!`,
  text.replace(/ا/g, 'ـا'), // tatweel
  text.split('').join('َ'), // fatha on every letter
  text.replace(/ي/g, 'ى').replace(/ه(?=\s|$)/g, 'ة'), // alef maqsura / ta marbuta
];

let checks = 0;

// 1. Every phrase in the list is caught by the app, in every spelling.
for (const phrase of crisisData.phrases) {
  for (const text of variants(phrase.text)) {
    checks++;
    assert.strictEqual(
      mobile.checkLocalCrisis(text).riskDetected,
      true,
      `Mobile check missed crisis phrase variant: ${text}`
    );
  }
}
console.log(`[PASS] All ${crisisData.phrases.length} crisis phrases caught on-device (${checks} spellings)`);

// 2. The app and the Guardian engine agree on every phrase variant and dev-set item.
const parityInputs = [
  ...crisisData.phrases.flatMap((phrase) => variants(phrase.text)),
  ...devSet.map((item) => item.text),
];
for (const text of parityInputs) {
  checks++;
  assert.strictEqual(
    mobile.checkLocalCrisis(text).riskDetected,
    checkCrisisPhrases(text, reference).riskDetected,
    `Mobile and safety engine disagree on: ${text}`
  );
}
console.log(`[PASS] Mobile matches safety/lib/crisis-check.mjs on ${parityInputs.length} inputs`);

// 3. Benign idioms such as "نموت من الضحك" never raise a false alarm.
for (const idiom of crisisData.benign_idioms) {
  checks++;
  assert.strictEqual(
    mobile.checkLocalCrisis(idiom).riskDetected,
    false,
    `Benign idiom flagged as crisis: ${idiom}`
  );
}
console.log(`[PASS] ${crisisData.benign_idioms.length} benign idioms stay unflagged`);

// 4. Quranic/annotation marks are stripped like the Python backend does
//    (U+0610–061A, U+06D6–06ED). Inside a word they would otherwise split it
//    and hide the phrase.
for (const mark of ['ؐ', 'ؚ', 'ۖ', 'ۭ']) {
  const hidden = `ن${mark}بي نمو${mark}ت`;
  checks++;
  assert.strictEqual(
    mobile.normalizeText(hidden),
    'نبي نموت',
    `Mark U+${mark.charCodeAt(0).toString(16).toUpperCase()} not stripped`
  );
  assert.strictEqual(
    mobile.checkLocalCrisis(hidden).riskDetected,
    true,
    `Mark U+${mark.charCodeAt(0).toString(16).toUpperCase()} hides a crisis phrase`
  );
}
console.log('[PASS] Extended Arabic marks stripped (same range as the Python backend)');

console.log(`[SUCCESS] Crisis check parity verified (${checks} checks)`);
