import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('--- Verifying Person 4 Trust & Localization Technicalities ---');

// 1. Verify src/i18n/ar.json
const arJsonPath = resolve('src/i18n/ar.json');
if (!existsSync(arJsonPath)) {
  console.error('❌ Missing src/i18n/ar.json');
  process.exit(1);
}
const arJson = JSON.parse(readFileSync(arJsonPath, 'utf8'));
console.log('✅ src/i18n/ar.json loaded and valid JSON');

const requiredSections = ['chips', 'recipients', 'triggers', 'buttons', 'tones', 'disclosure', 'limits', 'trust'];
for (const sec of requiredSections) {
  if (!arJson[sec]) {
    console.error(`❌ Missing section in ar.json: ${sec}`);
    process.exit(1);
  }
}
console.log('✅ All required Arabic localization sections present');

// 2. Verify Trust Components
const components = [
  'src/components/BaselineComparison.tsx',
  'src/components/FaithfulnessView.tsx',
  'src/components/OutboundPreview.tsx',
  'src/components/index.ts',
];

for (const comp of components) {
  if (!existsSync(resolve(comp))) {
    console.error(`❌ Missing component file: ${comp}`);
    process.exit(1);
  }
  const content = readFileSync(resolve(comp), 'utf8');
  if (!content.includes('export const') && !content.includes('export *')) {
    console.error(`❌ Invalid component export in: ${comp}`);
    process.exit(1);
  }
  console.log(`✅ Verified component: ${comp}`);
}

console.log('\n🎉 All Person 4 Trust & Localization technical deliverables verified successfully!');
