# Day 29: Build a Complete Production-Style App

## Learning Objectives

By the end of Day 29, you will be able to:

- Combine Expo Router, strict TypeScript, Authentication, TanStack Query, Zustand, React Hook Form + Zod, local persistence, Error Boundaries, accessibility, and Jest testing into one cohesive mobile architecture.
- Design a clean feature-oriented folder structure that keeps pure domain logic decoupled from React Native UI components.
- Implement timezone-safe habit streak calculations and daily analytics with comprehensive automated unit tests.
- Build an accessible, validated mobile dashboard screen wrapped in a crash-recovering Error Boundary.
- Navigate and extend the full capstone implementation in [Project 05: Production Mobile App (PulseTrack)](../../projects/project-05-production-mobile-app/README.md).

## Prerequisites

- [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md)
- [Day 09: Forms and Validation](../day-09-forms-and-validation/README.md)
- [Day 10: State Management](../day-10-state-management/README.md)
- [Day 11: API Integration](../day-11-api-integration/README.md)
- [Day 12: Authentication](../day-12-authentication/README.md)
- [Day 17: Local Storage and Offline](../day-17-local-storage-and-offline/README.md)
- [Day 18: Architecture and Folder Structure](../day-18-architecture-and-folder-structure/README.md)
- [Day 20: Testing](../day-20-testing/README.md)
- [Day 22: Accessibility](../day-22-accessibility/README.md)
- [Day 28: Production Readiness](../day-28-production-readiness/README.md)

## Why This Concept Matters

Knowing React Native concepts in isolation—hooks here, navigation there, Zod in another tutorial—is very different from wiring them together without creating a tangled monolith. Real mobile engineering teams judge codebases by how cleanly state ownership, business logic, persistence, accessibility, and error recovery fit together. Building a complete, modular capstone app bridges the gap between following daily lessons and architecting production apps independently.

## Introduction

Over the past 28 days, you have learned every pillar of modern React Native development in focused daily lessons. Today is your capstone build: **PulseTrack**, a production-style **Habit & Focus Tracker** mobile app.

Rather than dumping everything into one giant `App.tsx`, you will see how real mobile engineering teams wire navigation, auth guards, server state, client state, form validation, offline persistence, accessibility, error recovery, and unit tests together cleanly.

> **Run & Explore PulseTrack**:
> 1. Preview today's interactive [`HabitDashboardScreen.tsx`](./examples/HabitDashboardScreen.tsx) directly in this repository's shared Expo workspace by running `npm start` from the repo root.
> 2. Run today's domain unit tests with `npm test -- days/day-29-production-mobile-app/examples/habitStats.test.ts`.
> 3. Explore the complete multi-screen, modular capstone codebase (Zustand store with optimistic rollback, AsyncStorage repository, React Hook Form + Zod habit creation screen, `ErrorBoundary`, and component tests) in [`../../projects/project-05-production-mobile-app/README.md`](../../projects/project-05-production-mobile-app/README.md).

## Concepts

### 1. PulseTrack Production Architecture

PulseTrack separates responsibilities into clear, testable layers:

```text
app/                        # Expo Router screens & route groups
├── _layout.tsx             # SafeAreaProvider, QueryClientProvider, ErrorBoundary, Auth gate
├── (auth)/login.tsx        # Validated login screen (React Hook Form + Zod)
└── (tabs)/
    ├── index.tsx           # Habit Dashboard (today's check-ins + summary cards)
    ├── focus.tsx           # Focus Timer screen (Zustand timer store + haptics)
    └── insights.tsx        # Weekly streaks & category breakdown + Settings/Sign out

src/
├── domain/                 # Pure TypeScript business rules (zero RN imports, 100% unit-tested)
├── services/               # Typed API client, auth token storage (expo-secure-store)
├── stores/                 # Zustand stores persisted with AsyncStorage
├── hooks/                  # TanStack Query hooks (useHabitsQuery, useToggleHabitMutation)
└── components/             # Reusable accessible UI primitives + ErrorBoundary
```

### 2. Dividing State by Ownership

A hallmark of senior React Native architecture is putting every piece of state in the right home:

