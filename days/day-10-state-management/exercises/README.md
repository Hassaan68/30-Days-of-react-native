# Day 10 Exercises: State Management

Practice building a persisted, strictly typed **Zustand v5** store backed by `@react-native-async-storage/async-storage`.

## Starter File

Open [PreferencesStoreExercise.ts](./PreferencesStoreExercise.ts) and complete all `TODO` items.

## Tasks

1. **Beginner — Implement Preference Actions**:
   - Complete the Zustand actions `setThemeMode`, `setFontScale`, `toggleNotifications`, and `setDailyReminderHour`.
   - Clamp `dailyReminderHour` to valid 24-hour clock bounds (`0` through `23`).

2. **Intermediate — Persist State with AsyncStorage**:
   - Wrap the store creator with Zustand's `persist` middleware and `createJSONStorage(() => AsyncStorage)`.
   - Use storage key `'thirtydays-user-preferences'`.
   - Configure `partialize` so only preference data (`themeMode`, `fontScale`, `notificationsEnabled`, `dailyReminderHour`) is saved—never `hasHydrated` or action functions.
   - Implement `onRehydrateStorage` to call `state?.setHasHydrated(true)` once AsyncStorage finishes hydrating.

3. **Challenge — Shallow Selector Hook & Reset Action**:
   - Implement `resetPreferences()` to restore all preference values back to `DEFAULT_PREFERENCES` without resetting `hasHydrated`.
   - Implement `useDisplayPreferences()` using `useShallow` from `'zustand/react/shallow'` to return `{ themeMode, fontScale, hasHydrated }` without unnecessary re-renders when notification settings change.

## Checking Your Work

Compare your completed store with [PreferencesStoreSolution.ts](../solutions/PreferencesStoreSolution.ts) and run:

```bash
npm run typecheck
npm run lint
```
