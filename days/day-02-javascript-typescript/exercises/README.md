# Day 02 Exercises: TypeScript & Modern JavaScript Challenges

Practice strict TypeScript, immutable array transformations, generics, discriminated unions, and `async`/`await` without ever using `any`.

## Starter File

Open [`./typeChallenges.ts`](./typeChallenges.ts) and complete each `// TODO:` function.

## Tasks

### 1. Beginner
- **`formatUserGreeting(profile)`**: Use object destructuring and a default fallback (`'Learner'`) when `displayName` is omitted to return `"Welcome back, <name> (<streak> day streak)!"`.
- **`getActiveTaskTitles(tasks)`**: Use `filter` and `map` to return the titles of all tasks where `completed` is `false`.

### 2. Intermediate
- **`toggleTaskById(tasks, taskId)`**: Return a **new** array where the task matching `taskId` has its `completed` flag inverted, leaving all other tasks untouched.
- **`getTaskStats(tasks)`**: Use `reduce` to compute `{ total, completed, remaining }`.

### 3. Challenge
- **`pluck<T, K extends keyof T>(items, key)`**: Implement a generic function that extracts an array of property values for `key` from `items`.
- **`renderRequestStatus<T>(state, onSuccess)`**: Switch exhaustively over a discriminated union `RequestState<T>` (`idle` | `loading` | `success` | `error`).
- **`fetchTaskSafely(tasks, index)`**: An `async` function that safely indexes `tasks[index]` (respecting `noUncheckedIndexedAccess`) and returns a `RequestState<Task>`, catching any unexpected errors with `unknown` narrowing.

## Checking Your Work

Compare your implementations with [`../solutions/typeChallengesSolution.ts`](../solutions/typeChallengesSolution.ts).