| State Type | Tool in PulseTrack | Example |
| --- | --- | --- |
| **Server / Remote Data** | TanStack Query (`useQuery`, `useMutation`) | Habit list, focus session history, optimistic check-ins |
| **Global Client & UI State** | Zustand + AsyncStorage persistence | Active focus timer, user preferences, theme & consent flags |
| **Sensitive Auth Credentials** | `expo-secure-store` | Access/refresh tokens hydrated into auth context at launch |
| **Ephemeral Form Input** | React Hook Form + Zod schema validation | New habit modal, sign-in form fields & inline error messages |
| **Pure Derived Calculations** | Pure domain modules (`habitStats.ts`) | Current streak, longest streak, completion %, category totals |

### 3. Timezone-Safe Domain Logic

One of the trickiest real-world bugs in habit trackers is date math across timezones and Daylight Saving Time (DST). Subtracting `86_400_000` ms from a local `Date` object fails on 23-hour or 25-hour DST transition days!

In `examples/habitStats.ts`, we store habit completions as canonical calendar keys (`'2026-11-23'`) and convert them with `Date.UTC(year, month - 1, day)` into integer UTC day numbers. Consecutive days are always separated by exactly `1`—guaranteed on every timezone in the world.

### 4. Accessibility & Resilience Baked In

- Every interactive habit row uses `Pressable` with `minHeight: 64`, `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`, descriptive `accessibilityLabel`, and `accessibilityHint`.
- Form errors and fatal render failures announce themselves with `accessibilityRole="alert"`.
- A `DashboardErrorBoundary` catches unexpected rendering crashes and offers a clean "Try Again" recovery path instead of white-screening the app.

## Code Examples

> **How to run today's examples**: Preview `HabitDashboardScreen.tsx` interactively via `npm start` in this repository's shared Expo launcher, run `habitStats.test.ts` with `npm test`, and inspect the expanded multi-screen implementation in [`../../projects/project-05-production-mobile-app/README.md`](../../projects/project-05-production-mobile-app/README.md).

### Example 1: Pure Domain Statistics Module

- **Type**: Reusable pure TypeScript domain module (zero React Native imports)
- **Where to place in an Expo project**: `src/domain/habitStats.ts`
- **Full source**: [`./examples/habitStats.ts`](./examples/habitStats.ts)

Includes `parseCalendarDateToUtcDay()`, `calculateCurrentStreak()`, `calculateLongestStreak()`, `calculateDailySummary()`, and `groupFocusMinutesByCategory()`.

### Example 2: Automated Jest Unit Tests

- **Type**: Automated Jest unit test suite
- **Where to place in an Expo project**: `src/domain/habitStats.test.ts` (co-located beside `habitStats.ts`)
- **Full source**: [`./examples/habitStats.test.ts`](./examples/habitStats.test.ts)

Verifies UTC calendar parsing, rollover date rejection (`2026-02-31`), streak continuity, empty-list edge cases, and category aggregation. Run it directly from the repository root:

```bash
npm test -- days/day-29-production-mobile-app/examples/habitStats.test.ts
```

### Example 3: Accessible, Validated Dashboard Screen with Error Boundary

- **Type**: Runnable interactive screen component
- **Where to place in an Expo project**: `app/(tabs)/index.tsx` (or `src/screens/HabitDashboardScreen.tsx`) — and previewable right away via `npm start` in this repo's shared Expo launcher
- **Full source**: [`./examples/HabitDashboardScreen.tsx`](./examples/HabitDashboardScreen.tsx)

Demonstrates `SafeAreaView` from `react-native-safe-area-context`, `FlatList` rendering, memoized summary cards, Zod form validation, accessible `Pressable` habit toggles, and `DashboardErrorBoundary`.

## Step-by-Step Explanation

