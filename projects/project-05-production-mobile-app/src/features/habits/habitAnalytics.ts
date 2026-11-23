import type { DashboardSummary, Habit, HabitFilter } from './types';

const MS_PER_DAY = 86_400_000;

function parseDateKeyUtc(dateKey: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return Date.UTC(year, month - 1, day);
}

function formatUtcTimestampToDateKey(utcMs: number): string {
  const date = new Date(utcMs);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, deltaDays: number): string | null {
  const utcMs = parseDateKeyUtc(dateKey);
  if (utcMs === null) {
    return null;
  }
  return formatUtcTimestampToDateKey(utcMs + deltaDays * MS_PER_DAY);
}

export function isCompletedOnDate(habit: Habit, dateKey: string): boolean {
  return habit.completedDates.includes(dateKey);
}

/**
 * Toggles a completion date key and returns a new deduplicated, ascending array.
 */
export function toggleHabitDate(completedDates: readonly string[], dateKey: string): string[] {
  const nextSet = new Set(completedDates);
  if (nextSet.has(dateKey)) {
    nextSet.delete(dateKey);
  } else {
    nextSet.add(dateKey);
  }
  return Array.from(nextSet).sort();
}

/**
 * Calculates the active streak ending on referenceDateKey.
 * If the habit has not yet been completed on referenceDateKey, checks whether
 * the streak is still alive through the previous day.
 */
export function calculateCurrentStreak(
  completedDates: readonly string[],
  referenceDateKey: string,
): number {
  if (completedDates.length === 0) {
    return 0;
  }

  const completedSet = new Set(completedDates);
  let cursor: string | null = referenceDateKey;

  if (!completedSet.has(referenceDateKey)) {
    const yesterday = shiftDateKey(referenceDateKey, -1);
    if (!yesterday || !completedSet.has(yesterday)) {
      return 0;
    }
    cursor = yesterday;
  }

  let streak = 0;
  while (cursor && completedSet.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

/**
 * Calculates the longest consecutive daily completion streak across all recorded dates.
 */
export function calculateLongestStreak(completedDates: readonly string[]): number {
  const uniqueTimestamps = Array.from(
    new Set(
      completedDates
        .map((dateKey) => parseDateKeyUtc(dateKey))
        .filter((value): value is number => value !== null),
    ),
  ).sort((a, b) => a - b);

  if (uniqueTimestamps.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueTimestamps.length; index += 1) {
    const previous = uniqueTimestamps[index - 1];
    const currentDay = uniqueTimestamps[index];
    if (previous !== undefined && currentDay !== undefined && currentDay - previous === MS_PER_DAY) {
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

export function computeDashboardSummary(
  habits: readonly Habit[],
  todayKey: string,
): DashboardSummary {
  const activeHabits = habits.filter((habit) => !habit.archived);
  const totalHabits = activeHabits.length;

  let completedToday = 0;
  let totalFocusMinutesToday = 0;
  let bestStreak = 0;

  for (const habit of activeHabits) {
    if (isCompletedOnDate(habit, todayKey)) {
      completedToday += 1;
      totalFocusMinutesToday += habit.targetMinutes;
    }
    const currentStreak = calculateCurrentStreak(habit.completedDates, todayKey);
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  }

  const completionRate =
    totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  return {
    totalHabits,
    completedToday,
    completionRate,
    totalFocusMinutesToday,
    bestStreak,
  };
}

export function filterHabits(
  habits: readonly Habit[],
  filter: HabitFilter,
  todayKey: string,
  searchQuery: string = '',
): Habit[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return habits.filter((habit) => {
    if (habit.archived) {
      return false;
    }

    const doneToday = isCompletedOnDate(habit, todayKey);
    if (filter === 'completed' && !doneToday) {
      return false;
    }
    if (filter === 'pending' && doneToday) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const searchable = `${habit.title} ${habit.notes} ${habit.category}`.toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}
