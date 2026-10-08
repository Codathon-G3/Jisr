/**
 * Private On-Device Record (product definition §8, requirement R5)
 *
 * - Off by default: nothing is remembered until the user turns it on.
 * - Chips and time only: no free text, drafts, recipient or sharing data.
 * - Time-limited: entries expire after the window the user picks (1, 7 or 30 days).
 * - Visible and deletable: the capture screen shows the counts and erases all in one tap;
 *   turning the record off also erases it.
 * - Never transmitted, and excluded from Android backup (app.json allowBackup: false).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chip, HistoryItem } from '../types';
import {
  RetentionDays,
  countByChip,
  isRecurring,
  parseRetentionDays,
  pruneExpired,
} from './historyLogic';

const HISTORY_KEY = '@jisr_chip_history';
const SETTINGS_KEY = '@jisr_history_enabled';
const RETENTION_KEY = '@jisr_history_retention_days';

// In-memory fallback if AsyncStorage is unavailable or throws
const memoryStore = new Map<string, string>();

async function getStoredValue(key: string): Promise<string | null> {
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // fallback to memory
  }
  return memoryStore.get(key) ?? null;
}

async function setStoredValue(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    // Memory store is already updated
  }
}

async function removeStoredValue(key: string): Promise<void> {
  memoryStore.delete(key);
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // Memory store is already updated
  }
}

/**
 * Whether the private record is on. Off unless the user has turned it on.
 */
export async function isHistoryEnabled(): Promise<boolean> {
  return (await getStoredValue(SETTINGS_KEY)) === 'true';
}

/**
 * Turns the private record on or off. Turning it off erases what was stored.
 */
export async function setHistoryEnabled(enabled: boolean): Promise<void> {
  await setStoredValue(SETTINGS_KEY, String(enabled));
  if (!enabled) {
    await clearHistory();
  }
}

export async function getRetentionDays(): Promise<RetentionDays> {
  return parseRetentionDays(await getStoredValue(RETENTION_KEY));
}

/**
 * Changes how long entries are kept; entries outside the new window are erased now.
 */
export async function setRetentionDays(days: RetentionDays): Promise<void> {
  await setStoredValue(RETENTION_KEY, String(days));
  await getHistory();
}

/**
 * Returns the remembered chip selections inside the retention window, and erases
 * anything older from the device.
 */
export async function getHistory(): Promise<HistoryItem[]> {
  let raw: unknown = [];
  try {
    const stored = await getStoredValue(HISTORY_KEY);
    raw = stored ? JSON.parse(stored) : [];
  } catch {
    raw = [];
  }
  const kept = pruneExpired(raw, Date.now(), await getRetentionDays());
  if (Array.isArray(raw) && kept.length !== raw.length) {
    await setStoredValue(HISTORY_KEY, JSON.stringify(kept));
  }
  return kept;
}

/**
 * Remembers the chips of one writing session, if the user turned the record on.
 */
export async function recordChipSelections(chips: Chip[]): Promise<void> {
  if (chips.length === 0 || !(await isHistoryEnabled())) return;

  const now = Date.now();
  const history = await getHistory();
  for (const chip of chips) {
    history.push({
      id: `${now}_${Math.random().toString(36).substring(2, 7)}`,
      chip,
      timestamp: now,
    });
  }
  // Keep the last 100 entries to prevent unbounded growth
  await setStoredValue(HISTORY_KEY, JSON.stringify(history.slice(-100)));
}

/**
 * How many times each chip is remembered, for the capture screen's record view.
 */
export async function getHistorySummary(): Promise<Partial<Record<Chip, number>>> {
  return countByChip(await getHistory());
}

/**
 * Whether a chip came up often enough inside the window to offer the pattern invitation.
 */
export async function checkChipRecurrence(chip: Chip): Promise<boolean> {
  if (!(await isHistoryEnabled())) return false;
  return isRecurring(await getHistory(), chip);
}

/**
 * One-tap wipe of every stored entry.
 */
export async function clearHistory(): Promise<void> {
  await removeStoredValue(HISTORY_KEY);
}