1. **Start with pure domain types and functions**: Writing `habitStats.ts` before touching React components lets you verify every edge case (empty lists, duplicate check-ins, invalid dates) in milliseconds with Jest.
2. **Validate user input at the boundary**: `NewHabitSchema.safeParse()` trims whitespace and enforces length constraints (`3–60` characters) before creating a new `HabitItem`, displaying the first Zod validation message cleanly via an accessible alert text element.
3. **Memoize derived screen summaries**: `useMemo(() => calculateDailySummary(...), [habits, sessions])` prevents recomputing metrics unnecessarily on every keystroke inside the quick-add input.
4. **Wrap screens in an Error Boundary**: `DashboardErrorBoundary` isolates unexpected UI errors so a malformed record never takes down the entire navigation stack.
5. **Scale up to the full capstone project**: In [`projects/project-05-production-mobile-app/`](../../projects/project-05-production-mobile-app/README.md), this exact pattern expands across a persisted Zustand store (`useHabitStore.ts`), AsyncStorage repository (`habitRepository.ts`), dedicated `CreateHabitScreen.tsx` with React Hook Form + Zod, and React Native Testing Library component tests (`HabitCard.test.tsx`).

## Expected Output

### Interactive Screen (`HabitDashboardScreen.tsx` via `npm start`)

When the screen mounts with its initial seed habits (`TODAY_KEY = '2026-11-23'`), you will see:

```text
┌──────────────────────────────────────────────┐
│ PulseTrack                                   │
│ Daily Habit & Focus Dashboard                │
│                                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│ │   33%    │  │    3d    │  │   45m    │     │
│ │Completed │  │Best Strk │  │Focus Time│     │
│ └──────────┘  └──────────┘  └──────────┘     │
│                                              │
│ [ Add a daily habit (e.g., 20m Reading) ][Add]│
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 45m Deep Focus Sprint           [ Done ] │ │
│ │ FOCUS • 45m goal • 3d streak             │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Study Architecture & Testing   [ Check ] │ │
│ │ LEARNING • 30m goal • 0d streak          │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Evening Walk (No Phone)        [ Check ] │ │
│ │ HEALTH • 20m goal • 0d streak            │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

- Tapping any habit row toggles its `Done` / `Check` badge and immediately recalculates the `Completed` percentage and `Best Streak` cards.
- Submitting fewer than 3 characters displays the inline red Zod error (`"Habit name must be at least 3 characters."`) with `accessibilityRole="alert"`.

### Jest Test Suite (`habitStats.test.ts`)

Running `npm test -- days/day-29-production-mobile-app/examples/habitStats.test.ts` prints:

```text
PASS  days/day-29-production-mobile-app/examples/habitStats.test.ts
  PulseTrack habitStats domain logic
    ✓ parses valid ISO calendar dates and rejects invalid calendar dates
    ✓ counts consecutive days ending on the reference date and ignores duplicates
    ✓ stops counting at a missed day and returns 0 when reference date is not completed
    ✓ finds the longest consecutive historical run across multiple gaps
    ✓ aggregates daily completion rate, focus minutes, and longest active streak
    ✓ handles empty habit lists without dividing by zero
    ✓ groups focus minutes by habit category and ignores orphaned sessions
