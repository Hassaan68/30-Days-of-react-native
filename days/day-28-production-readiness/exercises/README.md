# Day 28 Exercises: Production Readiness

Complete the three production-audit functions in [`HealthCheckExercise.ts`](./HealthCheckExercise.ts).

## Beginner: PII Scrubber for Structured Logs

Implement `scrubSensitiveFields(payload)` so that:
- It returns a new object without mutating `payload`.
- Any key whose lowercase name is `'password'`, `'token'`, `'email'`, `'phone'`, or `'authorization'` has its value replaced with `'[REDACTED]'`.
- All other keys retain their original values.

## Intermediate: Performance Budget Evaluator

Implement `evaluatePerformanceBudget(metrics, budget)` so that:
- It compares `metrics.coldStartMs <= budget.maxColdStartMs`, `metrics.jsBundleSizeKb <= budget.maxJsBundleSizeKb`, and `metrics.crashFreeRatePercent >= budget.minCrashFreeRatePercent`.
- Returns `{ withinBudget: boolean, violations: string[] }` with a descriptive message for every exceeded threshold.

## Challenge: Store Submission Gatekeeper

Implement `canShipToStore(checks)` so that:
- It returns `{ approved: boolean, blockerIds: string[], completionPercent: number }`.
- `approved` is `true` only when `checks.length > 0` and **every** check with `required: true` has `passed: true`.
- `blockerIds` lists the `id`s of all failed required checks.
- `completionPercent` is `Math.round((passedCount / totalCount) * 100)` (or `0` when empty).

## Checking Your Work

Compare your solution with [`../solutions/HealthCheckSolution.ts`](../solutions/HealthCheckSolution.ts) and verify with `npm run typecheck`.
