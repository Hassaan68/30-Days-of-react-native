# Day 28 Exercises: Production Readiness

## How to Practise

1. Open the starter file [`HealthCheckExercise.ts`](./HealthCheckExercise.ts) and complete all three `// TODO:` functions while keeping every exported interface and signature intact.
2. Run strict type checking and linting from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   ```
3. Optional: Write a small Jest unit test importing your functions to test mixed-case PII keys, multiple simultaneous budget violations, and empty checklist edge cases.

---

## Beginner: PII Scrubber for Structured Logs

### Requirements

Implement `scrubSensitiveFields(payload)` so that:
- It returns a new object without mutating `payload`.
- Any key whose lowercase name is `'password'`, `'token'`, `'email'`, `'phone'`, or `'authorization'` has its value replaced with `'[REDACTED]'`.
- All other keys retain their original values unchanged.

### Acceptance Criteria

- [ ] Redacts exact and mixed-case keys such as `'Email'`, `'AUTHORIZATION'`, and `'password'`.
- [ ] Preserves non-sensitive fields like `screenName`, `retryCount`, and `isOffline`.
- [ ] Does not mutate the original `payload` object.

### Expected Behavior

```ts
scrubSensitiveFields({
  userId: 'u_42',
  Email: 'alex@example.com',
  Authorization: 'Bearer abc123',
  retryCount: 2,
})
// -> { userId: 'u_42', Email: '[REDACTED]', Authorization: '[REDACTED]', retryCount: 2 }
```

<details>
<summary>Hint</summary>

Store the 5 sensitive names in a `Set<string>` in lowercase. Iterate over `Object.entries(payload)`, check `SENSITIVE_KEYS.has(key.toLowerCase())`, and write into a brand-new `Record<string, unknown>` object.

</details>

---

## Intermediate: Performance Budget Evaluator

### Requirements

Implement `evaluatePerformanceBudget(metrics, budget)` so that:
- It checks all three metrics independently:
  1. `metrics.coldStartMs <= budget.maxColdStartMs`
  2. `metrics.jsBundleSizeKb <= budget.maxJsBundleSizeKb`
  3. `metrics.crashFreeRatePercent >= budget.minCrashFreeRatePercent`
- For each failed threshold, it pushes a descriptive human-readable message into `violations`.
- Returns `{ withinBudget: violations.length === 0, violations }`.

### Acceptance Criteria

- [ ] Returns `{ withinBudget: true, violations: [] }` when every metric meets or equals its budget boundary.
- [ ] Reports **all** violated thresholds in a single pass when more than one metric fails.
- [ ] Treats `crashFreeRatePercent` as a minimum threshold (fails when strictly lower than `minCrashFreeRatePercent`).

### Expected Behavior

```ts
evaluatePerformanceBudget(
  { coldStartMs: 2450, jsBundleSizeKb: 1800, crashFreeRatePercent: 98.9 },
  { maxColdStartMs: 2000, maxJsBundleSizeKb: 2500, minCrashFreeRatePercent: 99.5 },
)
// -> {
//   withinBudget: false,
//   violations: [
//     'Cold start 2450ms exceeds budget of 2000ms.',
//     'Crash-free rate 98.9% is below minimum 99.5%.'
//   ]
// }
```

<details>
<summary>Hint</summary>

Initialize `const violations: string[] = []` and write three separate `if` statements (not `else if`) so every exceeded metric is collected in one evaluation pass.

</details>

---

## Challenge: Store Submission Gatekeeper

### Requirements

Implement `canShipToStore(checks)` so that:
- It returns `{ approved, blockerIds, completionPercent }`.
- When `checks` is empty, return `{ approved: false, blockerIds: [], completionPercent: 0 }`.
- `blockerIds` collects the `id` of every check where `required === true && passed === false`.
- `approved` is `true` only when `checks.length > 0` and `blockerIds.length === 0`.
- `completionPercent` is `Math.round((passedCount / checks.length) * 100)`.

### Acceptance Criteria

- [ ] Returns `approved: false` and `completionPercent: 0` when given an empty array `[]`.
- [ ] Approves submission (`approved: true`) even if an optional (`required: false`) check has `passed: false`.
- [ ] Blocks submission (`approved: false`) and lists every failed required `id` in `blockerIds`.
- [ ] Calculates `completionPercent` across all checks (required + optional) rounded to the nearest integer.

### Expected Behavior

```ts
canShipToStore([
  { id: 'account-deletion', required: true, passed: true },
  { id: 'privacy-labels', required: true, passed: false },
  { id: 'localized-screenshots', required: false, passed: false },
])
// -> { approved: false, blockerIds: ['privacy-labels'], completionPercent: 33 }
```

<details>
<summary>Hint</summary>

Guard `if (checks.length === 0)` first. Then loop over `checks` once: increment `passedCount` when `check.passed` is `true`, otherwise push `check.id` to `blockerIds` if `check.required` is `true`.

</details>

---

## Solutions (Open Only After Trying)

<details>
<summary>Click to reveal solution link</summary>

Compare your solution with [`../solutions/HealthCheckSolution.ts`](../solutions/HealthCheckSolution.ts), then re-run `npm run typecheck && npm run lint`.

</details>
