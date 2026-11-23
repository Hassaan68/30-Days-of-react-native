# Day 29 Exercises: PulseTrack Capstone Logic

## How to Practise

1. Open the starter file [`StreakCalculatorExercise.ts`](./StreakCalculatorExercise.ts) and complete each `// TODO:` without changing the exported function signatures.
2. Run strict TypeScript checks, linting, and unit tests from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   npm test -- days/day-29-production-mobile-app/examples/habitStats.test.ts
   ```
3. Optional: Wire your completed `calculateGraceStreak()` helper into [`../examples/HabitDashboardScreen.tsx`](../examples/HabitDashboardScreen.tsx) (previewable via `npm start`) or into [Project 05: PulseTrack](../../../projects/project-05-production-mobile-app/README.md) to see the grace-period streak live on screen!

---

## Beginner: Human-Readable Focus Duration

### Requirements

Implement `formatFocusDuration(totalMinutes)` so that:
- Negative values, `0`, or fractional values under `1` return `'0m'`.
- Values under `60` return `'<minutes>m'` (for example, `'45m'`).
- Exact multiples of `60` return `'<hours>h'` with no trailing `'0m'` (for example, `'1h'`, `'2h'`).
- Mixed hours and minutes return `'<hours>h <minutes>m'` (for example, `'1h 35m'`).

### Acceptance Criteria

- [ ] Returns `'0m'` for `-10`, `0`, and `0.8`.
- [ ] Returns `'45m'` for `45`.
- [ ] Returns `'2h'` (not `'2h 0m'`) for `120`.
- [ ] Returns `'1h 35m'` for `95`.

### Expected Behavior

```ts
formatFocusDuration(-5)  // -> '0m'
formatFocusDuration(0)   // -> '0m'
formatFocusDuration(45)  // -> '45m'
formatFocusDuration(60)  // -> '1h'
formatFocusDuration(95)  // -> '1h 35m'
```

<details>
<summary>Hint</summary>

Normalize first with `const safeMinutes = Math.max(0, Math.floor(totalMinutes))`. Compute `const hours = Math.floor(safeMinutes / 60)` and `const minutes = safeMinutes % 60`, then handle `hours === 0`, `minutes === 0`, and the mixed case.

</details>

---

## Intermediate: Safe Completion Rate Percentage

### Requirements

Implement `getCompletionRatePercent(completedCount, totalCount)` so that:
- Returns `0` when `totalCount <= 0` or `completedCount <= 0`.
- Clamps the ratio at `1` (`100%`) if `completedCount > totalCount`.
- Rounds the percentage to the nearest whole integer using `Math.round`.

### Acceptance Criteria

- [ ] Never returns `NaN` or `Infinity` when `totalCount === 0`.
- [ ] Returns `0` for negative `completedCount` or negative `totalCount`.
- [ ] Caps output at `100` when `completedCount` exceeds `totalCount` (for example, `5` of `4`).
- [ ] Rounds accurately (`1` of `3` → `33`, `2` of `3` → `67`).

### Expected Behavior

```ts
getCompletionRatePercent(0, 0)  // -> 0
getCompletionRatePercent(-1, 5) // -> 0
getCompletionRatePercent(1, 3)  // -> 33
getCompletionRatePercent(2, 3)  // -> 67
getCompletionRatePercent(5, 4)  // -> 100
```

<details>
<summary>Hint</summary>

Guard `if (totalCount <= 0 || completedCount <= 0) return 0;` at the top, then compute `Math.round(Math.min(1, completedCount / totalCount) * 100)`.

</details>

---

## Challenge: Grace-Period Streak Calculator

In a real habit tracker, opening the app at 8:00 AM shouldn't show a `0`-day streak just because you haven't checked off today's habit yet!

### Requirements

Implement `calculateGraceStreak(completedDates, todayDateKey)` so that:
- If `todayDateKey` is invalid, return `0`.
- If `todayDateKey` **is** completed, count consecutive completed calendar days walking backward from `todayDateKey`.
- If `todayDateKey` is **not** yet completed, check yesterday (`todayDay - 1`). If yesterday **is** completed, count consecutive completed days walking backward from yesterday.
- If neither today nor yesterday was completed, return `0`.
- Deduplicate repeated dates and ignore malformed date strings (such as `'2026-02-31'` or `'bad-date'`).

### Acceptance Criteria

- [ ] Counts consecutive days ending today when today is checked off.
- [ ] Preserves yesterday's streak when today is not yet checked off.
- [ ] Resets to `0` if both today and yesterday were missed.
- [ ] Handles duplicate date entries, unsorted input arrays, and invalid date strings safely without timezone drift.

### Expected Behavior

```ts
// Today is completed:
calculateGraceStreak(['2026-11-21', '2026-11-22', '2026-11-23'], '2026-11-23') // -> 3

// Morning grace window (today not yet completed, yesterday completed):
calculateGraceStreak(['2026-11-20', '2026-11-21', '2026-11-22'], '2026-11-23') // -> 3

// Missed yesterday and today:
calculateGraceStreak(['2026-11-20', '2026-11-21'], '2026-11-23') // -> 0
```

<details>
<summary>Hint</summary>

Import `parseCalendarDateToUtcDay` from `'../examples/habitStats'` so your date parsing stays 100% UTC-safe. Build a `Set<number>` of valid completed day numbers, pick `cursor = set.has(todayDay) ? todayDay : set.has(todayDay - 1) ? todayDay - 1 : null`, and walk backward with `while (set.has(cursor))`.

</details>

---

## Solutions (Open Only After Trying)

<details>
<summary>Click to reveal solution link</summary>

Compare your implementation with [`../solutions/StreakCalculatorSolution.ts`](../solutions/StreakCalculatorSolution.ts) and verify with `npm run typecheck && npm run lint && npm test`.

</details>
