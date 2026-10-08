import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert';
import ts from 'typescript';

console.log('--- Testing the private on-device record (src/services/storage.ts, R5) ---');

// Transpile the shipped TypeScript modules so the test runs the real code.
function loadTs(path, requireOverride) {
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
    (id) => requireOverride?.(id) ?? nodeRequire(id),
    mod,
    mod.exports
  );
  return mod.exports;
}

const logic = loadTs('src/services/historyLogic.ts');
const DAY = logic.DAY_MS;
const now = Date.UTC(2026, 9, 8, 12);

// ---- Pure rules ----
const items = [
  { id: 'a', chip: 'exams', timestamp: now - 1 * DAY },
  { id: 'b', chip: 'exams', timestamp: now - 2 * DAY },
  { id: 'c', chip: 'family', timestamp: now - 10 * DAY },
  { id: 'd', chip: 'exams', timestamp: now - 3 * DAY, recipient: 'parent' },
  { id: 'e', chip: 'money' }, // malformed: no timestamp
];
const kept = logic.pruneExpired(items, now, 7);
assert.deepStrictEqual(kept.map((i) => i.id), ['a', 'b', 'd'], 'entries older than 7 days are dropped');
assert.ok(kept.every((i) => !('recipient' in i)), 'only chips and time are kept');
assert.deepStrictEqual(logic.countByChip(kept), { exams: 3 });
assert.strictEqual(logic.isRecurring(kept, 'exams'), true, '3 times inside the window is a pattern');
assert.strictEqual(logic.isRecurring(logic.pruneExpired(items, now, 1), 'exams'), false);
assert.strictEqual(logic.parseRetentionDays(null), 7, 'default retention is 7 days');
assert.strictEqual(logic.parseRetentionDays('30'), 30);
assert.strictEqual(logic.parseRetentionDays('999'), 7, 'unknown windows fall back to the default');
console.log('[PASS] Expiry, chips-only entries, counts and recurrence rules');

// ---- storage.ts with an in-memory AsyncStorage ----
const disk = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    getItem: async (k) => (disk.has(k) ? disk.get(k) : null),
    setItem: async (k, v) => void disk.set(k, v),
    removeItem: async (k) => void disk.delete(k),
  },
};
const storage = loadTs('src/services/storage.ts', (id) => {
  if (id === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (id === './historyLogic') return logic;
  return undefined;
});

assert.strictEqual(await storage.isHistoryEnabled(), false, 'the record is off by default');
await storage.recordChipSelections(['exams']);
assert.deepStrictEqual(await storage.getHistory(), [], 'nothing is stored while the record is off');
assert.strictEqual(await storage.checkChipRecurrence('exams'), false);

await storage.setHistoryEnabled(true);
for (let i = 0; i < 3; i++) await storage.recordChipSelections(['exams', 'family']);
assert.deepStrictEqual(await storage.getHistorySummary(), { exams: 3, family: 3 });
assert.strictEqual(await storage.checkChipRecurrence('exams'), true, 'pattern invitation after 3 sessions');
const stored = JSON.parse(disk.get('@jisr_chip_history'));
assert.ok(stored.every((e) => Object.keys(e).sort().join() === 'chip,id,timestamp'), 'stored entries hold chips and time only');

// An entry from 8 days ago is erased on the next read with the 7-day window.
stored.push({ id: 'old', chip: 'sleep', timestamp: Date.now() - 8 * DAY });
disk.set('@jisr_chip_history', JSON.stringify(stored));
assert.ok(!(await storage.getHistory()).some((e) => e.id === 'old'), 'expired entries are erased');
assert.ok(!disk.get('@jisr_chip_history').includes('"old"'), 'expired entries are removed from the device');

await storage.setHistoryEnabled(false);
assert.strictEqual(disk.has('@jisr_chip_history'), false, 'turning the record off erases it');
console.log('[PASS] Off by default, opt-in recording, expiry on the device, erase on disable');

console.log('[SUCCESS] Private on-device record verified on the shipped storage module.');
