# Day 10 Exercises: State Management

Practice building a persisted, strictly typed **Zustand v5** store backed by `@react-native-async-storage/async-storage`.

## How to Practise

1. Open the starter file [`./PreferencesStoreExercise.ts`](./PreferencesStoreExercise.ts) and complete each `// TODO:` step in order.
2. You can test your store inside any screen in the shared Expo workspace (`npm start`) or call `usePreferencesStore.getState()` directly inside a Jest test (`npm test`).
3. Verify strict TypeScript and ESLint after each task:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### Exercise 1 (Beginner): Implement Preference Actions

**Requirements**
1. Complete the four preference update actions inside `usePreferencesStore`:
   - `setThemeMode(mode)`: sets `themeMode`.
   - `setFontScale(scale)`: sets `fontScale`.
   - `toggleNotifications()`: flips `notificationsEnabled` using the functional updater `set((state) => ({ notificationsEnabled: !state.notificationsEnabled }))`.
   - `setDailyReminderHour(hour)`: rounds `hour` to the nearest integer and clamps it to valid 24-hour clock bounds (`0` through `23`).

**Acceptance Criteria**
- [ ] `setThemeMode('dark')` updates `themeMode` to `'dark'`.
- [ ] `setFontScale('large')` updates `fontScale` to `'large'`.
- [ ] Calling `toggleNotifications()` twice toggles `true → false → true`.
- [ ] `setDailyReminderHour(-5)` stores `0`, `setDailyReminderHour(29)` stores `23`, and `setDailyReminderHour(8.6)` stores `9`.

**Expected Behavior**
Every action updates only its target field immutably without altering unrelated preference fields.

<details>
<summary>Hint</summary>

Create a small pure helper above the store:
```ts
function clampHour(hour: number): number {
  return Math.min(23, Math.max(0, Math.round(hour)));
}
```
Then call `set({ dailyReminderHour: clampHour(hour) })` inside `setDailyReminderHour`. Remember to remove the leading `_` from `_scale` and `_hour` once you use them.

</details>

---

### Exercise 2 (Intermediate): Persist State with `AsyncStorage`

**Requirements**
1. Import `AsyncStorage` from `'@react-native-async-storage/async-storage'` and `createJSONStorage, persist` from `'zustand/middleware'`.
2. Wrap the store creator inside `create<PreferencesState>()(persist((set) => ({ ... }), { ... }))`.
3. Configure the persist options:
   - `name: 'thirtydays-user-preferences'`
   - `storage: createJSONStorage(() => AsyncStorage)`
   - `partialize`: return ONLY the four `PreferencesData` fields (`themeMode`, `fontScale`, `notificationsEnabled`, `dailyReminderHour`)—never `hasHydrated` or action functions.
   - `onRehydrateStorage`: return a callback `(state) => { state?.setHasHydrated(true); }` so UI knows when async disk loading completes.

**Acceptance Criteria**
- [ ] Store uses curried `create<PreferencesState>()(persist(...))` with zero `any` types.
- [ ] `storage` uses `createJSONStorage(() => AsyncStorage)` under key `'thirtydays-user-preferences'`.
- [ ] `partialize` excludes `hasHydrated` and all action methods.
- [ ] `onRehydrateStorage` flips `hasHydrated` from `false` to `true` after rehydration finishes.

**Expected Behavior**
When a user changes `themeMode` to `'dark'` and restarts the app, `AsyncStorage` reloads `'dark'` asynchronously and sets `hasHydrated` to `true` once ready.

<details>
<summary>Hint</summary>

Remember that `onRehydrateStorage` is a **factory** function that returns the post-hydration callback:
```ts
onRehydrateStorage: () => (state) => {
  state?.setHasHydrated(true);
},
```
Typing `partialize: (state): PreferencesData => ({ ... })` guarantees TypeScript catches any missing or extra persisted keys.

</details>

---

### Exercise 3 (Challenge): Shallow Selector Hook & Reset Action

**Requirements**
1. Implement `resetPreferences()` to restore all preference values back to `DEFAULT_PREFERENCES` **without** resetting `hasHydrated` back to `false`.
2. Refactor `useDisplayPreferences()` to subscribe via a single `usePreferencesStore(useShallow(...))` call (importing `useShallow` from `'zustand/react/shallow'`) returning `{ themeMode, fontScale, hasHydrated }`.

**Acceptance Criteria**
- [ ] Calling `resetPreferences()` restores `themeMode: 'system'`, `fontScale: 'medium'`, `notificationsEnabled: true`, and `dailyReminderHour: 9` while leaving `hasHydrated` untouched.
- [ ] `useDisplayPreferences()` uses `useShallow` from `'zustand/react/shallow'` so components consuming display preferences do not re-render when `notificationsEnabled` or `dailyReminderHour` changes.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
A typography or theme component using `useDisplayPreferences()` stays completely idle when the user toggles notification reminders on a Settings screen, and tapping **Reset to Defaults** restores default settings while keeping `hasHydrated === true`.

<details>
<summary>Hint</summary>

Because Zustand's `set(...)` shallow-merges top-level keys by default, `resetPreferences: () => set({ ...DEFAULT_PREFERENCES })` resets the four `PreferencesData` fields without touching `hasHydrated`. For the selector hook:
```ts
export function useDisplayPreferences() {
  return usePreferencesStore(
    useShallow((state) => ({
      themeMode: state.themeMode,
      fontScale: state.fontScale,
      hasHydrated: state.hasHydrated,
    })),
  );
}
```

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to open the reference solution link</summary>

Once you have completed all three exercises and verified `npm run typecheck` and `npm run lint`, compare your store with [`../solutions/PreferencesStoreSolution.ts`](../solutions/PreferencesStoreSolution.ts).

</details>
