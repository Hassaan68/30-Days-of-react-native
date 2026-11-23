# Day 21: Build a Task Manager

## Learning Objectives

By the end of Day 21, you will be able to:

- Combine Week 1–3 skills into one cohesive, real-world React Native app: Expo Router navigation structure, Zustand 5 state management, Zod 4 validation, `AsyncStorage` persistence, and Jest unit tests.
- Design a clean, immutable CRUD store (`addTask`, `toggleTask`, `deleteTask`, `clearCompleted`) backed by `zustand/middleware` (`persist` + `createJSONStorage(() => AsyncStorage)`).
- Validate user-entered task forms with Zod schemas and surface clear, accessible inline errors.
- Implement multi-criteria filtering (`all`, `active`, `completed` + search) and non-mutating sorting (`priority`, `dueDate`, `newest`) using memoized selectors.
- Keep core business logic in pure helper modules (`taskHelpers.ts`) covered by passing unit tests (`taskHelpers.test.ts`).

## Prerequisites

- Completed Week 3 lessons ([Day 15](../day-15-animations/README.md) through [Day 20: Testing](../day-20-testing/README.md)).
- Comfortable with Zustand 5 ([Day 10](../day-10-state-management/README.md)), forms & Zod validation ([Day 09](../day-09-forms-and-validation/README.md)), `FlatList` ([Day 16](../day-16-lists-and-performance/README.md)), and `AsyncStorage` ([Day 17](../day-17-local-storage-and-offline/README.md)).

## Introduction

Welcome to your **Week 3 Capstone**! Over the past three weeks you learned navigation, forms, state management, offline storage, animations, performance, clean architecture, platform differences, and automated testing. Today you combine all of those pieces into a complete **Task Manager** app.

Rather than cramming validation, sorting, persistence, and UI into one giant component, we follow the clean feature architecture you practiced on Day 18:

- **Pure domain logic** (`taskHelpers.ts`): Zod validation, filtering, sorting, and progress statistics — 100% framework-free and unit tested in `taskHelpers.test.ts`.
- **Persisted client state** (`useTaskStore` in `TaskManagerScreen.tsx`): Zustand 5 store synced automatically to `@react-native-async-storage/async-storage`.
- **Accessible UI screen** (`TaskManagerScreen.tsx`): Validated task form, live stats bar, search, filter pills, sort pills, and performant `FlatList`.

> Looking for the full multi-screen Expo Router version of this capstone? Check out the featured project at [`projects/project-03-task-manager`](../../projects/project-03-task-manager/README.md).

## Concepts

### 1. Navigation Structure for a Multi-Screen Task Manager

In a full Expo Router app (`app/`), a Task Manager scales cleanly with a Stack + Modal layout:

```text
app/
├── _layout.tsx         # Root Stack + SafeAreaProvider
├── index.tsx           # Task list screen (filters, sort, search, FlatList)
├── new-task.tsx        # Modal screen for creating a validated task
└── tasks/
    └── [id].tsx        # Task detail & edit screen
```

Inside today's self-contained example ([`TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx)), the creation form and list live together on one screen so you can study the entire CRUD + persistence flow in a single file, while the featured project extends it across routes.

### 2. Persisted CRUD Store with Zustand 5 + `AsyncStorage`

Zustand 5's `persist` middleware hydrates state from `@react-native-async-storage/async-storage` on app launch and writes updates automatically whenever tasks change:

```ts
export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: 'all',
      sortBy: 'priority',
      searchQuery: '',
      addTask: (input) =>
        set((state) => ({
          tasks: [createTaskRecord(input), ...state.tasks],
        })),
      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),
      // ...
    }),
    {
      name: 'day21-task-manager-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        filter: state.filter,
        sortBy: state.sortBy,
      }),
    },
  ),
);
```

Notice `partialize`: we persist `tasks`, `filter`, and `sortBy`, while intentionally leaving temporary `searchQuery` out of disk storage so users always start fresh on the next launch.

### 3. Validated Form Input with Zod 4

Using Zod 4 (`z.object`, `safeParse`, and `result.error.issues`), we enforce domain rules in one place:

