// Shared text normaliser for Jisr safety checks.
// Person 2 and Person 3 must both use this, so the phrase list and the
// output check match text the same way.

export function normalizeText(input) {
  return String(input ?? '')
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '') // Arabic marks + tatweel (same as Python)
    .replace(/[إأآٱ]/g, 'ا')                     // alef variants
    .replace(/ى/g, 'ي')                          // alef maqsura -> ya
    .replace(/ة/g, 'ه')                          // ta marbuta -> ha
    .replace(/[’'`]/g, '')                       // apostrophes (e.g. can't -> cant)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')           // punctuation -> space
    .replace(/\s+/g, ' ')
    .trim();
}
