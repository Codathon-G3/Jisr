/**
 * Pure rules for the private on-device record (product definition §8.2).
 * Kept free of React Native imports so tests/test-history-logic.mjs can run them.
 */

import type { Chip, HistoryItem } from '../types';

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Retention windows the user can pick; 7 days is the default (plan Q9). */
export const RETENTION_OPTIONS = [1, 7, 30] as const;
export type RetentionDays = (typeof RETENTION_OPTIONS)[number];
export const DEFAULT_RETENTION_DAYS: RetentionDays = 7;

/** Same chip this many times inside the window shows the pattern invitation (plan Q8). */
export const RECURRENCE_THRESHOLD = 3;

export function parseRetentionDays(raw: string | null): RetentionDays {
  const value = Number(raw);
  return (RETENTION_OPTIONS as readonly number[]).includes(value)
    ? (value as RetentionDays)
    : DEFAULT_RETENTION_DAYS;
}

/** Drops entries older than the retention window, and anything malformed. */
export function pruneExpired(items: unknown, now: number, retentionDays: number): HistoryItem[] {
  if (!Array.isArray(items)) return [];
  const cutoff = now - retentionDays * DAY_MS;
  return (items as any[])
    .filter(
      (item: any): item is HistoryItem =>
        Boolean(item) &&
        typeof item.chip === 'string' &&
        typeof item.timestamp === 'number' &&
        item.timestamp > cutoff &&
        item.timestamp <= now
    )
    // Keep chips and time only, even for entries saved by older versions.
    .map(({ id, chip, timestamp }) => ({ id, chip, timestamp }));
}

/** Counts per chip, for the "what is remembered" view. */
export function countByChip(items: HistoryItem[]): Partial<Record<Chip, number>> {
  const counts: Partial<Record<Chip, number>> = {};
  for (const item of items) {
    counts[item.chip] = (counts[item.chip] ?? 0) + 1;
  }
  return counts;
}

export function isRecurring(
  items: HistoryItem[],
  chip: Chip,
  threshold: number = RECURRENCE_THRESHOLD
): boolean {
  return items.filter((item) => item.chip === chip).length >= threshold;
}
