# Day 02 Exercises: TypeScript & Modern JavaScript Challenges

Practice strict TypeScript, immutable array transformations, generics, discriminated unions, and `async`/`await` without ever using `any`.

## How to Practise

1. Open the starter module [`./typeChallenges.ts`](./typeChallenges.ts) and replace each `// TODO:` body with your implementation (remember to remove leading `_` prefixes from parameters once you use them).
2. Verify strict TypeScript and ESLint rules after each tier:
   ```bash
   npm run typecheck
   npm run lint
   ```
3. Optionally import and call your completed functions from a Jest test or inside a screen previewed via `npm start` to inspect their runtime outputs.

## Tasks

### 1. Beginner — Destructuring, Defaults & Array Pipelines

**Requirements**
- **`formatUserGreeting(profile)`**: Destructure `displayName` (defaulting to `'Learner'` when omitted) and `streakDays` from `profile`, and return `` `Welcome back, ${displayName} (${streakDays} day streak)!` ``.
- **`getActiveTaskTitles(tasks)`**: Use `.filter()` and `.map()` to return an array of `title` strings for tasks where `completed === false`.

**Acceptance Criteria**
- [ ] `formatUserGreeting({ id: '1', streakDays: 5 })` returns `"Welcome back, Learner (5 day streak)!"`.
- [ ] `formatUserGreeting({ id: '2', displayName: 'Sam', streakDays: 3 })` returns `"Welcome back, Sam (3 day streak)!"`.
- [ ] `getActiveTaskTitles` returns only titles of incomplete tasks without mutating `tasks`.

**Expected Behavior**
- Both functions are pure (no side effects, no mutation of input objects or arrays) and compile cleanly under `strict: true`.

<details>
<summary>Hint</summary>

Default values work directly inside object destructuring:
```ts
const { displayName = 'Learner', streakDays } = profile;
```
For `getActiveTaskTitles`, chain `tasks.filter((task) => !task.completed).map((task) => task.title)`.

</details>

---

### 2. Intermediate — Immutable Updates & `reduce` Aggregation

**Requirements**
- **`toggleTaskById(tasks, taskId)`**: Return a **brand-new** `Task[]` array where only the task matching `taskId` has its `completed` boolean inverted, leaving every other task object unchanged.
- **`getTaskStats(tasks)`**: Use `Array.prototype.reduce<TaskStats>` to calculate `{ total, completed, remaining }`.

**Acceptance Criteria**
- [ ] Calling `toggleTaskById` never mutates the original `tasks` array or any existing `Task` object.
- [ ] If `taskId` does not exist in `tasks`, all tasks remain unchanged.
- [ ] `getTaskStats([])` returns `{ total: 0, completed: 0, remaining: 0 }`.
- [ ] `getTaskStats` returns accurate counts where `completed + remaining === total`.

**Expected Behavior**
- Toggling a task with `completed: false` produces a new array containing `{ ...task, completed: true }` at the same position while preserving the original array untouched.

<details>
<summary>Hint</summary>

In `toggleTaskById`, map over `tasks` with a ternary:
```ts
task.id === taskId ? { ...task, completed: !task.completed } : task
```
In `getTaskStats`, initialize `reduce<TaskStats>` with `{ total: 0, completed: 0, remaining: 0 }` and increment `total` by `1` plus either `completed` or `remaining` on each iteration.

</details>

---

### 3. Challenge — Generics, Discriminated Unions & Safe Async Lookups

**Requirements**
- **`pluck<T, K extends keyof T>(items, key)`**: Implement a generic function that maps `items` to an array of `item[key]` values with exact return type `T[K][]`.
- **`renderRequestStatus<T>(state, onSuccess)`**: Switch exhaustively over `state.status` (`'idle' | 'loading' | 'success' | 'error'`) and return a clear human-readable string (calling `onSuccess(state.data)` in the `'success'` branch and formatting `state.error` in the `'error'` branch).
- **`fetchTaskSafely(tasks, index)`**: Implement an `async` function returning `Promise<RequestState<Task>>` that:
  - Returns `{ status: 'error', error: ... }` if `index` is negative or not an integer.
  - Safely checks `const task = await Promise.resolve(tasks[index])` for `undefined` (respecting `noUncheckedIndexedAccess`).
  - Returns `{ status: 'success', data: task }` when found, and catches unexpected errors using `catch (error: unknown)` with `error instanceof Error` narrowing.

**Acceptance Criteria**
- [ ] Zero occurrences of `any` or non-null assertions (`!`) anywhere in `typeChallenges.ts`.
- [ ] `pluck(tasks, 'title')` infers `string[]` and `pluck(tasks, 'completed')` infers `boolean[]`.
- [ ] `renderRequestStatus` handles all four `RequestState<T>` variants without needing a fallback cast.
- [ ] `fetchTaskSafely(tasks, -1)` and `fetchTaskSafely(tasks, 99)` both resolve to `{ status: 'error', error: '...' }` instead of throwing.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
- Passing a valid index to `fetchTaskSafely` resolves to `{ status: 'success', data: task }`, which can then be passed directly into `renderRequestStatus(result, (task) => task.title)` to print the task's title.

<details>
<summary>Hint</summary>

1. For `pluck`, `return items.map((item) => item[key]);` preserves the exact indexed access type `T[K][]`.
2. For `renderRequestStatus`, a `switch (state.status)` automatically narrows `state.data` under `case 'success':` and `state.error` under `case 'error':`.
3. For `fetchTaskSafely`, guard `!Number.isInteger(index) || index < 0` first, then check `if (task === undefined)` before returning `{ status: 'success', data: task }`.

</details>

## Reference Solution

<details>
<summary>Only after trying: view reference solution link</summary>

Compare your implementations with [`../solutions/typeChallengesSolution.ts`](../solutions/typeChallengesSolution.ts).

</details>
