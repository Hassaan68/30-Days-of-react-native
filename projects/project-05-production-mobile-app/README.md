# Project 05: PulseTrack — Production-Style Habit & Focus Tracker

> **Curriculum Alignment:** [Day 29: Production Mobile App Capstone](../../days/day-29-production-mobile-app/README.md)

## Project Overview

**PulseTrack** is the capstone project of the *30 Days of React Native* curriculum. It brings together clean feature-based architecture, offline-first persistence, optimistic state updates, validated mobile forms, resilient error boundaries, accessibility-first UI components, and automated unit + component tests into a realistic habit and focus tracker.

Rather than mixing business logic, storage calls, and presentation inside giant screen files, PulseTrack cleanly separates domain types, validation schemas, pure analytics, storage repositories, Zustand state management, reusable components, and screen containers.

## Features

- **Daily Focus Dashboard:** Displays completion progress percentage, total focus minutes logged today, best active streak, real-time search, and `All` / `Pending` / `Completed` status filters.
- **Offline-First Habit Persistence:** Loads and persists habits locally with `@react-native-async-storage/async-storage`, including runtime JSON validation and self-healing seed recovery.
- **Optimistic Updates with Rollback:** Toggling habit completions or archiving habits updates the UI immediately (with haptic feedback via `expo-haptics`) and rolls back cleanly if persistence fails.
- **Pure Streak & Summary Analytics:** Timezone-safe UTC calendar-day math calculates current streaks (preserving active streaks while today is still in progress), longest streaks across month boundaries, and daily summaries.
- **Validated Habit Creation Flow:** Powered by `react-hook-form` + `zod` v4 with category radio chips, frequency selectors, duration presets, and accessible `-5m` / `+5m` steppers.
- **Resilient Error Boundary:** Catches unexpected rendering errors gracefully and lets users recover with a single tap without force-quitting the app.
- **Automated Test Suite:** Includes pure logic unit tests (`habitAnalytics.test.ts`) and React Native Testing Library component tests (`HabitCard.test.tsx`).

## Technologies

| Area | Technology | Role in PulseTrack |
| --- | --- | --- |
| Core Runtime | Expo SDK ~58.0.0 & React Native 0.88.0 | New Architecture & Strict TypeScript API |
| Navigation | Expo Router ~58.0.0 | File-based tabs & modal routes (`app/(tabs)`, `app/create`) |
| Language | TypeScript ~5.8.3 (`strict`, `noUncheckedIndexedAccess`) | Compile-time domain & UI guarantees |
| Client State | Zustand 5.x | Minimal, selector-driven habit store with optimistic updates |
| Server Sync Layer | TanStack Query 5.x (`@tanstack/react-query`) | Ready for remote cloud sync, caching, and background refetching |
| Forms & Validation | `react-hook-form` 7.x, `zod` 4.x, `@hookform/resolvers` | Strict form validation with matching input/output types |
| Local & Secure Storage | `@react-native-async-storage/async-storage` & `expo-secure-store` | Non-sensitive offline habits in AsyncStorage; auth tokens/secrets in SecureStore |
| Accessibility | React Native Accessibility API & `react-native-safe-area-context` | Roles, states, live regions, `hitSlop`, and safe area insets |
| Testing | Jest, `jest-expo` ~58.0.0, `@testing-library/react-native` 13.x | Unit & behavioral component tests |

## Architecture Diagram

```text
+-----------------------------------------------------------------------------+
|                         Expo Router App Shell (app/)                        |
|   SafeAreaProvider -> ErrorBoundary -> QueryClientProvider -> Route Screens |
+------------------------------------+----------------------------------------+
                                     |
         +---------------------------+---------------------------+
         v                                                       v
+-------------------------+                           +-------------------------+
|    DashboardScreen      |                           |    CreateHabitScreen    |
|  - Metrics & Filters    |                           |  - React Hook Form      |
|  - Memoized FlatList    |                           |  - Zod v4 Schema        |
|  - HabitCard (memo)     |                           |  - Accessible Steppers  |
+------------+------------+                           +------------+------------+
             |                                                     |
             +---------------------------+-------------------------+
                                         v
                       +-----------------------------------+
                       |  Zustand Store (useHabitStore)    |
                       |  - Optimistic toggle & rollback   |
                       |  - Filter & search state          |
                       +-----------------+-----------------+
                                         |
             +---------------------------+---------------------------+
             v                                                       v
+-----------------------------+                         +-----------------------------+
|  Pure Domain Analytics      |                         |  Repository & Storage Layer |
|  (habitAnalytics.ts)        |                         |  - habitRepository.ts       |
|  - Current & longest streak |                         |  - AsyncStorage (habits)    |
|  - Dashboard summary        |                         |  - SecureStore (auth keys)  |
|  - Filter & search logic    |                         |  - TanStack Query (sync)    |
+-----------------------------+                         +-----------------------------+
```

