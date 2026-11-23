# Day 26 Exercises: Backend Integration & Real-Time Features

Complete the functions in [`ReconnectBackoffExercise.ts`](./ReconnectBackoffExercise.ts). All three exercises build real-world primitives used in resilient mobile networking layers.

## Beginner: Exponential Backoff Delay

Implement `calculateBackoffDelay(attempt, config)` so that:
- Attempt `1` returns `baseDelayMs` (plus jitter), attempt `2` doubles it (`baseDelayMs * 2`), attempt `3` quadruples it (`baseDelayMs * 4`), and so on.
- The base exponential delay never exceeds `maxDelayMs`.
- An optional `jitterRatio` (for example, `0.2`) and `randomFactor` (`0` to `1`) add deterministic jitter: `Math.round(cappedDelay * jitterRatio * randomFactor)`.
- Invalid attempts (`attempt <= 0`) default to attempt `1`.

## Intermediate: Reconnection Policy

Implement `shouldRetryConnection(closeCode, attempt, maxAttempts)` so that:
- It returns `false` if `attempt >= maxAttempts`.
- It returns `false` for non-recoverable WebSocket close codes:
  - `1000` (Normal Closure)
  - `1008` (Policy Violation, e.g., revoked token)
  - `4001` (Custom Application Unauthorized)
- It returns `true` for transient network interruptions (such as `1006` Abnormal Closure or `1011` Internal Server Error).

## Challenge: Real-Time Message Merger

Implement `mergeChatMessages(existing, incoming)` so that:
- Incoming messages with the same `id` replace older copies only when `incoming.updatedAt >= existing.updatedAt`.
- New messages are appended without mutating the input arrays.
- The returned array is sorted chronologically by `sentAt` (oldest first, matching a chat timeline).

## Checking Your Work

Compare your implementation with [`../solutions/ReconnectBackoffSolution.ts`](../solutions/ReconnectBackoffSolution.ts) and verify types with `npm run typecheck`.
