// Output check (Guardian stage 4) — Person 3.
// Person 2 calls checkDraft() on every AI draft.
// If passed === false: regenerate once; if it fails again, use the plain template.

import { normalizeText } from './normalize.mjs';

export function prepareForbiddenTerms(forbiddenJson) {
  return (forbiddenJson.terms ?? []).map((t) => ({ ...t, norm: normalizeText(t.text) }));
}

// Matches the team spec: { passed, flaggedTerms: string[] }
// flaggedDetails adds the category of each match, for logging and the evidence report.
export function checkDraft(draft, preparedTerms) {
  const norm = ` ${normalizeText(draft)} `;
  const hits = preparedTerms.filter((t) => t.norm && norm.includes(t.norm));
  return {
    passed: hits.length === 0,
    flaggedTerms: hits.map((t) => t.text),
    flaggedDetails: hits.map((t) => ({ text: t.text, category: t.category })),
  };
}

// Convenience: check all three drafts at once.
export function checkAllDrafts(drafts, preparedTerms) {
  return drafts.map((d) => ({ tone: d.tone, ...checkDraft(d.text, preparedTerms) }));
}
