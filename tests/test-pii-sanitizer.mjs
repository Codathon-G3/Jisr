import assert from 'node:assert';

console.log('--- Testing PII Sanitization Patterns ---');

const KINSHIP_TERMS = [
  'والدتي',
  'والدي',
  'أختي',
  'اخوي',
  'بابا',
  'ماما',
  'أبيّ',
  'أبي',
  'أمي',
  'خوي',
];

const escapedKinship = [...KINSHIP_TERMS]
  .sort((a, b) => b.length - a.length)
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

const KINSHIP_RE = new RegExp(
  `(?<![\\u0600-\\u06FF])(?:${escapedKinship})(?![\\u0600-\\u06FF])`,
  'g'
);
const PHONE_RE = /(?<![\d\u0660-\u0669])(?:\+?218[\s-]?(?:\d{2}|[\u0660-\u0669]{2})[\s-]?(?:\d{7}|[\u0660-\u0669]{7})|(?:09|٠٩)(?:[\d\u0660-\u0669]{8}))(?![\d\u0660-\u0669])/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const NAME_INTRO_RE = /(?<=(?:^|\s)اسمي(?:\s+هو)?\s+)[\u0600-\u06FF]+/g;

// Test cases
// 1. Libyan phone numbers
assert.strictEqual('كلمني على 0912345678 توا'.replace(PHONE_RE, '[phone]'), 'كلمني على [phone] توا');
assert.strictEqual('رقمي +218 91 1234567'.replace(PHONE_RE, '[phone]'), 'رقمي [phone]');
assert.strictEqual('رقمي +218-92-1234567'.replace(PHONE_RE, '[phone]'), 'رقمي [phone]');
assert.strictEqual('كلمني على ٠٩١٢٣٤٥٦٧٨ توا'.replace(PHONE_RE, '[phone]'), 'كلمني على [phone] توا');

// 2. Email addresses
assert.strictEqual('ايميل ahmed@example.com هنا'.replace(EMAIL_RE, '[email]'), 'ايميل [email] هنا');

// 3. Kinship terms
assert.strictEqual('حكيت مع والدي و بابا'.replace(KINSHIP_RE, '[name]'), 'حكيت مع [name] و [name]');
assert.strictEqual('تكلمت مع خوي و أختي'.replace(KINSHIP_RE, '[name]'), 'تكلمت مع [name] و [name]');

// 4. Name introductions
assert.strictEqual('اسمي أحمد ومحتاج مساعدة'.replace(NAME_INTRO_RE, '[name]'), 'اسمي [name] ومحتاج مساعدة');

console.log('[PASS] Libyan phone number scrubbers (ASCII & Arabic-Indic digits) verified');
console.log('[PASS] Email scrubbers verified');
console.log('[PASS] Family kinship scrubbers verified');
console.log('[PASS] Name introduction scrubbers verified');
console.log('[SUCCESS] PII Sanitizer logic verified successfully!');