## Screens

1. **Dashboard Screen (`src/screens/DashboardScreen.tsx`):**
   - Summary KPI cards showing daily completion rate, focus minutes logged today, and longest active streak.
   - Instant search bar and `All` / `Pending` / `Completed` filter tabs.
   - Virtualized `FlatList` rendering memoized `HabitCard` items with pull-to-refresh and haptic feedback.
2. **Create Habit Screen (`src/screens/CreateHabitScreen.tsx`):**
   - Controlled form validated by `createHabitSchema`.
   - Title, optional notes, category selector, frequency selector, and target focus minutes (`5–180` minutes) via preset chips or stepper buttons.

## Folder Structure

```text
projects/project-05-production-mobile-app/
├── README.md
└── src/
    ├── components/
    │   ├── ErrorBoundary.tsx         # Class-based React error boundary with recovery UI
    │   ├── HabitCard.tsx             # Memoized, accessible habit card component
    │   └── HabitCard.test.tsx        # RNTL component tests for HabitCard
    ├── features/
    │   └── habits/
    │       ├── habitAnalytics.ts     # Pure streak, summary, and filtering functions
    │       ├── habitAnalytics.test.ts# Jest unit tests for habit analytics
    │       ├── habitRepository.ts    # AsyncStorage adapter with validation & seed data
    │       ├── habitSchema.ts        # Zod v4 schema and domain constants
    │       ├── types.ts              # Habit, CreateHabitInput, DashboardSummary, toDateKey
    │       └── useHabitStore.ts      # Zustand 5 store with optimistic updates & rollback
    └── screens/
        ├── CreateHabitScreen.tsx     # Validated habit creation form screen
        └── DashboardScreen.tsx       # Main focus tracker dashboard screen
```

Browse the source files directly:

- [src/features/habits/types.ts](./src/features/habits/types.ts)
- [src/features/habits/habitSchema.ts](./src/features/habits/habitSchema.ts)
- [src/features/habits/habitRepository.ts](./src/features/habits/habitRepository.ts)
- [src/features/habits/useHabitStore.ts](./src/features/habits/useHabitStore.ts)
- [src/features/habits/habitAnalytics.ts](./src/features/habits/habitAnalytics.ts)
- [src/features/habits/habitAnalytics.test.ts](./src/features/habits/habitAnalytics.test.ts)
- [src/components/ErrorBoundary.tsx](./src/components/ErrorBoundary.tsx)
- [src/components/HabitCard.tsx](./src/components/HabitCard.tsx)
- [src/components/HabitCard.test.tsx](./src/components/HabitCard.test.tsx)
- [src/screens/DashboardScreen.tsx](./src/screens/DashboardScreen.tsx)
- [src/screens/CreateHabitScreen.tsx](./src/screens/CreateHabitScreen.tsx)

## Implementation Steps

1. **Define Domain Contracts (`src/features/habits/types.ts` & `habitSchema.ts`):**
   Model `Habit`, `CreateHabitInput`, and `DashboardSummary` first, then create `createHabitSchema` so validation rules stay synchronized across forms and storage.
2. **Isolate Pure Business Logic (`src/features/habits/habitAnalytics.ts`):**
   Keep streak computation, filtering, and dashboard aggregation completely pure (accepting `todayKey` explicitly instead of calling `Date.now()` inside calculations) so every edge case is deterministically testable.
3. **Create the Offline-First Repository (`src/features/habits/habitRepository.ts`):**
   Encapsulate `AsyncStorage` calls behind typed functions (`loadHabits`, `saveHabits`, `resetHabits`) with runtime type guards to prevent corrupted storage from crashing startup.
4. **Wire Zustand State (`src/features/habits/useHabitStore.ts`):**
   Use optimistic state transitions for instant tactile feedback, rolling back to the previous snapshot if persistence throws.
5. **Build Accessible UI & Screens (`HabitCard.tsx`, `ErrorBoundary.tsx`, `DashboardScreen.tsx`, `CreateHabitScreen.tsx`):**
   Wrap the app root in `SafeAreaProvider` and `ErrorBoundary`, then connect `DashboardScreen` and `CreateHabitScreen` to Expo Router routes (`app/index.tsx` and `app/create.tsx`).
