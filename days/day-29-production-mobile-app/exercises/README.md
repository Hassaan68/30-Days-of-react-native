# Day 29 Exercises: PulseTrack Capstone Logic

Complete the three functions in [`StreakCalculatorExercise.ts`](./StreakCalculatorExercise.ts) to strengthen the domain layer of **PulseTrack**.

## Beginner: Human-Readable Focus Duration

Implement `formatFocusDuration(totalMinutes)` so that:
- Negative values or `0` return `'0m'`.
- Values under 60 return `'45m'`.
- Exact hours return `'2h'`.
- Mixed hours and minutes return `'1h 35m'`.

## Intermediate: Safe Completion Rate Percentage

Implement `getCompletionRatePercent(completedCount, totalCount)` so that:
- Returns `0` when `totalCount <= 0` or `completedCount <= 0`.
- Clamps the output to `100` if `completedCount > totalCount`.
- Rounds to the nearest whole percentage (`Math.round`).

## Challenge: Grace-Period Streak Calculator

In a real habit tracker, opening the app at 8:00 AM shouldn't show a `0`-day streak just because you haven't checked off today's habit yet!

Implement `calculateGraceStreak(completedDates, todayDateKey)` so that:
- If `todayDateKey` IS completed, count consecutive completed days ending on `todayDateKey`.
- If `todayDateKey` is NOT yet completed, check yesterday (`todayDay - 1`). If yesterday IS completed, count consecutive completed days ending on yesterday.
- If neither today nor yesterday was completed, return `0`.
- Deduplicate repeated dates and ignore malformed date strings.

## Checking Your Work

Compare your implementation with [`../solutions/StreakCalculatorSolution.ts`](../solutions/StreakCalculatorSolution.ts) and run `npm run typecheck && npm test`.
