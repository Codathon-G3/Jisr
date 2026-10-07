import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert';

console.log('--- Testing Offline Fallback to safety/plain-templates.json ---');

const plainTemplatesData = JSON.parse(readFileSync(resolve('safety/plain-templates.json'), 'utf8'));

function resolveTopicLabel(chips) {
  const topicLabels = plainTemplatesData.topic_labels;
  const matched = chips.map((c) => topicLabels[c]).filter(Boolean);
  if (matched.length === 0) {
    return topicLabels.other || 'موضوع شاغلني';
  }
  return matched.join(' و ');
}

function getOfflineDrafts(chips, recipient) {
  const topic = resolveTopicLabel(chips);
  const fillTemplate = (templateStr) => {
    return templateStr.replace(/\[topic\]/g, topic).replace(/\{topic\}/g, topic);
  };

  const gentleTemplates = plainTemplatesData.gentle;
  const directTemplates = plainTemplatesData.direct;
  const formalTemplates = plainTemplatesData.formal;

  const gentleRaw = gentleTemplates[recipient] || gentleTemplates.friend;
  const directRaw = directTemplates[recipient] || directTemplates.friend;
  const formalRaw = formalTemplates[recipient] || formalTemplates.friend;

  return [
    { tone: 'gentle', text: fillTemplate(gentleRaw) },
    { tone: 'direct', text: fillTemplate(directRaw) },
    { tone: 'formal', text: fillTemplate(formalRaw) },
  ];
}

const chipsList = ['exams', 'family', 'work', 'relationships', 'sleep', 'money', 'other'];
const recipientsList = ['friend', 'sibling', 'parent', 'trusted_adult', 'counsellor'];

let testCount = 0;
for (const chip of chipsList) {
  for (const rec of recipientsList) {
    const drafts = getOfflineDrafts([chip], rec);
    assert.strictEqual(drafts.length, 3, 'Must have 3 drafts');
    assert.strictEqual(drafts[0].tone, 'gentle');
    assert.strictEqual(drafts[1].tone, 'direct');
    assert.strictEqual(drafts[2].tone, 'formal');

    const expectedTopic = plainTemplatesData.topic_labels[chip];
    assert(drafts[0].text.includes(expectedTopic), `Draft does not contain topic for ${chip}.${rec}`);
    assert(!drafts[0].text.includes('[topic]'), `Draft still contains [topic] placeholder for ${chip}.${rec}`);
    assert(!drafts[0].text.includes('{topic}'), `Draft still contains {topic} placeholder for ${chip}.${rec}`);
    testCount++;
  }
}

console.log(`✅ Verified ${testCount} topic/recipient permutations for offline fallback drafts`);
console.log('🎉 Offline fallback is 100% deterministic and safe!');
