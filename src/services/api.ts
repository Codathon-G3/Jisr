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

// The live drafting service. A phone cannot use localhost.
const PUBLIC_API_BASE = 'https://jisr-api.onrender.com';

// The free Render instance can take about a minute to wake up, and a draft request
// may call the model up to three times (risk check, draft, one regeneration), so the
// client waits long enough for a real answer before falling back to templates.
const RISK_TIMEOUT_MS = 60000;
const DRAFTS_TIMEOUT_MS = 60000;
const FAITHFULNESS_TIMEOUT_MS = 15000;

/**
 * Resolves the backend base URL: the live service, unless a build sets
 * EXPO_PUBLIC_API_URL (for example http://localhost:8000 for backend development).
 *
 * Expo only inlines the variable when written exactly as
 * `process.env.EXPO_PUBLIC_API_URL` (dot notation), so do not change the access
 * below. Release Android builds block plain http, so a phone build needs https.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return PUBLIC_API_BASE;
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
  timeoutMs: number
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
 * Pre-drafting crisis screening: local phrase list first, then /api/check-risk.
 *
 * The app calls this before generateDrafts. /api/generate-drafts also runs the same
 * Guardian check on the server, so the model layer still runs if this call fails, as
 * long as the server has that gate (older deployments do not). If the server cannot
 * be reached this returns riskDetected: false, meaning only the on-device phrase
 * layer ran; the persistent human-route button never depends on it.
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

  // 2. Remote check via FastAPI backend, with identifiers removed first
  try {
    const baseUrl = getApiBaseUrl();
    const payload: CheckRiskRequest = {
      text: sanitizePii(text).sanitisedText,
      chips,
      language: 'ar',
    };

    const response = await fetchWithTimeout(
      `${baseUrl}/api/check-risk`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      RISK_TIMEOUT_MS
    );

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
 * Generates drafts for the user.
 *
 * Sends only identifier-free text to /api/generate-drafts, which runs the
 * Guardian risk check before any drafting. If the server flags risk, the result
 * has riskDetected: true and no drafts. Any network error or timeout falls back
 * to safety/plain-templates.json (usedFallbackTemplate: true), so no unchecked
 * text ever reaches a model from this path.
 */
export async function generateDrafts(
  request: GenerateDraftsRequest
): Promise<GenerateDraftsResponse> {
  const fallback = getOfflineDrafts(request.chips, request.recipient, request.text);

  try {
    const baseUrl = getApiBaseUrl();
    // Scrub identifiers before sending over the network
    const pii = sanitizePii(request.text);

    const payload: GenerateDraftsRequest = {
      text: pii.sanitisedText,
      chips: request.chips,
      recipient: request.recipient,
      language: 'ar',
    };

    const response = await fetchWithTimeout(
      `${baseUrl}/api/generate-drafts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      DRAFTS_TIMEOUT_MS
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.riskDetected === true) {
        return {
          sanitisedText: pii.sanitisedText,
          identifiersRemoved: pii.identifiersRemoved,
          drafts: [],
          outputCheckPassed: true,
          usedFallbackTemplate: false,
          riskDetected: true,
          riskMethod: data.riskMethod ?? 'model',
        };
      }
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
 * The user's text is sent identifier-free, the same text the drafts were made from.
 */
export async function checkFaithfulness(
  originalText: string,
  draft: string
): Promise<FaithfulnessResponse> {
  if (!originalText || !originalText.trim()) {
    return { alignments: [] };
  }

  const sanitisedOriginal = sanitizePii(originalText).sanitisedText;

  try {
    const baseUrl = getApiBaseUrl();
    const payload: FaithfulnessRequest = { originalText: sanitisedOriginal, draft };

    const response = await fetchWithTimeout(
      `${baseUrl}/api/faithfulness`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      FAITHFULNESS_TIMEOUT_MS
    );

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
  const words = sanitisedOriginal
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && draft.includes(w));

  const heuristicAlignments: Alignment[] = words.map((w) => ({
    draftPhrase: w,
    inputPhrase: w,
  }));

  return { alignments: heuristicAlignments };
}
