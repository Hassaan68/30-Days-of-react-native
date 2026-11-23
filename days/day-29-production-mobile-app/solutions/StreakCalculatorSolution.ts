/**
 * Day 29 Solution: PulseTrack Streak & Duration Helpers
 */

import { parseCalendarDateToUtcDay } from '../examples/habitStats';

export function formatFocusDuration(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  if (safeMinutes === 0) {
    return '0m';
  }

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function getCompletionRatePercent(
  completedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0 || completedCount <= 0) {
    return 0;
  }

  const ratio = Math.min(1, completedCount / totalCount);
  return Math.round(ratio * 100);
}

export function calculateGraceStreak(
  completedDates: readonly string[],
  todayDateKey: string,
): number {
  const todayDay = parseCalendarDateToUtcDay(todayDateKey);
  if (todayDay === null) {
    return 0;
  }

  const completedDaySet = new Set<number>();
  for (const dateKey of completedDates) {
    const day = parseCalendarDateToUtcDay(dateKey);
    if (day !== null) {
      completedDaySet.add(day);
    }
  }

  let cursor = completedDaySet.has(todayDay)
    ? todayDay
    : completedDaySet.has(todayDay - 1)
      ? todayDay - 1
      : null;

  if (cursor === null) {
    return 0;
  }

  let streak = 0;
  while (completedDaySet.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}
