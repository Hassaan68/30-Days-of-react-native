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

## Why This Concept Matters

Individual tutorials teach forms, state, persistence, and tests in isolation—but real mobile apps only feel solid when all of those pieces fit together cleanly. A Task Manager forces you to solve the exact architectural challenges you face in production apps: keeping offline data in sync across restarts, deriving filtered/sorted views without infinite re-renders, validating user input cleanly, and keeping core business rules unit-testable outside React components.

## Introduction

Welcome to your **Week 3 Capstone**! Over the past three weeks you learned navigation, forms, state management, offline storage, animations, performance, clean architecture, platform differences, and automated testing. Today you combine all of those pieces into a complete **Task Manager** app.

### How the Week 3 Capstone Flows

Today's lesson is organized as a clear two-step progression:

1. **Study & preview the self-contained lesson app** in this folder:
   - **Pure domain logic** ([`examples/taskHelpers.ts`](./examples/taskHelpers.ts)): Zod 4 validation, filtering, sorting, and progress statistics — 100% framework-free and unit tested in [`examples/taskHelpers.test.ts`](./examples/taskHelpers.test.ts).
   - **Persisted client state + Accessible UI screen** ([`examples/TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx)): Zustand 5 store synced automatically to `@react-native-async-storage/async-storage`, validated task form, live stats bar, search, filter pills, sort pills, and performant `FlatList`.
2. **Scale up to the full multi-file featured capstone** at [`projects/project-03-task-manager/README.md`](../../projects/project-03-task-manager/README.md), which splits types (`src/types/task.ts`), persisted store (`src/store/useTaskStore.ts`), pure utilities (`src/utils/taskFilters.ts`), unit tests (`src/utils/taskFilters.test.ts`), and the dashboard screen (`src/screens/TasksScreen.tsx`) into a clean feature architecture with categories, overdue badges, and a bulk-clear list footer.

## Concepts

### 1. React Web vs. React Native for Persisted CRUD Apps

If you have built a to-do or task manager in React for the web, notice these key mobile differences:

| Concern | React Web | React Native 0.88 + Expo SDK 58 |
| --- | --- | --- |
| **Local Persistence** | Synchronous `window.localStorage` | Asynchronous `@react-native-async-storage/async-storage` wrapped with Zustand's `createJSONStorage(() => AsyncStorage)` |
| **List Rendering** | `.map()` inside a scrollable `<div>` | Virtualized `FlatList` with `keyExtractor`, `ListEmptyComponent`, and `ListFooterComponent` |
| **Conditional `FlatList` Footer** | Returning `null` is standard in JSX | In React Native 0.88 TypeScript types, pass `undefined` (not `null`) to `ListFooterComponent` when omitting it (as used in [`TasksScreen.tsx`](../../projects/project-03-task-manager/src/screens/TasksScreen.tsx)) |
| **Keyboard & Screen Framing** | Browser viewport handles safe areas automatically | Wrap screens in `SafeAreaView` from `react-native-safe-area-context` and keep `TextInput` composers outside `FlatList` item rows so typing never dismisses the keyboard |
| **Form Controls & Accessibility** | Native `<input type="checkbox">` | Custom `Pressable` controls with explicit `accessibilityRole="checkbox"` and `accessibilityState={{ checked }}` |

### 2. Navigation Structure for a Multi-Screen Task Manager

In a full Expo Router app (`app/`), a Task Manager scales cleanly with a Stack + Modal layout:

```text
app/
├── _layout.tsx         # Root Stack + SafeAreaProvider
├── index.tsx           # Task list screen (filters, sort, search, FlatList)
├── new-task.tsx        # Modal screen for creating a validated task
└── tasks/
    └── [id].tsx        # Task detail & edit screen
```

Inside today's self-contained example ([`TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx)), the creation form and list live together on one screen so you can study the entire CRUD + persistence flow in a single file, while [`projects/project-03-task-manager`](../../projects/project-03-task-manager/README.md) splits each layer into dedicated folders ready to connect to Expo Router routes.

### 3. Persisted CRUD Store with Zustand 5 + `AsyncStorage`

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

### 4. Validated Form Input with Zod 4

Using Zod 4 (`z.object`, `safeParse`, and `result.error.issues`), we enforce domain rules in one place:

- `title`: trimmed, 2–100 characters.
- `priority`: `'low' | 'medium' | 'high'`.
- `dueDate`: optional ISO date matching `YYYY-MM-DD`.
- `notes`: optional, up to 300 characters.

Because validation lives in `validateCreateTaskInput`, both the UI form and automated tests share the exact same contract.

### 5. Derived Filtering, Sorting, and Statistics

Never store a separate `filteredTasks` array inside Zustand — derived data gets out of sync easily. Instead:

1. Select raw slices (`tasks`, `filter`, `sortBy`, `searchQuery`) from Zustand.
2. Derive `visibleTasks` with `useMemo(() => sortTasks(filterTasks(tasks, filter, searchQuery), sortBy), [...])`.
3. Derive `stats` (`total`, `active`, `completed`, `completionRate`) with `useMemo(() => getTaskStats(tasks), [tasks])`.

