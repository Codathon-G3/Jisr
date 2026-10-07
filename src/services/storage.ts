/**
 * Sandboxed On-Device Storage Service (Privacy & Pattern Tracking)
 *
 * Provides completely local, sandboxed tracking of chip selections using
 * AsyncStorage. Zero network telemetry. Used for:
 * 1. Detecting pattern recurrence (>=3 taps on the same stress chip)
 *    to trigger gentle check-ins.
 * 2. Instant one-tap history wipe.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chip, HistoryItem, Recipient } from '../types';

const HISTORY_KEY = '@jisr_chip_history';
const SETTINGS_KEY = '@jisr_history_enabled';

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
 * Checks whether on-device history tracking is currently enabled.
 * Defaults to true for local recurrence detection unless disabled by user.
 */
export async function isHistoryEnabled(): Promise<boolean> {
  try {
    const raw = await getStoredValue(SETTINGS_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggles on-device history tracking.
 */
export async function setHistoryEnabled(enabled: boolean): Promise<void> {
  await setStoredValue(SETTINGS_KEY, String(enabled));
}

/**
 * Retrieves the full list of locally recorded chip selections.
 */
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await getStoredValue(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * Records a chip selection to local device storage if history is enabled.
 */
export async function recordChipSelection(
  chip: Chip,
  recipient?: Recipient
): Promise<HistoryItem | null> {
  const enabled = await isHistoryEnabled();
  if (!enabled) return null;

  const newItem: HistoryItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    chip,
    recipient,
    timestamp: Date.now(),
  };

  const history = await getHistory();
  history.push(newItem);

  // Keep last 100 entries to prevent unbounded growth
  const trimmed = history.slice(-100);
  await setStoredValue(HISTORY_KEY, JSON.stringify(trimmed));

  return newItem;
}

/**
 * Counts how many times a given chip has been selected in local history.
 */
export async function getChipCount(chip: Chip): Promise<number> {
  const history = await getHistory();
  return history.filter((item) => item.chip === chip).length;
}

/**
 * Checks if a chip meets the recurrence threshold (default: >= 3 selections).
 */
export async function checkChipRecurrence(
  chip: Chip,
  threshold = 3
): Promise<boolean> {
  const count = await getChipCount(chip);
  return count >= threshold;
}

/**
 * One-tap history wipe. Irreversibly deletes all stored history records
 * from both AsyncStorage and in-memory cache with zero network traces.
 */
export async function clearHistory(): Promise<void> {
  await removeStoredValue(HISTORY_KEY);
}
