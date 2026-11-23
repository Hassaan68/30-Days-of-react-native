export type HabitCategory = 'focus' | 'health' | 'learning' | 'mindfulness';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly';

export type HabitFilter = 'all' | 'pending' | 'completed';

export interface Habit {
  id: string;
  title: string;
  notes: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetMinutes: number;
  /** Unique, ascending ISO date keys (YYYY-MM-DD) when the habit was completed. */
  completedDates: string[];
  createdAt: string;
  archived: boolean;
}

export interface CreateHabitInput {
  title: string;
  notes: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetMinutes: number;
}

export interface DashboardSummary {
  totalHabits: number;
  completedToday: number;
  /** Integer percentage from 0 to 100. */
  completionRate: number;
  totalFocusMinutesToday: number;
  bestStreak: number;
}

/**
 * Formats a Date into a YYYY-MM-DD calendar key using local calendar components.
 */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
