# Project 03: Offline-First Task Manager

> **Aligned with:** [Day 21: Build a Full Task Manager App](../../days/day-21-task-manager/README.md)  
> **Difficulty:** Intermediate → Upper-Intermediate  
> **Estimated Time:** 4–5 hours

## Project Overview

The **Offline-First Task Manager** ties together Week 3's core architectural skills: global state management with **Zustand v5**, persistent offline storage via **`@react-native-async-storage/async-storage`**, performant list rendering with **`FlatList`**, pure domain utilities designed for **Jest unit testing**, and clean feature separation.

Unlike toy to-do apps that mix business logic directly into JSX, this project cleanly isolates its state store ([`useTaskStore.ts`](./src/store/useTaskStore.ts)), pure filter/sort/summary helpers ([`taskFilters.ts`](./src/utils/taskFilters.ts)), automated Jest tests ([`taskFilters.test.ts`](./src/utils/taskFilters.test.ts)), and accessible UI screen ([`TasksScreen.tsx`](./src/screens/TasksScreen.tsx)).

## Features

- **Offline-First Persistence**: Automatically saves and rehydrates your tasks in `AsyncStorage` using Zustand v5's `persist` + `createJSONStorage` middleware, while excluding transient search/filter state via `partialize`.
- **Quick Task Creation with Validation**: Add tasks with customizable priority (`High`, `Medium`, `Low`) and category (`Work`, `Personal`, `Learning`) chips and instant empty-title validation feedback.
- **Multi-Dimensional Filtering & Sorting**: Filter by status (`All`, `Active`, `Completed`), search across titles, notes, and categories, and sort by `Newest`, `Priority`, or `Due Date`.
- **Live Progress Dashboard**: Real-time completion rate percentage, animated-ready progress bar, and active/completed/high-priority counters.
- **Overdue Awareness**: Highlights incomplete tasks whose `dueDate` has passed while automatically clearing the overdue indicator once completed.
- **Bulk Cleanup**: One-tap **Clear Completed Tasks** button in the list footer whenever finished tasks exist.
- **Automated Jest Unit Tests**: Full test coverage for filtering, searching, sorting, immutability, summary math, overdue detection, and category grouping.

## Technologies

| Tool / Library | Purpose |
| --- | --- |
| **React Native 0.88** | `FlatList`, `TextInput`, `Pressable`, `ScrollView`, and accessible checkbox/tab roles |
| **Expo SDK 58** | Managed mobile runtime and `expo-status-bar` |
| **Zustand 5.x** | Lightweight global state store with `persist` and `createJSONStorage` |
| **@react-native-async-storage/async-storage** | Local key-value persistence that survives app restarts |
| **Jest & jest-expo** | Automated unit testing for pure task filtering and analytics logic |
| **TypeScript 5.8** | Strict domain models (`strict: true`, `noUncheckedIndexedAccess: true`) |
| **react-native-safe-area-context** | Safe layout framing across notched iOS and edge-to-edge Android devices |

## Screens

1. **Tasks Screen ([`src/screens/TasksScreen.tsx`](./src/screens/TasksScreen.tsx))**
   - Dark dashboard progress header displaying active count, completed count, high-priority active count, and overall completion percentage bar.
   - Quick-add task composer placed outside `FlatList` so the keyboard never dismisses while typing.
   - Search bar, segmented status filter tabs (`All` / `Active` / `Completed`), and sort pills (`Newest` / `Priority` / `Due Date`).
   - Scrollable `FlatList` of task cards with accessible completion checkboxes, priority pills, category tags, overdue badges, delete controls, empty state reset CTA, and a bulk **Clear Completed** footer.

## Folder Structure

```text
projects/project-03-task-manager/
├── README.md
└── src/
    ├── screens/
    │   └── TasksScreen.tsx           # Full task dashboard, composer, filters, and FlatList
    ├── store/
    │   └── useTaskStore.ts           # Zustand v5 store persisted to AsyncStorage
    ├── types/
    │   └── task.ts                   # Task, Priority, FilterOptions, and Summary interfaces
    └── utils/
        ├── taskFilters.ts            # Pure filtering, sorting, summary, overdue, and grouping helpers
        └── taskFilters.test.ts       # Comprehensive Jest unit test suite
```

## Implementation Steps

1. **Define strict task domain contracts** ([`src/types/task.ts`](./src/types/task.ts))
   - Model `Task`, `TaskPriority`, `TaskStatusFilter`, `TaskSortBy`, `CreateTaskInput`, `UpdateTaskInput`, `TaskFilterOptions`, and `TaskSummary`.
2. **Write pure business logic first** ([`src/utils/taskFilters.ts`](./src/utils/taskFilters.ts))
   - Implement `filterAndSortTasks()` without mutating the input array (`[...filtered].sort(...)`).
   - Implement `computeTaskSummary()`, `isTaskOverdue()`, and `groupTasksByCategory()`.
   - Keeping these pure (zero React or AsyncStorage imports) makes them fast, deterministic, and effortless to unit test.
