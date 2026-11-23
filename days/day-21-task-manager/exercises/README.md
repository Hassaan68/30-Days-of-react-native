# Day 21 Exercises: Task Querying, Urgency Sorting & Summaries

## Goal

Practice writing pure, strictly typed, immutable task query helpers that power a real Task Manager without mutating Zustand store state.

## Starter File

Open [`TaskFilterExercise.ts`](./TaskFilterExercise.ts) and complete all `TODO` items.

### Tasks

1. **`filterByPriorityAndStatus(tasks, options)`**:
   - Filter by `status` (`'all'`, `'active'`, `'completed'`).
   - Optionally filter by `priority` when `options.priority` is provided.
   - Optionally filter by case-insensitive `searchQuery` against `title`.
2. **`sortTasksByUrgency(tasks)`**:
   - Return a **new array** (never mutate the input array!).
   - Place active tasks before completed tasks.
   - Within the same completion status, sort by priority (`high` → `medium` → `low`).
   - Within the same priority, place tasks with an earlier `dueDate` first (tasks without a `dueDate` go last).
3. **`summarizeByPriority(tasks)`**:
   - Return counts of active (incomplete) tasks grouped by `high`, `medium`, and `low` priority.

## Verification

- Run `npm run typecheck` to confirm strict TypeScript passes.
- Run `npm run lint` to verify code quality.
- Compare your completed helpers with [`../solutions/TaskFilterSolution.ts`](../solutions/TaskFilterSolution.ts).
