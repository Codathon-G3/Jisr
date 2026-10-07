// Phrase layer of the Guardian risk check (Person 3).
// High recall by design: any match means riskDetected = true.
// Person 2 runs this alongside the LLM judge; if EITHER flags, show the support card.

import { normalizeText } from './normalize.mjs';

// Pre-normalise the lists once so each check is fast.
export function prepareCrisisList(crisisJson) {
  const phrases = (crisisJson.phrases ?? []).map((p) => ({ ...p, norm: normalizeText(p.text) }));
  const benign = (crisisJson.benign_idioms ?? []).map((t) => normalizeText(t));
  return { phrases, benign };
}

// Returns { riskDetected, matches: [{ text, category }] }
export function checkCrisisPhrases(text, prepared) {
  let norm = ` ${normalizeText(text)} `;

  // Remove only the exact benign idiom spans (e.g. "نموت من الضحك").
  // The rest of the text is still checked, and the LLM judge still sees everything.
  for (const idiom of prepared.benign) {
    if (idiom) norm = norm.split(idiom).join(' ');
  }

  const matches = prepared.phrases
    .filter((p) => p.norm && norm.includes(p.norm))
    .map((p) => ({ text: p.text, category: p.category }));

  return { riskDetected: matches.length > 0, matches };
}
