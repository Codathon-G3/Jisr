import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert';
import ts from 'typescript';

console.log('--- Testing the API client (src/services/api.ts) ---');

function loadTs(path, overrides = {}) {
  const fullPath = resolve(path);
  const { outputText } = ts.transpileModule(readFileSync(fullPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const nodeRequire = createRequire(fullPath);
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    (id) => (id in overrides ? overrides[id] : nodeRequire(id)),
    mod,
    mod.exports
  );
  return mod.exports;
}

const apiSource = readFileSync(resolve('src/services/api.ts'), 'utf8');

// C2: Expo only inlines EXPO_PUBLIC_* variables written with dot notation.
assert.ok(apiSource.includes('process.env.EXPO_PUBLIC_API_URL'), 'api.ts must read process.env.EXPO_PUBLIC_API_URL');
assert.ok(!/process\.env\s*(\)|as [^)]*\))?\s*\[/.test(apiSource), 'api.ts must not read process.env with brackets');
console.log('[PASS] Backend URL uses the dot-notation variable Expo inlines at build time');

const piiSanitizer = loadTs('src/services/piiSanitizer.ts');
const crisisCheck = loadTs('src/services/crisisCheck.ts');
process.env.EXPO_PUBLIC_API_URL = 'https://jisr-api.example.org/';
const api = loadTs('src/services/api.ts', {
  'react-native': { Platform: { OS: 'android' } },
  './piiSanitizer': piiSanitizer,
  './crisisCheck': crisisCheck,
});

// Mocked network: records every request and answers with the queued response.
const requests = [];
let nextResponse = null;
globalThis.fetch = async (url, options) => {
  requests.push({ url, body: JSON.parse(options.body) });
  if (nextResponse instanceof Error) throw nextResponse;
  return { ok: true, json: async () => nextResponse };
};

const secret = 'اسمي أحمد ورقمي 0912345678 وبابا يضغط عليا';
const leaks = (body) => JSON.stringify(body).includes('أحمد') || JSON.stringify(body).includes('0912345678');

// C2: the configured URL is used (trailing slash trimmed); without it, the live https API.
assert.strictEqual(api.getApiBaseUrl(), 'https://jisr-api.example.org');
delete process.env.EXPO_PUBLIC_API_URL;
assert.strictEqual(api.getApiBaseUrl(), 'https://jisr-api.onrender.com', 'default must be the live https API');
process.env.EXPO_PUBLIC_API_URL = 'https://jisr-api.example.org/';

// C5: every endpoint receives identifier-free text.
nextResponse = {
  sanitisedText: '', identifiersRemoved: [], outputCheckPassed: true, usedFallbackTemplate: false,
  drafts: [
    { tone: 'gentle', text: 'أ' }, { tone: 'direct', text: 'ب' }, { tone: 'formal', text: 'ج' },
  ],
};
const ok = await api.generateDrafts({ text: secret, chips: ['exams'], recipient: 'friend', language: 'ar' });
assert.strictEqual(ok.usedFallbackTemplate, false);
assert.strictEqual(ok.drafts.length, 3);

nextResponse = { riskDetected: false, method: 'none' };
await api.checkRisk(secret, ['exams']);

nextResponse = { alignments: [] };
await api.checkFaithfulness(secret, 'مسودة');

assert.strictEqual(requests.length, 3);
assert.deepStrictEqual(
  requests.map((r) => new URL(r.url).pathname),
  ['/api/generate-drafts', '/api/check-risk', '/api/faithfulness']
);
for (const request of requests) {
  assert.ok(!leaks(request.body), `identifiers leaked to ${request.url}`);
}
assert.ok(requests[0].body.text.includes('بابا'), 'family words are kept for drafting');
console.log('[PASS] /generate-drafts, /check-risk and /faithfulness only receive identifier-free text');

// C6: a server-side risk flag returns no drafts.
nextResponse = {
  sanitisedText: '', identifiersRemoved: [], drafts: [], outputCheckPassed: true,
  usedFallbackTemplate: false, riskDetected: true, riskMethod: 'model',
};
const risk = await api.generateDrafts({ text: 'الدنيا سوداء', chips: ['other'], recipient: 'friend' });
assert.strictEqual(risk.riskDetected, true);
assert.deepStrictEqual(risk.drafts, []);
console.log('[PASS] A risk flag from the server returns no drafts');

// Offline: any network error falls back to the plain templates.
nextResponse = new Error('offline');
const offline = await api.generateDrafts({ text: 'عندي ضغط', chips: ['exams'], recipient: 'parent' });
assert.strictEqual(offline.usedFallbackTemplate, true);
assert.strictEqual(offline.drafts.length, 3);
assert.ok(offline.drafts.every((d) => d.text.length > 0));
console.log('[PASS] Network errors fall back to safety/plain-templates.json');

console.log('[SUCCESS] API client verified on the shipped module.');
