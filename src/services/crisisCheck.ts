/**
 * Client-Side Zero-Latency Crisis Screening (Guardian Layer 2)
 *
 * Implements client-side high-recall phrase matching using normalization,
 * tatweel removal, diacritic stripping, and substring search against
 * safety/crisis-phrases.json. Benign idioms (e.g. "نموت من الضحك") are
 * excluded prior to detection.
 */

import crisisPhrasesData from '../../safety/crisis-phrases.json';
import type { RiskResult } from '../types';

export function normalizeText(input: string): string {
  return String(input ?? '')
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '') // Arabic marks + tatweel (same as safety/lib/normalize.mjs and the Python backend)
    .replace(/[إأآٱ]/g, 'ا')                     // alef variants
    .replace(/ى/g, 'ي')                          // alef maqsura -> ya
    .replace(/ة/g, 'ه')                          // ta marbuta -> ha
    .replace(/[’'`]/g, '')                       // apostrophes
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')           // punctuation -> space
    .replace(/\s+/g, ' ')
    .trim();
}

export interface PreparedCrisisPhrase {
  text: string;
  norm: string;
  category: string;
  dialect?: string;
  script?: string;
}

export interface PreparedCrisisData {
  phrases: PreparedCrisisPhrase[];
  benign: string[];
}

export function prepareCrisisList(crisisJson: any): PreparedCrisisData {
  const phrases: PreparedCrisisPhrase[] = (crisisJson?.phrases ?? []).map((p: any) => ({
    text: p.text,
    norm: normalizeText(p.text),
    category: p.category || 'self-harm',
    dialect: p.dialect,
    script: p.script,
  }));
  const benign: string[] = (crisisJson?.benign_idioms ?? []).map((t: any) =>
    normalizeText(t)
  );
  return { phrases, benign };
}

// Pre-normalize crisis data once at module evaluation for zero-latency lookups
const defaultPreparedData: PreparedCrisisData = prepareCrisisList(crisisPhrasesData);

/**
 * Checks whether text contains crisis phrases using zero-latency normalized matching.
 * Benign idioms are excised beforehand so common expressions like "نموت من الضحك"
 * do not trigger a false alarm.
 */
export function checkCrisisPhrases(
  text: string,
  prepared: PreparedCrisisData = defaultPreparedData
): RiskResult {
  if (!text || !text.trim()) {
    return {
      riskDetected: false,
      method: 'none',
      matches: [],
    };
  }

  let norm = ` ${normalizeText(text)} `;

  // Remove exact benign idiom spans
  for (const idiom of prepared.benign) {
    if (idiom) {
      norm = norm.split(idiom).join(' ');
    }
  }

  const matches = prepared.phrases
    .filter((p) => p.norm && norm.includes(p.norm))
    .map((p) => ({ text: p.text, category: p.category }));

  const hasMatches = matches.length > 0;

  return {
    riskDetected: hasMatches,
    method: hasMatches ? 'phrase' : 'none',
    matches,
  };
}

/**
 * Convenience function running local crisis screening against default phrases.
 */
export function checkLocalCrisis(text: string): RiskResult {
  return checkCrisisPhrases(text, defaultPreparedData);
}
