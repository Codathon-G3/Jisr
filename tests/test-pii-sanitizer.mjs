import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert';
import ts from 'typescript';

console.log('--- Testing identifier removal (src/services/piiSanitizer.ts) ---');

// Transpile the exact sanitizer the app ships, so the test cannot drift from the
// app code (the old version of this test copied the regexes instead).
const sanitizerPath = resolve('src/services/piiSanitizer.ts');
const { outputText } = ts.transpileModule(readFileSync(sanitizerPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
    resolveJsonModule: true,
  },
});
const sanitizerModule = { exports: {} };
new Function('require', 'module', 'exports', outputText)(
  createRequire(sanitizerPath),
  sanitizerModule,
  sanitizerModule.exports
);
const { sanitizePii } = sanitizerModule.exports;

// Same cases as backend/tests/test_identifier_removal.py, so phone and server match.
const { cases } = JSON.parse(readFileSync(resolve('tests/fixtures/pii-cases.json'), 'utf8'));

let passed = 0;
for (const testCase of cases) {
  const result = sanitizePii(testCase.text);
  assert.strictEqual(result.sanitisedText, testCase.sanitised, `sanitised text for: ${testCase.text}`);
  assert.deepStrictEqual(result.identifiersRemoved, testCase.removed, `removed list for: ${testCase.text}`);
  passed++;
}
console.log(`[PASS] ${passed} shared cases match backend/app/services/identifier_removal.py`);

// Family words stay: the drafts need to know who is involved.
assert.strictEqual(sanitizePii('بابا يضغط عليا').sanitisedText, 'بابا يضغط عليا');
console.log('[PASS] Family words are kept');

console.log('[SUCCESS] Identifier removal verified on the shipped sanitizer.');
