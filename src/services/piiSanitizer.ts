/**
 * Local On-Device Identifier Removal (Privacy & Trust Layer)
 *
 * Replaces personal identifiers before any text leaves the device:
 * 1. Emails -> [email]
 * 2. Phone numbers and other 7+ digit numbers, Latin or Arabic-Indic digits -> [phone]
 * 3. @handles, the word after "اسمي" / "my name is", and common names -> [name]
 *
 * Family words (بابا, أمي, خوي...) are not identifiers and are kept, because the
 * drafts need to know who is involved. Names that are also everyday words are left
 * out of the list (see safety/identifiers.json), so the outbound preview is the
 * user's final check.
 *
 * Must stay identical to backend/app/services/identifier_removal.py; both are run
 * against tests/fixtures/pii-cases.json.
 */

import type { IdentifierRemoved, PlaceholderType } from '../types';
import identifierLists from '../../safety/identifiers.json';

const ARABIC_LETTER = '\\u0600-\\u06FF';
const DIGIT = '0-9\\u0660-\\u0669\\u06F0-\\u06F9';

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// 7+ digits, optionally split by single spaces or hyphens.
const PHONE_RE = new RegExp(
  `(?<![${DIGIT}])\\+?[${DIGIT}](?:[ \\-]?[${DIGIT}]){6,}(?![${DIGIT}])`,
  'g'
);
const HANDLE_RE = /(?<![A-Za-z0-9_@])@[A-Za-z0-9_.]{2,}/g;

const alternation = (words: string[]): string =>
  [...words]
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

// Group 2 is always the part that gets replaced.
const NAME_PATTERNS: RegExp[] = [
  new RegExp(
    `(?<![${ARABIC_LETTER}])(${alternation(identifierLists.name_markers_ar)})\\s+([${ARABIC_LETTER}]+)`,
    'g'
  ),
  new RegExp(
    `(?<![A-Za-z])(${alternation(identifierLists.name_markers_latin)})\\s+([A-Za-z]+)`,
    'gi'
  ),
  new RegExp(
    `(?<![${ARABIC_LETTER}])([وفبلك]?)(${alternation(identifierLists.names_ar)})(?![${ARABIC_LETTER}])`,
    'g'
  ),
  new RegExp(
    `(?<![A-Za-z])()(${alternation(identifierLists.names_latin)})(?![A-Za-z])`,
    'gi'
  ),
];

interface Span {
  start: number;
  end: number;
  placeholder: PlaceholderType;
}

function addSpan(spans: Span[], start: number, end: number, placeholder: PlaceholderType): void {
  for (let i = 0; i < spans.length; i++) {
    const existing = spans[i];
    if (end <= existing.start || start >= existing.end) {
      continue;
    }
    // Overlapping span: keep the longer span
    if (end - start > existing.end - existing.start) {
      spans[i] = { start, end, placeholder };
    }
    return;
  }
  spans.push({ start, end, placeholder });
}

export interface SanitizationResult {
  sanitisedText: string;
  identifiersRemoved: IdentifierRemoved[];
}

/**
 * Returns the exact text that may leave the device, plus what was replaced.
 */
export function sanitizePii(text: string): SanitizationResult {
  if (!text) {
    return {
      sanitisedText: text ?? '',
      identifiersRemoved: [],
    };
  }

  const spans: Span[] = [];

  const findMatches = (regex: RegExp, placeholder: PlaceholderType) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      addSpan(spans, match.index, match.index + match[0].length, placeholder);
    }
  };

  findMatches(EMAIL_RE, '[email]');
  findMatches(PHONE_RE, '[phone]');
  findMatches(HANDLE_RE, '[name]');

  for (const regex of NAME_PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index + match[0].length - match[2].length;
      addSpan(spans, start, start + match[2].length, '[name]');
    }
  }

  spans.sort((a, b) => a.start - b.start);

  const pieces: string[] = [];
  const removed: IdentifierRemoved[] = [];
  let cursor = 0;

  for (const span of spans) {
    pieces.push(text.slice(cursor, span.start));
    pieces.push(span.placeholder);
    removed.push({
      original: text.slice(span.start, span.end),
      placeholder: span.placeholder,
    });
    cursor = span.end;
  }
  pieces.push(text.slice(cursor));

  return {
    sanitisedText: pieces.join(''),
    identifiersRemoved: removed,
  };
}