```

## Common Mistakes

- **Mixing business logic inside JSX components**: Putting streak loops directly inside `renderItem` makes logic hard to test and slows down `FlatList` scrolling. **Fix**: Extract pure `.ts` domain functions and unit-test them independently.
- **Using `new Date('2026-11-23')` with local `.getDate()`**: Local timezone offsets can shift `'2026-11-23'` to `'2026-11-22'` for users west of UTC, breaking streaks overnight. **Fix**: Always parse `YYYY-MM-DD` explicitly via `Date.UTC`.
- **Storing server responses in Zustand manually**: Duplicating remote API data in Zustand forces you to reinvent caching, invalidation, loading states, and retry logic. **Fix**: Use TanStack Query for remote server state and Zustand for client/UI state.
- **Importing `SafeAreaView` from `react-native`**: The core `SafeAreaView` is deprecated and inconsistent on Android edge-to-edge screens. **Fix**: Always import `SafeAreaView` from `react-native-safe-area-context`.
- **Forgetting empty and error states**: Always verify how your dashboard looks with `0` habits, a failed storage/API request, and an invalid form submission.

## Best Practices

- **Keep domain modules framework-agnostic**: Files in `domain/` should never import `react-native`. They run instantaneously in Jest and can even be shared with a TypeScript backend.
- **Pair optimistic UI updates with rollback**: When a user taps a habit checkbox, update the UI immediately (for crisp 60fps feedback) and revert cleanly if persistence or the API mutation fails.
- **Design accessible touch targets from day one**: Ensure buttons and list items meet the 44×44 pt minimum hit area and announce checked/unchecked state to VoiceOver and TalkBack.
- **Test edge cases explicitly**: Always test `0` items, duplicate dates, negative numbers, and malformed inputs in your unit tests.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for full requirements, acceptance criteria, and hints, then complete [`./exercises/StreakCalculatorExercise.ts`](./exercises/StreakCalculatorExercise.ts):

- **Beginner**: Implement `formatFocusDuration()` (`0m`, `45m`, `1h`, `1h 35m`).
- **Intermediate**: Implement `getCompletionRatePercent()` with divide-by-zero protection and `[0, 100]` clamping.
- **Challenge**: Implement `calculateGraceStreak()` so an active streak from yesterday is preserved until the end of today before resetting.

## Solutions

Try completing all three functions in [`./exercises/StreakCalculatorExercise.ts`](./exercises/StreakCalculatorExercise.ts) and running `npm run typecheck && npm test` before revealing the solution notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your work with [`./solutions/StreakCalculatorSolution.ts`](./solutions/StreakCalculatorSolution.ts):

- `formatFocusDuration` guards negative and fractional numbers with `Math.max(0, Math.floor(totalMinutes))` and handles exact hours without a trailing `0m`.
- `getCompletionRatePercent` protects against `totalCount <= 0` or `completedCount <= 0` and clamps ratios above `1`.
- `calculateGraceStreak` reuses `parseCalendarDateToUtcDay` from `../examples/habitStats` and selects `todayDay` or `todayDay - 1` as the starting cursor before walking backward through consecutive UTC day numbers.

</details>

## Mini Project

**Complete the PulseTrack Capstone Project**

Open [`../../projects/project-05-production-mobile-app/README.md`](../../projects/project-05-production-mobile-app/README.md) and extend **PulseTrack** with one custom production feature of your own:
1. Integrate `calculateGraceStreak()` into the habit row so morning users still see their active streak with a subtle `"Complete today to keep streak!"` indicator.
2. Add a category filter bar (`All`, `Focus`, `Learning`, `Health`, `Mindfulness`) above the `FlatList`.
3. Write at least 3 Jest tests covering your new feature and confirm `npm run typecheck && npm run lint && npm test` all pass.

## Key Takeaways

- Production React Native apps thrive on clear layer boundaries: Expo Router routes, TanStack Query server state, Zustand UI state, pure TypeScript domain logic, and accessible components.
- Pure, UTC-based domain modules eliminate timezone bugs and make unit testing fast and deterministic.
- Error Boundaries, Zod validation, and accessibility attributes turn a working prototype into a trustworthy, store-ready mobile application.

## Further Reading

- [Project 05: Production Mobile App (PulseTrack)](../../projects/project-05-production-mobile-app/README.md)
- [Expo Router Architecture Guide](https://docs.expo.dev/router/introduction/)
- [TanStack Query React Native Guide](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [React Native Accessibility Documentation](https://reactnative.dev/docs/accessibility)
- [Zod Documentation](https://zod.dev/)

## Progress Checklist

- [ ] Reviewed PulseTrack's layered architecture and state ownership model
- [ ] Studied UTC-safe streak and analytics logic in `habitStats.ts`
- [ ] Ran and verified all Jest tests in `habitStats.test.ts`
- [ ] Previewed `HabitDashboardScreen.tsx` via `npm start` and reviewed its accessible `Pressable` rows, Zod validation, and Error Boundary
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `StreakCalculatorExercise.ts`
- [ ] Explored the full modular capstone codebase in `projects/project-05-production-mobile-app/`

## Next Day

Continue to the grand finale: [Day 30: Career, Open Source and Next Steps](../day-30-career-and-open-source/README.md).