### 6. Unit Testing Core Store & Helper Logic

Extracting `validateCreateTaskInput`, `filterTasks`, `sortTasks`, and `getTaskStats` into [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts) lets Jest verify every edge case in milliseconds — including verifying that `sortTasks` never mutates the original `tasks` array!

## Code Examples

> **How to run & preview today's examples:**
> - **Interactive screen preview (this repository):** Run `npm start` from the repository root to open the shared Expo launcher on iOS Simulator, Android Emulator, or Expo Go, and preview `TaskManagerScreen` directly.
> - **Unit tests (this repository):** Run `npx jest days/day-21-task-manager/examples/taskHelpers.test.ts` to execute the pure logic test suite.

### Example 1: Pure Task Validation, Filtering, Sorting & Stats Helpers

- **Type:** Reusable helper module (pure TypeScript + Zod 4, zero React Native imports)
- **File:** [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts)
- **Where to place in an Expo project:** `src/features/tasks/utils/taskHelpers.ts`
- **What it does:** Defines the `Task` domain types, Zod 4 schema (`createTaskSchema`), and four pure helper functions (`validateCreateTaskInput`, `filterTasks`, `sortTasks`, `getTaskStats`).

### Example 2: Passing Unit Tests for Task Helpers

- **Type:** Automated Jest unit test suite
- **File:** [`./examples/taskHelpers.test.ts`](./examples/taskHelpers.test.ts)
- **Where to place in an Expo project:** `src/features/tasks/utils/taskHelpers.test.ts` (co-located beside `taskHelpers.ts`)
- **Run directly with:**

```bash
npx jest days/day-21-task-manager/examples/taskHelpers.test.ts
```

### Example 3: Complete Task Manager Screen (Zustand + `AsyncStorage` + `FlatList`)

