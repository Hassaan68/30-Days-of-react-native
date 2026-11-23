import { create } from 'zustand';

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

/**
 * Exercise:
 * 1. (Beginner) Complete the actions below (clamping `dailyReminderHour` between 0 and 23).
 * 2. (Intermediate) Wrap with Zustand's `persist` + `createJSONStorage(() => AsyncStorage)`
 *    including `partialize` and `onRehydrateStorage`.
 * 3. (Challenge) Implement `resetPreferences` and the `useDisplayPreferences` hook with `useShallow`.
 */
export const usePreferencesStore = create<PreferencesState>()((set) => ({
  ...DEFAULT_PREFERENCES,
  hasHydrated: false,

  setThemeMode: (mode) => {
    // TODO (Beginner): Update `themeMode`
    set({ themeMode: mode });
  },

  setFontScale: (_scale) => {
    // TODO (Beginner): Update `fontScale`
  },

  toggleNotifications: () => {
    // TODO (Beginner): Flip `notificationsEnabled`
  },

  setDailyReminderHour: (_hour) => {
    // TODO (Beginner): Clamp `hour` between 0 and 23 (rounded to integer) and save it
  },

  setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

  resetPreferences: () => {
    // TODO (Challenge): Restore `DEFAULT_PREFERENCES` without resetting `hasHydrated`
  },
}));

/**
 * TODO (Challenge):
 * Return `{ themeMode, fontScale, hasHydrated }` using `useShallow` from `zustand/react/shallow`.
 */
export function useDisplayPreferences(): {
  themeMode: ThemeMode;
  fontScale: FontScale;
  hasHydrated: boolean;
} {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const fontScale = usePreferencesStore((state) => state.fontScale);
  const hasHydrated = usePreferencesStore((state) => state.hasHydrated);
  return { themeMode, fontScale, hasHydrated };
}
