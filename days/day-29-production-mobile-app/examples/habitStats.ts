/**
 * Day 29 Example: PulseTrack Habit & Focus Tracker Domain Statistics
 *
 * Pure, deterministic domain functions that compute streaks, completion rates,
 * and focus-time summaries without timezone flakiness.
 */

export type HabitCategory = 'health' | 'learning' | 'focus' | 'mindfulness';

export interface HabitItem {
  readonly id: string;
  readonly title: string;
  readonly category: HabitCategory;
  readonly targetMinutesPerDay: number;
  readonly completedDates: readonly string[]; // ISO calendar dates: YYYY-MM-DD
}

export interface FocusSession {
  readonly id: string;
  readonly habitId: string;
  readonly durationMinutes: number;
  readonly completedAtIso: string;
}

export interface DailyHabitSummary {
  readonly totalHabits: number;
  readonly completedToday: number;
  readonly completionRatePercent: number;
  readonly totalFocusMinutes: number;
  readonly longestActiveStreak: number;
}

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

/**
 * Converts a YYYY-MM-DD date string into a UTC day index to avoid local timezone
 * and Daylight Saving Time (DST) off-by-one bugs.
 */
export function parseCalendarDateToUtcDay(dateKey: string): number | null {
  const match = ISO_DATE_REGEX.exec(dateKey.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const checkDate = new Date(timestamp);

  // Reject rollover dates such as 2026-02-31.
  if (
    checkDate.getUTCFullYear() !== year ||
    checkDate.getUTCMonth() !== month - 1 ||
    checkDate.getUTCDate() !== day
  ) {
    return null;
  }

  return Math.floor(timestamp / MS_PER_DAY);
}

/**
 * Counts consecutive completed calendar days ending on `referenceDateKey`.
 * Returns 0 if `referenceDateKey` itself is not completed or invalid.
 */
export function calculateCurrentStreak(
  completedDates: readonly string[],
  referenceDateKey: string,
): number {
  const referenceDay = parseCalendarDateToUtcDay(referenceDateKey);
  if (referenceDay === null) {
    return 0;
  }

  const completedDaySet = new Set<number>();
  for (const dateKey of completedDates) {
    const day = parseCalendarDateToUtcDay(dateKey);
    if (day !== null) {
      completedDaySet.add(day);
    }
  }

  let streak = 0;
  let cursor = referenceDay;

  while (completedDaySet.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}

/**
 * Computes the longest consecutive run of completed days in a habit's full history.
 */
export function calculateLongestStreak(completedDates: readonly string[]): number {
  const uniqueDays = new Set<number>();
  for (const dateKey of completedDates) {
    const day = parseCalendarDateToUtcDay(dateKey);
    if (day !== null) {
      uniqueDays.add(day);
    }
  }

  if (uniqueDays.size === 0) {
    return 0;
  }

  const sortedDays = Array.from(uniqueDays).sort((a, b) => a - b);
  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedDays.length; index += 1) {
    const prevDay = sortedDays[index - 1];
    const currDay = sortedDays[index];
    if (prevDay !== undefined && currDay !== undefined && currDay === prevDay + 1) {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Aggregates today's completion metrics and focus minutes across all habits.
 */
export function calculateDailySummary(
  habits: readonly HabitItem[],
  sessions: readonly FocusSession[],
  todayDateKey: string,
): DailyHabitSummary {
  const totalHabits = habits.length;
  let completedToday = 0;
  let longestActiveStreak = 0;

  for (const habit of habits) {
    if (habit.completedDates.includes(todayDateKey)) {
      completedToday += 1;
    }

    const streak = calculateCurrentStreak(habit.completedDates, todayDateKey);
    if (streak > longestActiveStreak) {
      longestActiveStreak = streak;
    }
  }

  const totalFocusMinutes = sessions.reduce(
    (sum, session) => sum + Math.max(0, session.durationMinutes),
    0,
  );

  const completionRatePercent =
    totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  return {
    totalHabits,
    completedToday,
    completionRatePercent,
    totalFocusMinutes,
    longestActiveStreak,
  };
}

/**
 * Groups total focus minutes by HabitCategory.
 */
export function groupFocusMinutesByCategory(
  habits: readonly HabitItem[],
  sessions: readonly FocusSession[],
): Record<HabitCategory, number> {
  const totals: Record<HabitCategory, number> = {
    health: 0,
    learning: 0,
    focus: 0,
    mindfulness: 0,
  };

  const categoryByHabitId = new Map<string, HabitCategory>();
  for (const habit of habits) {
    categoryByHabitId.set(habit.id, habit.category);
  }

  for (const session of sessions) {
    const category = categoryByHabitId.get(session.habitId);
    if (category) {
      totals[category] += Math.max(0, session.durationMinutes);
    }
  }

  return totals;
}