6. **Add Optional Cloud Sync with TanStack Query:**
   When connecting a backend API, pair `useMutation` / `useQuery` from `@tanstack/react-query` with `expo-secure-store` auth tokens (see [Project 04: Authentication App](../project-04-authentication-app/README.md)) to sync local habits across devices.

## Testing Instructions

Run the project's automated tests and static checks from the repository root:

```bash
# Run PulseTrack unit and component tests
npx jest projects/project-05-production-mobile-app/

# Run the entire curriculum test suite
npm test

# Verify strict TypeScript and ESLint compliance
npm run typecheck
npm run lint
```

What is covered automatically:

- **`habitAnalytics.test.ts`:** Verifies date toggling, active streaks (completed today vs pending today), broken streaks, longest streaks across month boundaries, archived habit exclusion, and case-insensitive search filtering.
- **`HabitCard.test.tsx`:** Renders `HabitCard` with `@testing-library/react-native`, verifies visible metadata, checks `accessibilityState` (`checked`), and asserts `onToggle` and `onArchive` press interactions.

## Accessibility & Security Notes

- **Accessibility (aligned with [Day 22](../../days/day-22-accessibility/README.md)):**
  - Interactive checkboxes expose `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`, and descriptive `accessibilityLabel` strings.
  - Filter controls use `tablist` / `tab` roles and radio selectors use `radio` with `checked` state.
  - Status and error banners use `accessibilityLiveRegion="polite"` / `accessibilityRole="alert"` so VoiceOver and TalkBack announce feedback immediately.
  - All primary controls meet minimum touch target sizes (`>= 44px` height or expanded `hitSlop={8}`).
- **Security (aligned with [Day 23](../../days/day-23-security/README.md)):**
  - `AsyncStorage` is strictly limited to non-sensitive habit data; credentials, OAuth tokens, and API secrets must live in `expo-secure-store` (Keychain / Keystore) or stay on a backend server.
  - All deserialized storage data is validated by runtime type guards before entering application state.
  - Never commit `.env` files with private keys; only `EXPO_PUBLIC_*` non-secret configuration values belong in client bundles.

## EAS Build Deployment Steps

Follow [Day 27: CI/CD & Deployment](../../days/day-27-cicd-and-deployment/README.md) and [Day 28: Production Readiness](../../days/day-28-production-readiness/README.md) to ship PulseTrack to TestFlight and Google Play:

1. **Install & Authenticate EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Initialize EAS Project Configuration:**
   ```bash
   eas build:configure
   ```
   Configure `development`, `preview` (internal distribution), and `production` (`autoIncrement: true`) profiles in `eas.json`.
3. **Run Pre-Release Quality Gates Locally & in CI:**
   ```bash
   npm run validate:all
   ```
4. **Create Internal Preview Builds for QA:**
   ```bash
   eas build --profile preview --platform all
   ```
5. **Build & Submit Production Binaries:**
   ```bash
   eas build --profile production --platform all
   eas submit --platform ios
   eas submit --platform android
   ```
6. **Ship Safe JS-Only Fixes Over-the-Air (Optional):**
   Configure `expo-updates` with `runtimeVersion: { policy: 'appVersion' }` and run `eas update --branch production --message "Fix streak display"`.

## Future Improvements

- **Pomodoro Focus Timer:** Add an interactive focus countdown screen with background notifications (`expo-notifications`) when a session finishes.
- **Cloud Sync & Conflict Resolution:** Sync local habits to a backend database using TanStack Query mutations and last-write-wins or CRDT conflict handling.
- **Weekly & Monthly Analytics Charts:** Add a calendar heatmap and category breakdown view powered by `habitAnalytics.ts`.
- **SQLite Migration for Large Histories:** Upgrade `habitRepository.ts` from `AsyncStorage` to `expo-sqlite` when storing years of granular session logs.
- **End-to-End Testing:** Add Maestro flows covering habit creation, completion toggling, filtering, and cold-start persistence.

---

**Related Lessons:** [Day 18: Architecture & Folder Structure](../../days/day-18-architecture-and-folder-structure/README.md) · [Day 20: Testing](../../days/day-20-testing/README.md) · [Day 22: Accessibility](../../days/day-22-accessibility/README.md) · [Day 23: Security](../../days/day-23-security/README.md) · [Day 27: CI/CD & Deployment](../../days/day-27-cicd-and-deployment/README.md) · [Day 28: Production Readiness](../../days/day-28-production-readiness/README.md) · [Day 29: Production Mobile App](../../days/day-29-production-mobile-app/README.md) · [Back to Curriculum Home](../../README.md)
