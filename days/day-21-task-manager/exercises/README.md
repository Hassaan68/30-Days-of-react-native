# Day 21 Exercises: Task Querying, Urgency Sorting & Summaries

## How to Practise

1. Open the starter file [`TaskFilterExercise.ts`](./TaskFilterExercise.ts) and inspect the exported types (`TaskItem`, `TaskQueryOptions`, `ActivePrioritySummary`).
2. Complete each `TODO` one tier at a time, starting with **Beginner**, then **Intermediate**, then **Challenge**.
3. After each tier, verify strict TypeScript and ESLint from the repository root:

```bash
npm run typecheck
npm run lint
```

4. *(Optional but recommended)* Create a temporary Jest test file (e.g., `TaskFilterExercise.test.ts`) and run `npx jest` to verify every edge case—or import your helpers into [`../examples/TaskManagerScreen.tsx`](../examples/TaskManagerScreen.tsx) and preview the changes via `npm start`.

---

## 1. Beginner — `summarizeByPriority(tasks)`

### Requirements

- Count how many **active (incomplete)** tasks exist for each priority level: `'high'`, `'medium'`, and `'low'`.
- Ignore tasks where `completed === true`.
- Return an `ActivePrioritySummary` object (`{ high, medium, low }`) with `0` for any priority that has no active tasks.

### Acceptance Criteria

- [ ] Completed tasks are never counted toward any priority total.
- [ ] Passing an empty array `[]` returns `{ high: 0, medium: 0, low: 0 }`.
- [ ] The input `tasks` array is not mutated.
- [ ] `npm run typecheck` and `npm run lint` pass cleanly.

### Expected Behavior

Given 2 active high-priority tasks, 1 completed high-priority task, and 1 active low-priority task, `summarizeByPriority(tasks)` returns:

```ts
{ high: 2, medium: 0, low: 1 }
```

<details>
<summary>Hint</summary>

Initialize `const summary: ActivePrioritySummary = { high: 0, medium: 0, low: 0 };`, loop through `tasks`, and whenever `!task.completed`, increment `summary[task.priority] += 1`.

</details>

---

## 2. Intermediate — `filterByPriorityAndStatus(tasks, options)`

### Requirements

- Filter by `options.status`:
  - `'all'`: keep both active and completed tasks.
  - `'active'`: keep only tasks where `completed === false`.
  - `'completed'`: keep only tasks where `completed === true`.
- When `options.priority` is defined, keep only tasks matching that exact priority.
- When `options.searchQuery` is provided and non-empty after `.trim()`, keep only tasks whose `title` contains the query (case-insensitive).

### Acceptance Criteria

- [ ] All three filters compose together (AND logic): e.g., active + high priority + matching search term.
- [ ] Whitespace-only `searchQuery` (like `"   "`) behaves the same as no search query.
- [ ] Matching is case-insensitive (`"DEPLOY"` matches `"Deploy app"`).
- [ ] Returns a new array without modifying the original `tasks` array.

### Expected Behavior

Calling `filterByPriorityAndStatus(tasks, { status: 'active', priority: 'high', searchQuery: '  api ' })` returns only incomplete, high-priority tasks whose title includes `"api"` in any letter casing.

<details>
<summary>Hint</summary>

Normalize the query once before `.filter()` (`const normalizedQuery = options.searchQuery?.trim().toLowerCase() ?? '';`), then use early `return false` checks inside `tasks.filter((task) => { ... })` for each condition.

</details>

---

## 3. Challenge — `sortTasksByUrgency(tasks)`

### Requirements

- Return a **new sorted array** without mutating the input `tasks` array.
- Apply these deterministic urgency rules in order:
  1. **Completion status:** Active tasks (`completed === false`) always come before completed tasks (`completed === true`).
  2. **Priority:** Within the same completion status, sort `'high'` → `'medium'` → `'low'`.
  3. **Due date:** Within the same priority, sort earlier ISO dates (`YYYY-MM-DD`) before later dates, and place tasks with a `dueDate` before tasks without a `dueDate`.
  4. **Tie-breaker:** When status, priority, and due date are equal, sort alphabetically by `title` (`a.title.localeCompare(b.title)`).
- Write a Jest unit test verifying all sorting rules AND proving that the original input array order is unchanged.

### Acceptance Criteria

- [ ] `expect(result).not.toBe(originalTasks)` and `originalTasks` remains in its original order.
- [ ] A completed `'high'` priority task appears **after** an active `'low'` priority task.
- [ ] Among active `'high'` tasks, `'2026-04-01'` appears before `'2026-04-10'`, which appears before an undated task.
- [ ] Passing an empty array `[]` returns `[]` without throwing.

### Expected Behavior

Given a mixed list of active/completed tasks across priorities and dates, the top items are always the most urgent incomplete tasks due soonest, followed by undated incomplete tasks, and finally completed tasks at the bottom.

<details>
<summary>Hint</summary>

1. Start with `[...tasks].sort((a, b) => { ... })` so you never mutate `tasks`.
2. Define a lookup map `const PRIORITY_WEIGHT: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };`.
3. For dates, handle all four combinations: both have `dueDate` (`a.dueDate.localeCompare(b.dueDate)`), only `a` has one (`-1`), only `b` has one (`1`), or neither has one (fall through to `a.title.localeCompare(b.title)`).

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to view the reference solution link</summary>

Once you have implemented and tested your own helpers, compare your code against [`../solutions/TaskFilterSolution.ts`](../solutions/TaskFilterSolution.ts).

</details>
