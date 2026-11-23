# Day 26 Exercises: Backend Integration & Real-Time Features

## How to Practise

1. Open the starter file [`ReconnectBackoffExercise.ts`](./ReconnectBackoffExercise.ts) and replace each `// TODO:` placeholder without changing the exported function signatures or interfaces.
2. Verify strict TypeScript types and code style from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   ```
3. Optional: Write a quick Jest test or call each helper from a screen in your Expo app to inspect live outputs with different edge cases (negative attempts, auth close codes, duplicate/out-of-order chat messages).

---

## Beginner: Exponential Backoff Delay

### Requirements

Implement `calculateBackoffDelay(attempt, config, randomFactor)` so that:
- Attempt `1` starts at `baseDelayMs`, attempt `2` doubles it (`baseDelayMs * 2`), attempt `3` quadruples it (`baseDelayMs * 4`), and so on.
- The exponential base delay is capped at `maxDelayMs`.
- Optional `jitterRatio` (default `0`) and `randomFactor` (default `0`, clamped to `[0, 1]`) add deterministic jitter: `Math.round(cappedDelay * jitterRatio * clampedRandom)`.
- Invalid attempts (`attempt <= 0`) default to attempt `1`, and fractional attempts are floored.

### Acceptance Criteria

- [ ] Returns `1000` for `attempt = 1`, `baseDelayMs = 1000`, `maxDelayMs = 30000`, `jitterRatio = 0`.
- [ ] Caps exponential growth cleanly so `attempt = 10` never exceeds `maxDelayMs` before jitter.
- [ ] Handles `attempt = 0` or negative values as attempt `1`.
- [ ] Clamps `randomFactor` below `0` to `0` and above `1` to `1`.

### Expected Behavior

```ts
calculateBackoffDelay(1, { baseDelayMs: 1000, maxDelayMs: 10000 }) // -> 1000
calculateBackoffDelay(3, { baseDelayMs: 1000, maxDelayMs: 10000 }) // -> 4000
calculateBackoffDelay(6, { baseDelayMs: 1000, maxDelayMs: 10000 }) // -> 10000
calculateBackoffDelay(2, { baseDelayMs: 1000, maxDelayMs: 10000, jitterRatio: 0.2 }, 0.5) // -> 2200
```

<details>
<summary>Hint</summary>

Compute `const normalizedAttempt = Math.max(1, Math.floor(attempt))`, raise `2` to `normalizedAttempt - 1`, cap with `Math.min(exponential, config.maxDelayMs)`, and then compute `Math.round(capped * jitterRatio * clampedRandom)`.

</details>

---

## Intermediate: Reconnection Policy

### Requirements

Implement `shouldRetryConnection(closeCode, attempt, maxAttempts)` so that:
- It returns `false` when `attempt >= maxAttempts`.
- It returns `false` for non-recoverable WebSocket close codes:
  - `1000` (Normal Closure)
  - `1008` (Policy Violation, such as an expired/revoked token)
  - `4001` (Custom Application Unauthorized)
- It returns `true` for transient network interruptions (such as `1006` Abnormal Closure or `1011` Internal Server Error) while attempts remain.

### Acceptance Criteria

- [ ] Returns `false` when `attempt === maxAttempts` or `attempt > maxAttempts`, even for transient close code `1006`.
- [ ] Returns `false` for close codes `1000`, `1008`, and `4001` regardless of remaining attempts.
- [ ] Returns `true` for close codes like `1006` and `1011` when `attempt < maxAttempts`.

### Expected Behavior

```ts
shouldRetryConnection(1006, 2, 5) // -> true
shouldRetryConnection(1006, 5, 5) // -> false
shouldRetryConnection(1000, 0, 5) // -> false
shouldRetryConnection(4001, 1, 5) // -> false
```

<details>
<summary>Hint</summary>

Store the non-retryable codes in a module-level `const NON_RETRYABLE_CLOSE_CODES = new Set<number>([1000, 1008, 4001])`. Guard `attempt >= maxAttempts` first, then check `NON_RETRYABLE_CLOSE_CODES.has(closeCode)`.

</details>

---

## Challenge: Real-Time Message Merger

### Requirements

Implement `mergeChatMessages(existing, incoming)` so that:
- Messages are deduplicated by `id`.
- If an `id` already exists, the incoming message replaces the existing one **only** when `incoming.updatedAt >= existing.updatedAt` (ignoring stale out-of-order deliveries).
- Neither `existing` nor `incoming` is mutated.
- The returned array is sorted chronologically by `sentAt` ascending (oldest first, matching a chat timeline).

### Acceptance Criteria

- [ ] Appends brand-new incoming messages without duplicating existing IDs.
- [ ] Replaces an existing message when an edited copy arrives with a newer or equal `updatedAt`.
- [ ] Ignores a stale duplicate whose `updatedAt` is older than the copy already in `existing`.
- [ ] Returns a brand-new array sorted by `sentAt` ascending, leaving `existing` and `incoming` untouched.

### Expected Behavior

```ts
// Given existing = [{ id: 'm1', updatedAt: '2026-11-23T10:05:00Z', sentAt: '2026-11-23T10:00:00Z', text: 'Edited' }]
// and incoming = [
//   { id: 'm1', updatedAt: '2026-11-23T10:00:00Z', sentAt: '2026-11-23T10:00:00Z', text: 'Stale' },
//   { id: 'm2', updatedAt: '2026-11-23T10:02:00Z', sentAt: '2026-11-23T10:02:00Z', text: 'Hello!' },
// ]
// -> returns [m1 ('Edited'), m2 ('Hello!')] sorted oldest -> newest by sentAt
```

<details>
<summary>Hint</summary>

Use a `Map<string, ChatMessage>()` seeded from `existing`. Loop through `incoming`, check `const current = map.get(msg.id)`, and call `map.set(msg.id, msg)` only if `!current || msg.updatedAt >= current.updatedAt`. Finally return `Array.from(map.values()).sort((a, b) => a.sentAt.localeCompare(b.sentAt))`.

</details>

---

## Solutions (Open Only After Trying)

<details>
<summary>Click to reveal solution link</summary>

Compare your completed file against [`../solutions/ReconnectBackoffSolution.ts`](../solutions/ReconnectBackoffSolution.ts), then re-run `npm run typecheck && npm run lint`.

</details>