- `title`: trimmed, 2–100 characters.
- `priority`: `'low' | 'medium' | 'high'`.
- `dueDate`: optional ISO date matching `YYYY-MM-DD`.
- `notes`: optional, up to 300 characters.

Because validation lives in `validateCreateTaskInput`, both the UI form and automated tests share the exact same contract.

### 4. Derived Filtering, Sorting, and Statistics

Never store a separate `filteredTasks` array inside Zustand — derived data gets out of sync easily. Instead:

1. Select raw slices (`tasks`, `filter`, `sortBy`, `searchQuery`) from Zustand.
2. Derive `visibleTasks` with `useMemo(() => sortTasks(filterTasks(tasks, filter, searchQuery), sortBy), [...])`.
3. Derive `stats` (`total`, `active`, `completed`, `completionRate`) with `useMemo(() => getTaskStats(tasks), [tasks])`.

### 5. Unit Testing Core Store & Helper Logic

Extracting `validateCreateTaskInput`, `filterTasks`, `sortTasks`, and `getTaskStats` into [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts) lets Jest verify every edge case in milliseconds — including verifying that `sortTasks` never mutates the original `tasks` array!

## Code Examples

### Example 1: Pure Task Validation, Filtering, Sorting & Stats Helpers

See [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts). It defines the `Task` domain types, Zod 4 schema (`createTaskSchema`), and four pure helper functions.

### Example 2: Passing Unit Tests for Task Helpers

See [`./examples/taskHelpers.test.ts`](./examples/taskHelpers.test.ts). Run it directly with:

```bash
npx jest days/day-21-task-manager/examples/taskHelpers.test.ts
```

### Example 3: Complete Task Manager Screen (Zustand + `AsyncStorage` + `FlatList`)

See [`./examples/TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx). It wires together:

- Persisted CRUD store (`useTaskStore`)
- Validated creation form with inline `accessibilityRole="alert"` error messaging
- Priority selector pills, live search bar, status filters (`all`, `active`, `completed`), and sort controls (`priority`, `dueDate`, `newest`)
- Accessible checkboxes (`accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`) and delete buttons inside a `FlatList`

## Step-by-Step Explanation

1. **Define types and validation first**: In [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts), `Task`, `TaskPriority`, `TaskFilter`, and `TaskSortBy` establish strict contracts that prevent typo bugs across the store, UI, and tests.
2. **Avoid mutating arrays when sorting**: JavaScript's `Array.prototype.sort()` mutates in place! In `sortTasks`, we copy with `const copy = [...tasks]` first so Zustand state remains strictly immutable and React reliably detects changes.
3. **Avoid returning new arrays directly inside Zustand selectors**: In React 19, a Zustand selector like `useTaskStore((s) => filterTasks(s.tasks, s.filter))` creates a fresh array reference on every snapshot check and triggers infinite render loops. Selecting primitive/stored slices and combining them inside `useMemo` keeps renders fast and predictable.
4. **Normalize optional inputs at the validation boundary**: Empty strings (`""` or `"   "`) for `dueDate` and `notes` are converted to `undefined` inside `validateCreateTaskInput`, keeping stored `Task` objects clean.
5. **Verify every business rule with Jest**: [`./examples/taskHelpers.test.ts`](./examples/taskHelpers.test.ts) tests title trimming, invalid dates, case-insensitive search, priority/due-date/newest sorting, non-mutation guarantees, and empty-list stats (preventing division by zero!).

## Common Mistakes

- **Calling `.sort()` directly on `state.tasks`**: Mutating store state directly breaks React re-rendering and causes subtle bugs across screens. Always copy (`[...tasks].sort(...)`) first.
- **Returning freshly computed arrays from a Zustand selector**: In React 19 + Zustand 5, always select raw state slices and derive filtered/sorted lists inside `useMemo` (or use `useShallow` for object slices).
- **Persisting ephemeral UI state like search queries or form errors**: Use `partialize` in Zustand's `persist` config so only durable user data and preferences are written to `AsyncStorage`.
- **Dividing by `tasks.length` without guarding zero**: When a user has 0 tasks, `0 / 0` produces `NaN%`. Always return `0` when `total === 0`.
- **Leaving accessibility roles off custom checkboxes and filters**: Custom `Pressable` checkboxes must declare `accessibilityRole="checkbox"` and `accessibilityState={{ checked }}` so screen readers and tests understand their state.

## Best Practices

- **Keep domain helpers pure and UI-free** so they can be reused across screens and tested in milliseconds.
- **Store ISO dates (`YYYY-MM-DD` / ISO-8601 timestamps)** so sorting works reliably with `.localeCompare()` without timezone parsing pitfalls.
- **Separate Create/Edit validation from UI rendering** via Zod schemas so forms, modals, and API payloads follow identical rules.
- **Provide a helpful `ListEmptyComponent`** in `FlatList` so new users or filtered views never stare at a blank white screen.
- **Write regression tests for every sorting and filtering rule** before adding more views or sync layers.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/TaskFilterExercise.ts`](./exercises/TaskFilterExercise.ts).

