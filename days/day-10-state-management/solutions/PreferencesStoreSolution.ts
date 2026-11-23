import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontScale = 'small' | 'medium' | 'large';

export interface PreferencesData {
  themeMode: ThemeMode;
  fontScale: FontScale;
  notificationsEnabled: boolean;
  dailyReminderHour: number;
}

export interface PreferencesState extends PreferencesData {
  hasHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setFontScale: (scale: FontScale) => void;
  toggleNotifications: () => void;
  setDailyReminderHour: (hour: number) => void;
  setHasHydrated: (hydrated: boolean) => void;
  resetPreferences: () => void;
}

export const DEFAULT_PREFERENCES: PreferencesData = {
  themeMode: 'system',
  fontScale: 'medium',
  notificationsEnabled: true,
  dailyReminderHour: 9,
};

function clampHour(hour: number): number {
  const rounded = Math.round(hour);
  return Math.min(23, Math.max(0, rounded));
}

/**
 * Complete solution for Day 10:
 * Persisted Zustand v5 preferences store backed by AsyncStorage with
 * explicit hydration tracking, partial serialization, and shallow selectors.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      hasHydrated: false,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setFontScale: (scale) => set({ fontScale: scale }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      setDailyReminderHour: (hour) => set({ dailyReminderHour: clampHour(hour) }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      resetPreferences: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: 'thirtydays-user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PreferencesData => ({
        themeMode: state.themeMode,
        fontScale: state.fontScale,
        notificationsEnabled: state.notificationsEnabled,
        dailyReminderHour: state.dailyReminderHour,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Subscribes only to display-related preferences using shallow equality
 * so toggling notifications does not re-render typography or theme components.
 */
export function useDisplayPreferences() {
  return usePreferencesStore(
    useShallow((state) => ({
      themeMode: state.themeMode,
      fontScale: state.fontScale,
      hasHydrated: state.hasHydrated,
    })),
  );
}
