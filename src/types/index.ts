/**
 * Core TypeScript definitions for the Jisr mobile application.
 * Defines shared interfaces for chips, recipients, tones, drafts,
 * risk screening, emergency support, and on-device storage.
 */

export type Chip =
  | 'exams'
  | 'family'
  | 'work'
  | 'relationships'
  | 'sleep'
  | 'money'
  | 'other';

export type Recipient =
  | 'friend'
  | 'sibling'
  | 'parent'
  | 'trusted_adult'
  | 'counsellor';

export type Tone = 'gentle' | 'direct' | 'formal';

export type RiskMethod = 'none' | 'phrase' | 'model' | 'both';

export type PlaceholderType = '[name]' | '[phone]' | '[email]';

export interface Draft {
  tone: Tone;
  text: string;
}

export interface RiskResult {
  riskDetected: boolean;
  method: RiskMethod;
  matches?: Array<{
    text: string;
    category: string;
  }>;
}

export interface SupportContact {
  name: string;
  number: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedOn?: string;
  method?: string;
}

export interface SupportCardData {
  version: string;
  title_ar: string;
  message_ar: string;
  contacts: SupportContact[];
  fallbackMessage_ar: string;
  continue_ar: string;
  pending_contacts?: Array<{
    name_ar: string;
    contact_info: string;
    status: string;
    note: string;
  }>;
}

/** One remembered chip selection. Chips only: no text, recipient or sharing data. */
export interface HistoryItem {
  id: string;
  chip: Chip;
  timestamp: number;
}

/** Where the drafts on screen came from, so the UI never calls a template "AI". */
export type DraftSource = 'ai' | 'template';

export interface IdentifierRemoved {
  original: string;
  placeholder: PlaceholderType;
}

export interface Alignment {
  draftPhrase: string;
  inputPhrase: string;
}

export interface CheckRiskRequest {
  text: string;
  chips?: Chip[];
  language?: 'ar';
}

export interface CheckRiskResponse {
  riskDetected: boolean;
  method: RiskMethod;
}

export interface GenerateDraftsRequest {
  text: string;
  chips: Chip[];
  recipient: Recipient;
  language?: 'ar';
}

export interface GenerateDraftsResponse {
  sanitisedText: string;
  identifiersRemoved: IdentifierRemoved[];
  drafts: Draft[];
  outputCheckPassed: boolean;
  usedFallbackTemplate: boolean;
  /** The server's Guardian gate flagged the text; drafts is empty. */
  riskDetected?: boolean;
  riskMethod?: RiskMethod;
}

export interface FaithfulnessRequest {
  originalText: string;
  draft: string;
}

export interface FaithfulnessResponse {
  alignments: Alignment[];
}