3. **Cover edge cases with Jest tests** ([`src/utils/taskFilters.test.ts`](./src/utils/taskFilters.test.ts))
   - Verify status/priority filtering, case-insensitive search across `title`/`notes`/`category`, due-date sorting when `dueDate` is missing, input immutability, overdue rules for completed vs. active tasks, and summary math on empty lists.
4. **Build the persisted Zustand v5 store** ([`src/store/useTaskStore.ts`](./src/store/useTaskStore.ts))
   - Use Zustand v5's curried TypeScript pattern: `create<TaskStore>()(persist(..., { name, storage: createJSONStorage<PersistedTaskState>(() => AsyncStorage), partialize }))`.
   - Persist only `tasks` via `partialize` so transient `searchQuery` or filter selections reset cleanly on fresh launches.
5. **Connect the UI in TasksScreen** ([`src/screens/TasksScreen.tsx`](./src/screens/TasksScreen.tsx))
   - Select atomic slices from `useTaskStore` (`useTaskStore((state) => state.tasks)`) to prevent unnecessary re-renders.
   - Memoize derived `summary` and `visibleTasks` with `useMemo`.
   - Render tasks with `FlatList` and attach proper accessibility roles (`checkbox`, `radio`, `tab`, `button`).

## Complete Code Overview

| File | Responsibility | Key Concepts |
| --- | --- | --- |
| [`src/types/task.ts`](./src/types/task.ts) | Strict TypeScript models for tasks, inputs, filters, and metrics | Narrow string literal unions & immutable fields |
| [`src/store/useTaskStore.ts`](./src/store/useTaskStore.ts) | CRUD actions, filter state, and AsyncStorage persistence | Zustand v5 `persist`, `createJSONStorage`, `partialize` |
| [`src/utils/taskFilters.ts`](./src/utils/taskFilters.ts) | Pure filtering, sorting, summary, overdue, and grouping utilities | Functional immutability, deterministic date comparison |
| [`src/utils/taskFilters.test.ts`](./src/utils/taskFilters.test.ts) | Automated Jest tests for all task helper edge cases | `describe`/`it`/`expect`, pure unit testing |
| [`src/screens/TasksScreen.tsx`](./src/screens/TasksScreen.tsx) | Interactive task dashboard, composer, filters, and list | `FlatList`, Zustand selectors, `useMemo`, `SafeAreaView` |

### Related Curriculum Lessons

- [Day 10: State Management](../../days/day-10-state-management/README.md)
- [Day 16: Lists & Performance](../../days/day-16-lists-and-performance/README.md)
- [Day 17: Local Storage & Offline](../../days/day-17-local-storage-and-offline/README.md)
- [Day 20: Testing React Native Apps](../../days/day-20-testing/README.md)
- [Day 21: Build a Full Task Manager App](../../days/day-21-task-manager/README.md)

## Testing Instructions

### 1. Run the Jest Unit Test Suite

From the repository root, run:

```bash
npm test
```

Or run only Project 03's test suite:

```bash
npx jest projects/project-03-task-manager/src/utils/taskFilters.test.ts
```

### 2. Static Typecheck & Lint

```bash
npm run typecheck
npm run lint
```

### 3. Manual QA Checklist

- [ ] Add a task with a chosen priority and category and confirm it appears at the top of the list and updates the header stats.
- [ ] Submit an empty title and confirm the inline validation message appears without adding a blank task.
- [ ] Toggle a task checkbox and verify the strikethrough styling, completion percentage, and progress bar update immediately.
- [ ] Switch between `All`, `Active`, and `Completed` tabs and sort by `Newest`, `Priority`, and `Due Date`.
- [ ] Close and reload the app to confirm your tasks persist via `AsyncStorage`.
- [ ] Tap **Clear Completed Tasks** and verify completed items are removed while active items remain intact.

## Future Improvements

- **Due Date Picker & Local Reminders**: Schedule due-date notifications using `expo-notifications` ([Day 25](../../days/day-25-notifications-and-background-tasks/README.md)).
- **Swipe-to-Complete & Swipe-to-Delete Gestures**: Add tactile swipe actions with `react-native-gesture-handler` and `react-native-reanimated` ([Day 15](../../days/day-15-animations/README.md)) plus `expo-haptics`.
- **SQLite Full-Text Search**: Migrate storage to `expo-sqlite` ([Day 17](../../days/day-17-local-storage-and-offline/README.md)) for thousands of tasks with relational tags.
- **Task Detail & Edit Modal Route**: Add a dedicated edit screen via Expo Router ([Day 08](../../days/day-08-navigation-expo-router/README.md)) with `react-hook-form` + `zod` ([Day 09](../../days/day-09-forms-and-validation/README.md)).
- **Cloud Sync**: Sync local tasks with a real-time backend and conflict resolution ([Day 26](../../days/day-26-backend-and-realtime/README.md)).
- **Continue Learning**: Revisit [Project 02: Live Weather App](../project-02-weather-app/README.md) or proceed to [Project 04: Authentication App](../project-04-authentication-app/README.md).
