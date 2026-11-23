import AsyncStorage from '@react-native-async-storage/async-storage';

import { HABIT_CATEGORIES, HABIT_FREQUENCIES } from './habitSchema';
import {
  toDateKey,
  type CreateHabitInput,
  type Habit,
  type HabitCategory,
  type HabitFrequency,
} from './types';

const HABITS_STORAGE_KEY = 'pulsetrack.habits.v1';

function buildSeedHabits(): Habit[] {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 86_400_000);
  const yesterdayKey = toDateKey(yesterday);
  const twoDaysAgoKey = toDateKey(twoDaysAgo);

  return [
    {
      id: 'habit-deep-work',
      title: 'Deep Work Focus Sprint',
      notes: 'Silence notifications and ship one high-leverage engineering task.',
      category: 'focus',
      frequency: 'weekdays',
      targetMinutes: 45,
      completedDates: [twoDaysAgoKey, yesterdayKey],
      createdAt: twoDaysAgo.toISOString(),
      archived: false,
    },
    {
      id: 'habit-rn-reading',
      title: 'React Native Docs Study',
      notes: 'Read one architecture or performance guide and jot down takeaways.',
      category: 'learning',
      frequency: 'daily',
      targetMinutes: 25,
      completedDates: [yesterdayKey],
      createdAt: twoDaysAgo.toISOString(),
      archived: false,
    },
    {
      id: 'habit-mobility',
      title: 'Midday Walk & Stretch',
      notes: 'Step away from screens for posture reset and sunlight.',
      category: 'health',
      frequency: 'daily',
      targetMinutes: 20,
      completedDates: [twoDaysAgoKey, yesterdayKey],
      createdAt: twoDaysAgo.toISOString(),
      archived: false,
    },
  ];
}

export const DEFAULT_HABITS: readonly Habit[] = buildSeedHabits();

function isHabitCategory(value: unknown): value is HabitCategory {
  return typeof value === 'string' && (HABIT_CATEGORIES as readonly string[]).includes(value);
}

function isHabitFrequency(value: unknown): value is HabitFrequency {
  return typeof value === 'string' && (HABIT_FREQUENCIES as readonly string[]).includes(value);
}

function isHabit(value: unknown): value is Habit {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.notes === 'string' &&
    isHabitCategory(candidate.category) &&
    isHabitFrequency(candidate.frequency) &&
    typeof candidate.targetMinutes === 'number' &&
    Number.isFinite(candidate.targetMinutes) &&
    Array.isArray(candidate.completedDates) &&
    candidate.completedDates.every((item) => typeof item === 'string') &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.archived === 'boolean'
  );
}

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
  if (!raw) {
    const seeded = buildSeedHabits();
    await saveHabits(seeded);
    return seeded;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isHabit)) {
      return parsed;
    }
  } catch {
    // Fall through to self-healing seed recovery if storage was corrupted.
  }

  const fallback = buildSeedHabits();
  await saveHabits(fallback);
  return fallback;
}

export async function saveHabits(habits: readonly Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

export async function resetHabits(): Promise<Habit[]> {
  const seeded = buildSeedHabits();
  await saveHabits(seeded);
  return seeded;
}

export function createHabitRecord(input: CreateHabitInput, now: Date = new Date()): Habit {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    id: `habit-${now.getTime().toString(36)}-${suffix}`,
    title: input.title.trim(),
    notes: input.notes.trim(),
    category: input.category,
    frequency: input.frequency,
    targetMinutes: input.targetMinutes,
    completedDates: [],
    createdAt: now.toISOString(),
    archived: false,
  };
}
