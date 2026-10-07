/**
 * Resilient API Client for Jisr Mobile Application
 *
 * Communicates with the stateless FastAPI backend (/api/check-risk,
 * /api/generate-drafts, /api/faithfulness).
 *
 * Offline-First Resiliency:
 * If the backend is unreachable or offline, automatically falls back to
 * deterministic templates from safety/plain-templates.json with zero interruption.
 */

import { Platform } from 'react-native';
import {
  Chip,
  Recipient,
  Tone,
  Draft,
  CheckRiskRequest,
  CheckRiskResponse,
  GenerateDraftsRequest,
  GenerateDraftsResponse,
  FaithfulnessRequest,
  FaithfulnessResponse,
  Alignment,
} from '../types';
import { sanitizePii } from './piiSanitizer';
import { checkLocalCrisis } from './crisisCheck';
import plainTemplatesData from '../../safety/plain-templates.json';

const DEFAULT_TIMEOUT_MS = 3000;

/**
 * Resolves the appropriate base API URL based on platform and environment.
 */
export function getApiBaseUrl(): string {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    (process.env as Record<string, string | undefined>)['EXPO_PUBLIC_API_URL']
  ) {
    return (process.env as Record<string, string | undefined>)['EXPO_PUBLIC_API_URL']!;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

/**
 * Resolves the localized topic label for a set of chips using safety/plain-templates.json.
 */
export function resolveTopicLabel(chips: Chip[]): string {
  const topicLabels = plainTemplatesData.topic_labels as Record<string, string>;
  const matched = chips
    .map((c) => topicLabels[c])
    .filter(Boolean);

  if (matched.length === 0) {
    return topicLabels.other || 'موضوع شاغلني';
  }
  return matched.join(' و ');
}

/**
 * Generates deterministic fallback drafts from safety/plain-templates.json.
 * Guarantees 100% offline availability for Gentle, Direct, and Formal drafts.
 */
export function getOfflineDrafts(
  chips: Chip[],
  recipient: Recipient,
  text: string = ''
): GenerateDraftsResponse {
  const topic = resolveTopicLabel(chips);
  const pii = sanitizePii(text);

  const fillTemplate = (templateStr: string): string => {
    return templateStr
      .replace(/\[topic\]/g, topic)
      .replace(/\{topic\}/g, topic);
  };

  const gentleTemplates = plainTemplatesData.gentle as Record<string, string>;
  const directTemplates = plainTemplatesData.direct as Record<string, string>;
  const formalTemplates = plainTemplatesData.formal as Record<string, string>;

  const gentleRaw = gentleTemplates[recipient] || gentleTemplates.friend;
  const directRaw = directTemplates[recipient] || directTemplates.friend;
  const formalRaw = formalTemplates[recipient] || formalTemplates.friend;

  const drafts: Draft[] = [
    { tone: 'gentle', text: fillTemplate(gentleRaw) },
    { tone: 'direct', text: fillTemplate(directRaw) },
    { tone: 'formal', text: fillTemplate(formalRaw) },
  ];

  return {
    sanitisedText: pii.sanitisedText,
    identifiersRemoved: pii.identifiersRemoved,
    drafts,
    outputCheckPassed: true,
    usedFallbackTemplate: true,
  };
}

/**
 * Helper to execute fetch requests with a timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

/**
 * Pre-drafting crisis screening:
 * Checks local Guardian regexes first (zero latency), then falls back to FastAPI /api/check-risk.
 */
export async function checkRisk(
  text: string,
  chips: Chip[] = []
): Promise<CheckRiskResponse> {
  // 1. Client-side Guardian check (zero latency)
  const localResult = checkLocalCrisis(text);
  if (localResult.riskDetected) {
    return {
      riskDetected: true,
      method: 'phrase',
    };
  }

  // If text is empty, no model call needed
  if (!text || text.trim() === '') {
    return {
      riskDetected: false,
      method: 'none',
    };
  }

  // 2. Remote check via FastAPI backend
  try {
    const baseUrl = getApiBaseUrl();
    const payload: CheckRiskRequest = { text, chips, language: 'ar' };

    const response = await fetchWithTimeout(`${baseUrl}/api/check-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data: CheckRiskResponse = await response.json();
      return data;
    }
  } catch {
    // Network offline / unreachable: local phrase check was already clean
  }

  return {
    riskDetected: false,
    method: 'none',
  };
}

/**
 * Generates drafts for the user:
 * Tries FastAPI /api/generate-drafts; falls back to safety/plain-templates.json on any error.
 */
export async function generateDrafts(
  request: GenerateDraftsRequest
): Promise<GenerateDraftsResponse> {
  const fallback = getOfflineDrafts(request.chips, request.recipient, request.text);

  try {
    const baseUrl = getApiBaseUrl();
    // Scrub PII before sending over the network
    const pii = sanitizePii(request.text);

    const payload: GenerateDraftsRequest = {
      text: pii.sanitisedText,
      chips: request.chips,
      recipient: request.recipient,
      language: 'ar',
    };

    const response = await fetchWithTimeout(`${baseUrl}/api/generate-drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.drafts) && data.drafts.length === 3) {
        return {
          sanitisedText: data.sanitisedText ?? pii.sanitisedText,
          identifiersRemoved: pii.identifiersRemoved,
          drafts: data.drafts,
          outputCheckPassed: data.outputCheckPassed ?? true,
          usedFallbackTemplate: data.usedFallbackTemplate ?? false,
        };
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return fallback;
}

/**
 * Fetches faithfulness phrase alignments between user input and generated draft.
 */
export async function checkFaithfulness(
  originalText: string,
  draft: string
): Promise<FaithfulnessResponse> {
  if (!originalText || !originalText.trim()) {
    return { alignments: [] };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const payload: FaithfulnessRequest = { originalText, draft };

    const response = await fetchWithTimeout(`${baseUrl}/api/faithfulness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data: FaithfulnessResponse = await response.json();
      if (data && Array.isArray(data.alignments)) {
        return data;
      }
    }
  } catch {
    // Offline heuristic fallback: match shared words
  }

  // Offline heuristic: find words >= 3 letters from original text that appear in draft
  const words = originalText
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && draft.includes(w));

  const heuristicAlignments: Alignment[] = words.map((w) => ({
    draftPhrase: w,
    inputPhrase: w,
  }));

  return { alignments: heuristicAlignments };
}