- **Type:** Runnable interactive screen component (`TaskManagerScreen` + `useTaskStore`)
- **File:** [`./examples/TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx)
- **Where to place in an Expo project:** `src/features/tasks/screens/TaskManagerScreen.tsx` (then render it inside an Expo Router route such as `app/index.tsx` or `app/tasks.tsx`)
- **Preview immediately:** Launch the repo's shared Expo workspace with `npm start` and open the Day 21 Task Manager screen.
- **What it wires together:**
  - Persisted CRUD store (`useTaskStore`) backed by `AsyncStorage`
  - Validated creation form with inline `accessibilityRole="alert"` error messaging
  - Priority selector pills, live search bar, status filters (`all`, `active`, `completed`), and sort controls (`priority`, `dueDate`, `newest`)
  - Accessible checkboxes (`accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`) and delete buttons inside a `FlatList`

## Step-by-Step Explanation

1. **Define types and validation first**: In [`./examples/taskHelpers.ts`](./examples/taskHelpers.ts), `Task`, `TaskPriority`, `TaskFilter`, and `TaskSortBy` establish strict contracts that prevent typo bugs across the store, UI, and tests.
2. **Avoid mutating arrays when sorting**: JavaScript's `Array.prototype.sort()` mutates in place! In `sortTasks`, we copy with `const copy = [...tasks]` first so Zustand state remains strictly immutable and React reliably detects changes.
3. **Avoid returning new arrays directly inside Zustand selectors**: In React 19, a Zustand selector like `useTaskStore((s) => filterTasks(s.tasks, s.filter))` creates a fresh array reference on every snapshot check and triggers infinite render loops. Selecting primitive/stored slices and combining them inside `useMemo` keeps renders fast and predictable.
4. **Normalize optional inputs at the validation boundary**: Empty strings (`""` or `"   "`) for `dueDate` and `notes` are converted to `undefined` inside `validateCreateTaskInput`, keeping stored `Task` objects clean.
5. **Conditional `FlatList` footer typing in React Native 0.88**: When scaling up to [`projects/project-03-task-manager/src/screens/TasksScreen.tsx`](../../projects/project-03-task-manager/src/screens/TasksScreen.tsx), notice `ListFooterComponent` evaluates to `undefined` rather than `null` when there are no completed tasks—matching RN 0.88's strict `FlatListProps` TypeScript definition cleanly.
6. **Verify every business rule with Jest**: [`./examples/taskHelpers.test.ts`](./examples/taskHelpers.test.ts) tests title trimming, invalid dates, case-insensitive search, priority/due-date/newest sorting, non-mutation guarantees, and empty-list stats (preventing division by zero!).

## Expected Output

### 1. On Screen (`TaskManagerScreen.tsx`)

When previewed via `npm start`, you see a vertical mobile task dashboard framed safely inside `SafeAreaView`:

```text
┌─────────────────────────────────────────┐
│ Task Manager                            │
│ 2 active · 1 done (33%)                 │
├─────────────────────────────────────────┤
│ [ Add a new task...                   ] │
│ [ Optional due date (YYYY-MM-DD)      ] │
│ (LOW)  [MEDIUM]  (HIGH)                 │
│ [             Add Task                ] │
├─────────────────────────────────────────┤
│ [ Search tasks...                     ] │
│ [all] (active) (completed)   Clear Done │
│ [Sort: Priority] (Due Date) (Newest)    │
├─────────────────────────────────────────┤
│ [ ] Ship Week 3 Capstone       [Delete] │
│     HIGH  Due 2026-05-01                │
│ [✓] Write Jest unit tests      [Delete] │
│     LOW                                 │
└─────────────────────────────────────────┘
```

- Submitting an empty title or invalid date (e.g. `05/01/2026`) shows an inline red alert message without adding a task.
- Tapping a task row toggles its blue checkmark, applies strikethrough styling, updates the header stats immediately, and reveals the **Clear Done** action.
- Reloading the app restores your saved tasks, filter, and sort selection from `AsyncStorage` while clearing the search input.

### 2. In the Terminal (`taskHelpers.test.ts`)

Running `npx jest days/day-21-task-manager/examples/taskHelpers.test.ts` prints a green Jest summary with all validation, filtering, sorting, immutability, and stats assertions passing.

## Common Mistakes

- **Calling `.sort()` directly on `state.tasks`**: Mutating store state directly breaks React re-rendering and causes subtle bugs across screens. **Fix:** Always copy (`[...tasks].sort(...)`) first.
- **Returning freshly computed arrays from a Zustand selector**: In React 19 + Zustand 5, `useTaskStore((s) => s.tasks.filter(...))` returns a new array every check and can cause an infinite loop. **Fix:** Select raw slices (`tasks`, `filter`, `sortBy`, `searchQuery`) and derive lists inside `useMemo` (or use `useShallow` for object slices).
- **Passing `null` to `FlatList`'s `ListFooterComponent` in RN 0.88**: Strict TypeScript settings can reject `null` depending on the conditional branch. **Fix:** Use `condition ? <Footer /> : undefined`.
- **Persisting ephemeral UI state like search queries or form errors**: Restoring an old search filter on next launch makes users think their tasks vanished! **Fix:** Use `partialize` in Zustand's `persist` config so only durable data and preferences are saved to `AsyncStorage`.
- **Dividing by `tasks.length` without guarding zero**: When a user has 0 tasks, `0 / 0` produces `NaN%`. **Fix:** Return `0` whenever `total === 0`.
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

Try implementing all three helpers in [`./exercises/TaskFilterExercise.ts`](./exercises/TaskFilterExercise.ts) and verifying them with `npm run typecheck` and `npm run lint` before checking the reference solution.

<details>
<summary>Click to view solution notes & links</summary>

Compare your completed helpers against the full reference solution in [`./solutions/TaskFilterSolution.ts`](./solutions/TaskFilterSolution.ts):

- `filterByPriorityAndStatus` composes all three predicates (`status`, optional `priority`, and trimmed lowercase `searchQuery`) in a single readable `.filter()` pass.
- `sortTasksByUrgency` copies the array with `[...tasks]` first so the input array is never mutated, then applies deterministic tie-breakers: completion status → priority weight (`high: 0, medium: 1, low: 2`) → ISO due date (`localeCompare`, undated last) → alphabetical title.
- `summarizeByPriority` accumulates active (incomplete) task counts in a single `O(n)` loop.

</details>

## Mini Project

**Multi-Screen Task Manager Capstone**: Expand today's `TaskManagerScreen` into the full featured project described in [`projects/project-03-task-manager/README.md`](../../projects/project-03-task-manager/README.md):

1. Study how [`projects/project-03-task-manager`](../../projects/project-03-task-manager/README.md) separates `types/`, `store/`, `utils/`, and `screens/` (including `ListFooterComponent` returning `undefined` when no completed tasks exist).
2. Move task creation into an Expo Router modal (`app/new-task.tsx`).
3. Add a task detail & edit screen (`app/tasks/[id].tsx`) supporting editing title, notes, priority, and due date.
4. Add a category/tag badge and a Jest + RNTL component test verifying adding, completing, filtering, and deleting a task end-to-end.

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
- [ ] Preview [`TaskManagerScreen.tsx`](./examples/TaskManagerScreen.tsx) via `npm start` and study Zustand + `AsyncStorage` persistence and `useMemo` derived state.
- [ ] Complete [`TaskFilterExercise.ts`](./exercises/TaskFilterExercise.ts) and compare with [`TaskFilterSolution.ts`](./solutions/TaskFilterSolution.ts).
- [ ] Explore the full capstone specification in [`projects/project-03-task-manager/README.md`](../../projects/project-03-task-manager/README.md).

## Next Day

Start Week 4 with [Day 22: Accessibility](../day-22-accessibility/README.md) to make your React Native apps inclusive and effortless to use with VoiceOver, TalkBack, and dynamic font scaling.
