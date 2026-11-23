import { create } from 'zustand';

import { toggleHabitDate } from './habitAnalytics';
import { createHabitRecord, loadHabits, saveHabits } from './habitRepository';
import { toDateKey, type CreateHabitInput, type Habit, type HabitFilter } from './types';

export interface HabitStoreState {
  habits: Habit[];
  filter: HabitFilter;
  searchQuery: string;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<Habit>;
  toggleHabitCompletion: (habitId: string, dateKey?: string) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  setFilter: (filter: HabitFilter) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  habits: [],
  filter: 'all',
  searchQuery: '',
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const loaded = await loadHabits();
      set({ habits: loaded, isHydrated: true, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        isHydrated: true,
        error: err instanceof Error ? err.message : 'Could not load saved habits.',
      });
    }
  },

  addHabit: async (input) => {
    const previous = get().habits;
    const created = createHabitRecord(input);
    const updated = [created, ...previous];

    set({ habits: updated, error: null });
    try {
      await saveHabits(updated);
      return created;
    } catch (err: unknown) {
      set({
        habits: previous,
        error: err instanceof Error ? err.message : 'Failed to save new habit.',
      });
      throw err;
    }
  },

  toggleHabitCompletion: async (habitId, dateKey = toDateKey()) => {
    const previous = get().habits;
    const updated = previous.map((habit) =>
      habit.id === habitId
        ? { ...habit, completedDates: toggleHabitDate(habit.completedDates, dateKey) }
        : habit,
    );

    // Optimistic state update with rollback if local persistence fails.
    set({ habits: updated, error: null });
    try {
      await saveHabits(updated);
    } catch (err: unknown) {
      set({
        habits: previous,
        error: err instanceof Error ? err.message : 'Could not persist habit update.',
      });
    }
  },

  archiveHabit: async (habitId) => {
    const previous = get().habits;
    const updated = previous.map((habit) =>
      habit.id === habitId ? { ...habit, archived: true } : habit,
    );

    set({ habits: updated, error: null });
    try {
      await saveHabits(updated);
    } catch (err: unknown) {
      set({
        habits: previous,
        error: err instanceof Error ? err.message : 'Could not archive habit.',
      });
    }
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearError: () => set({ error: null }),
}));