- **Beginner**: Implement `summarizeByPriority(tasks)` to count how many active (incomplete) tasks exist for `'high'`, `'medium'`, and `'low'` priorities.
- **Intermediate**: Implement `filterByPriorityAndStatus(tasks, options)` combining status (`'all' | 'active' | 'completed'`), optional `priority`, and case-insensitive `searchQuery`.
- **Challenge**: Implement `sortTasksByUrgency(tasks)` so active tasks always precede completed tasks, sorted by priority (`high` → `medium` → `low`) and then earliest `dueDate` first (with undated tasks last), without mutating the input array. Then write a Jest test file verifying all three functions!

## Solutions

Compare your completed helpers against the full reference solution in [`./solutions/TaskFilterSolution.ts`](./solutions/TaskFilterSolution.ts):

- `filterByPriorityAndStatus` composes all three predicates in a single readable `.filter()` pass.
- `sortTasksByUrgency` copies the array with `[...tasks]` and applies deterministic tie-breakers (completion status → priority weight → ISO due date → alphabetical title).
- `summarizeByPriority` accumulates active task counts in a single `O(n)` pass.

## Mini Project

**Multi-Screen Task Manager Capstone**: Expand today's `TaskManagerScreen` into the full featured project described in [`projects/project-03-task-manager/README.md`](../../projects/project-03-task-manager/README.md):

1. Move task creation into an Expo Router modal (`app/new-task.tsx`).
2. Add a task detail & edit screen (`app/tasks/[id].tsx`) supporting editing title, notes, priority, and due date.
3. Add a category/tag badge and a Jest + RNTL component test verifying adding, completing, filtering, and deleting a task end-to-end.

## Key Takeaways

- Combining pure Zod-validated helpers, a Zustand 5 + `AsyncStorage` persisted store, and memoized selectors creates a clean, scalable architecture for mobile CRUD apps.
- Never mutate arrays in state; always copy before sorting and use `useMemo` for derived collections.
- Unit testing core helpers (`taskHelpers.test.ts`) gives you rapid confidence as features grow.
- You have completed Week 3 — you now have the engineering skills to architect, style, persist, and test real React Native applications!

## Further Reading

- [Featured Project 03: Task Manager](../../projects/project-03-task-manager/README.md)
- [Zustand Persist Middleware Documentation](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Zod Documentation](https://zod.dev/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Expo Router Modals & Dynamic Routes](https://docs.expo.dev/router/advanced/modals/)

## Progress Checklist

- [ ] Review [`taskHelpers.ts`](./examples/taskHelpers.ts) and run [`taskHelpers.test.ts`](./examples/taskHelpers.test.ts).
- [ ] Study Zustand + `AsyncStorage` persistence and `useMemo` derived state in [`TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx).
- [ ] Complete [`TaskFilterExercise.ts`](./exercises/TaskFilterExercise.ts) and compare with [`TaskFilterSolution.ts`](./solutions/TaskFilterSolution.ts).
- [ ] Explore the full capstone specification in [`projects/project-03-task-manager/README.md`](../../projects/project-03-task-manager/README.md).

## Next Day

Start Week 4 with [Day 22: Accessibility](../day-22-accessibility/README.md) to make your React Native apps inclusive and effortless to use with VoiceOver, TalkBack, and dynamic font scaling.
