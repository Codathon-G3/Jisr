/**
 * Local On-Device PII Sanitizer (Privacy & Trust Layer)
 *
 * Scrubs personally identifiable information (PII) before any text leaves
 * the device. Detects:
 * 1. Libyan phone numbers (+218, 091, 092...)
 * 2. Email addresses
 * 3. Family kinship mentions (والدي, أمي, بابا, ماما, خوي, أختي...)
 *
 * Exactly mirrors backend/app/services/identifier_removal.py logic.
 */

import { IdentifierRemoved, PlaceholderType } from '../types';

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

const PHONE_RE = /(?<!\d)(?:\+?218[\s-]?\d{2}[\s-]?\d{7}|09\d{8})(?!\d)/g;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

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
 * Sanitizes input text by replacing PII with safe placeholders:
 * - Phone numbers -> "[phone]"
 * - Email addresses -> "[email]"
 * - Kinship terms -> "[name]"
 */
export function sanitizePii(text: string): SanitizationResult {
  if (!text || text.trim() === '') {
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
  findMatches(KINSHIP_RE, '[name]');

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
