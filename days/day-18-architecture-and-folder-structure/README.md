# Day 18: Architecture and Folder Structure

## Learning Objectives

By the end of Day 18, you will be able to:

- Compare **layer-based** and **feature-based** folder structures and explain why feature-based architecture scales better for production apps.
- Keep Expo Router `app/` route files **thin**, delegating UI and business logic to `src/features/`.
- Separate concerns cleanly across **UI components**, **feature hooks**, **services/repositories**, **shared UI primitives**, and **centralized domain types**.
- Apply the **Repository pattern** to swap between in-memory mocks, SQLite, and REST APIs without touching UI code.
- Configure clean **TypeScript path aliases** and understand when a **monorepo** structure pays off.

## Prerequisites

- Completed [Day 17: Local Storage and Offline Apps](../day-17-local-storage-and-offline/README.md).
- Comfortable with Expo Router (`app/` directory from Day 8), custom hooks (Day 4), and async data access (Days 11 & 17).

## Why This Concept Matters

Early prototypes fail slowly, then all at once. When API calls, AsyncStorage keys, styles, and navigation logic all live inside 600-line Expo Router files, every small change risks breaking unrelated screens, unit testing becomes painful, and new teammates struggle to know where to add a single button. A clean feature-based architecture with thin `app/` routes and repositories turns a tangled codebase into predictable, swappable building blocks — making features faster to build, easier to test, and safer to refactor months later.

## Introduction

A small 3-screen app works no matter how you organize your files. Six months later — when your app has 40 screens, authentication, offline caching, push notifications, and 5 engineers shipping pull requests every day — a messy folder structure slows every feature down.

Good architecture is not about adding boilerplate. It is about **making change cheap**: when an API response changes from `is_completed` to `completed`, or when you migrate a screen from REST to offline SQLite, you should edit **one file** instead of hunting through 18 components. Today you will learn the exact architecture patterns used in high-velocity Expo & React Native teams.

## Concepts

### 1. Layer-Based vs. Feature-Based Architecture

Most beginners start with a **layer-based** folder structure:

```text
src/
  components/   # 85 unrelated components mixed together
  hooks/        # 30 hooks from every part of the app
  services/     # 20 API files
  types/        # Giant monolithic types.ts
```

As the codebase grows, editing one feature (say, Tasks) requires jumping across 5 distant directories, and deleting a retired feature risks leaving orphaned files behind.

**Feature-based architecture** groups everything that changes together into self-contained feature folders, while keeping truly generic pieces in `src/shared/`:

```text
app/                            # THIN Expo Router routes only!
  _layout.tsx
  (tabs)/
    index.tsx                   # Renders <TasksScreen /> from src/features/tasks
    profile.tsx                 # Renders <ProfileScreen /> from src/features/profile
  tasks/
    [id].tsx                    # Reads `id` param and renders <TaskDetailScreen taskId={id} />
src/
  features/
    tasks/
      components/               # TaskRow.tsx, TaskFilterBar.tsx
      hooks/                    # useTasksFeature.ts
      repositories/             # taskRepository.ts (interface + REST/SQLite impls)
      screens/                  # TasksScreen.tsx, TaskDetailScreen.tsx
      types.ts                  # Task, CreateTaskInput
      index.ts                  # Public barrel API for this feature
    auth/
      ...
  shared/
    components/                 # Button.tsx, Card.tsx, EmptyState.tsx
    theme/                      # colors.ts, spacing.ts, typography.ts
    lib/                        # apiClient.ts, storage.ts
    types/                      # common.ts (Pagination, ApiError)
```

### 2. How `app/` Delegates to `src/features/` (Exact File Placement Guide)

Every file inside `app/` automatically becomes a route in Expo Router. If you put helpers, components, or repositories inside `app/`, Expo Router warns about missing default exports or accidentally exposes internal files as navigable screens.

Treat `app/` strictly as the **routing glue layer**, delegating everything else down a one-way dependency chain:

```text
app/(tabs)/tasks.tsx                   (Thin Expo Router wrapper: reads params & navigation)
        │
        ▼ imports
src/features/tasks/screens/TasksScreen.tsx      (UI layout, accessibility, user events)
        │
        ▼ calls
src/features/tasks/hooks/useTasksFeature.ts     (Loading/error state, optimistic updates)
        │
        ▼ depends on interface
src/features/tasks/repositories/taskRepository.ts (InMemory / REST / SQLite + DTO mapping)
        │
        ▼ uses generic primitives from
src/shared/                                     (Button, Card, theme tokens, apiClient)
```

Use this quick lookup table whenever you wonder **"Where does this file go?"**:

| What You Are Writing | Exact Folder in a Real Expo App | Example File |
| --- | --- | --- |
| Route entry or stack/tab layout | `app/` | `app/(tabs)/tasks.tsx`, `app/_layout.tsx` |
| Full screen UI for one feature | `src/features/<feature>/screens/` | `src/features/tasks/screens/TasksScreen.tsx` |
| Feature-specific row, card, or modal | `src/features/<feature>/components/` | `src/features/tasks/components/TaskRow.tsx` |
| Feature state & async orchestration | `src/features/<feature>/hooks/` | `src/features/tasks/hooks/useTasksFeature.ts` |
| API / SQLite / AsyncStorage adapter | `src/features/<feature>/repositories/` | `src/features/tasks/repositories/taskRepository.ts` |
| Domain models & feature types | `src/features/<feature>/types.ts` | `src/features/tasks/types.ts` |
| Generic design-system UI & utilities | `src/shared/` | `src/shared/components/Button.tsx` |

Here is how thin an Expo Router route file stays when `src/features/` owns the feature:

```tsx
// app/(tabs)/tasks.tsx — thin route wrapper
import { TasksScreen } from '@/features/tasks';

export default function TasksRoute() {
  return <TasksScreen />;
}
```

```tsx
// app/tasks/[id].tsx — thin dynamic route wrapper
import { useLocalSearchParams } from 'expo-router';
import { TaskDetailScreen } from '@/features/tasks';

export default function TaskDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TaskDetailScreen taskId={id} />;
}
```

> **React Web vs. React Native: Web SPA Routing vs. Expo Router `app/`**
>
> In a classic Vite/React Router web app, routes are declared in a `routes.tsx` array so any folder under `src/` can hold helper files safely. In **Expo Router** (like Next.js App Router), `app/` is **file-system routed**: every `.tsx` file inside `app/` maps to a URL/deep link on iOS and Android. Keeping `app/` strictly for thin route wrappers and placing screens, hooks, and repositories in `src/features/` gives you clean deep links without accidentally turning helper files into screens.

### 3. Separation of Concerns (4 Clear Layers)

1. **Presentation / UI (`screens/`, `components/`)**: Purely renders props and emits user events (`onCreate`, `onToggle`). Contains styling, layout, and accessibility labels — zero `fetch()` or SQL queries.
2. **Feature Logic / Hooks (`hooks/`)**: Coordinates loading, error, optimistic updates, and domain actions by calling a repository.
3. **Data Access / Services (`repositories/`)**: Translates between domain models (`Task`) and external representations (snake_case REST DTOs, SQLite rows, AsyncStorage JSON).
4. **Shared Kernel (`src/shared/`)**: Design-system primitives (`Button`, `TextField`), theme tokens, and low-level utilities with zero business knowledge of specific features.

### 4. The Repository Pattern (Dependency Inversion)

Instead of calling `fetch('/api/tasks')` directly inside a React component, define a small TypeScript interface (`TaskRepository`) describing *what* the feature needs (`list`, `create`, `update`, `remove`), and inject an implementation:

- **`InMemoryTaskRepository`**: Instant, deterministic, zero network — ideal for Jest tests and UI prototyping.
- **`RestTaskRepository`**: Talks to your HTTP API and maps `snake_case` DTOs (`is_completed`, `created_at`) into camelCase domain objects (`completed`, `createdAt`).
- **`SqliteTaskRepository`**: Reads/writes local `expo-sqlite` tables for offline-first mode.

Because `useTasksFeature(repository)` depends only on `TaskRepository`, you can swap data sources in one line without changing a single screen or hook!

### 5. Path Aliases & Monorepos

Avoid brittle relative paths like `../../../../shared/components/Button`. Configure TypeScript path aliases in `tsconfig.json` (supported natively by Expo Metro):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

When your organization shares code between a React Native mobile app, a Next.js web app, and a Node backend, a **monorepo** (e.g., pnpm workspaces or Turborepo) lets you place shared domain types, Zod schemas, and API clients in `packages/shared/` while keeping mobile-specific code in `apps/mobile/`.

## Code Examples

### Example 1: Repository Interface + In-Memory & REST Implementations

- **Type**: Reusable helper/module (domain types, `TaskRepository` interface, `InMemoryTaskRepository`, and `RestTaskRepository`)
- **File**: [`examples/taskRepository.ts`](./examples/taskRepository.ts)
- **Where to place in an Expo project**: Save under `src/features/tasks/repositories/taskRepository.ts`.
- **How to run**: Import `InMemoryTaskRepository` (for offline prototyping/tests) or `RestTaskRepository` (for live HTTP calls) into your feature hook, then preview the connected screen via `npm start` in this repository's shared Expo launcher.

```ts
export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, patch: UpdateTaskPatch): Promise<Task>;
  remove(id: string): Promise<void>;
}
```

`RestTaskRepository` validates untrusted JSON with a runtime type guard (`isTaskDto`) and maps backend fields (`is_completed`, `created_at`) to clean domain fields (`completed`, `createdAt`) before anything reaches your React components.

### Example 2: Decoupled Feature Hook

- **Type**: Reusable helper/module (custom React hook with zero UI or transport code)
- **File**: [`examples/useTasksFeature.ts`](./examples/useTasksFeature.ts)
- **Where to place in an Expo project**: Save under `src/features/tasks/hooks/useTasksFeature.ts` and call it inside `src/features/tasks/screens/TasksScreen.tsx`, which is then rendered by a thin `app/(tabs)/tasks.tsx` route.
- **How to run**: Pass a memoized `InMemoryTaskRepository` instance into `useTasksFeature(repo)` inside a screen and launch the shared Expo workspace with `npm start` (or run `npm run typecheck` and Jest tests with `npm test`).

```ts
export function useTasksFeature(repository: TaskRepository): TasksFeatureState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Loads tasks, handles optimistic toggles with rollback, and never imports fetch/SQLite!
}
```

## Step-by-Step Explanation

1. **Define domain types first**: `Task`, `CreateTaskInput`, and `UpdateTaskPatch` use `readonly` fields so UI code treats domain records as immutable.
2. **Isolate external DTO shapes**: The backend uses `is_completed` and `created_at`, which never leak outside `RestTaskRepository`. If the backend renames a field tomorrow, only `mapDtoToTask` changes.
3. **Protect against stale async updates**: Inside `useTasksFeature`, a `cancelled` boolean prevents `setState` calls if the screen unmounts before `repository.list()` resolves.
4. **Optimistic updates with safe rollback**: `toggleTask` updates UI state immediately for snappy UX, then calls `repository.update()`. If the server fails, it cleanly rolls back to the previous completion state and surfaces `error`.
5. **Defensive cloning in memory**: `InMemoryTaskRepository` returns shallow copies (`{ ...task }`) so accidental mutation in a test or caller cannot corrupt stored state.

## Expected Output

Because `taskRepository.ts` and `useTasksFeature.ts` are decoupled architecture modules, wiring them to a screen (or exercising them in a test) yields predictable, transport-independent behavior:

```text
// With InMemoryTaskRepository:
const repo = new InMemoryTaskRepository();
await repo.create({ title: '  Ship Day 18  ', priority: 'high' });
// -> { id: 'task-1', title: 'Ship Day 18', completed: false, priority: 'high', createdAt: '...' }

// Inside a screen using useTasksFeature(repo):
// 1. Initial mount   -> isLoading: true  -> resolves tasks[] -> isLoading: false
// 2. toggleTask('task-1')
//    - Immediately flips completed: true in UI (optimistic update)
//    - If repository.update() throws -> flips completed back to false & sets error message
// 3. Swapping InMemoryTaskRepository -> RestTaskRepository requires ZERO edits to useTasksFeature or UI!
```

## Common Mistakes

- **Putting non-route helpers inside `app/`**: Clutters Expo Router's route tree and causes unexpected routes or bundler warnings. Keep `app/` strictly for route files and `_layout.tsx`.
- **Tightly coupling UI screens to `fetch` or `AsyncStorage`**: Makes screens painful to test and forces massive rewrites whenever data fetching or caching changes.
- **Cross-feature spaghetti imports**: Importing deep internal files from another feature (`../profile/components/InternalAvatarBadge`) breaks encapsulation. Import only from a feature's public `index.ts` or move shared UI to `src/shared/`.
- **Leaking raw API DTOs into UI components**: Spreading backend snake_case payloads directly into components spreads API breaking changes across your entire app.
- **Instantiating a new repository inside render without memoization**: Writing `useTasksFeature(new InMemoryTaskRepository())` creates a brand-new `repository` reference on every render, re-triggering the `useEffect([repository])` loader in an infinite loop! Create the repository at module scope or wrap it in `useMemo` / a Context provider.
- **Over-engineering too early**: Do not introduce 6 layers of abstract factories for a 2-screen prototype. Start with thin `app/` routes + feature folders + a simple repository interface, and evolve as complexity grows.

## Best Practices

- Keep every Expo Router file in `app/` under ~25 lines — parse route params and render a screen from `src/features/`.
- Co-locate unit tests right next to the code they test (`taskRepository.test.ts` beside `taskRepository.ts`).
- Enforce unidirectional imports: `app/` → `src/features/` → `src/shared/`. Never import from `app/` or `src/features/` inside `src/shared/`.
- Use runtime validation (type guards or Zod) at the repository boundary where untrusted network or disk data enters your app.
- Export only intentional public APIs from each feature's `index.ts`.

## Exercises

Head to [`exercises/README.md`](./exercises/README.md) for detailed requirements, acceptance criteria, and hints, then open [`exercises/BookmarkRepositoryExercise.ts`](./exercises/BookmarkRepositoryExercise.ts):

1. **Beginner**: Implement `list()`, `getById(id)`, and `remove(id)` on `InMemoryBookmarkRepository`.
2. **Intermediate**: Implement `create(input)` with URL/title validation, normalized deduplicated tags, and `DuplicateBookmarkError` detection.
3. **Challenge**: Implement case-insensitive `findByTag(tag)` and guarantee deep immutability of returned `Bookmark` objects (including cloned `tags` arrays).

## Solutions

Try implementing `InMemoryBookmarkRepository` on your own before viewing the reference code.

<details>
<summary>Click to view solution notes &amp; links</summary>

- **Reference implementation**: [`solutions/BookmarkRepositorySolution.ts`](./solutions/BookmarkRepositorySolution.ts)
- **What changed**:
  - Added pure helper functions `cloneBookmark` (cloning both the object and its `tags` array), `normalizeUrl` (trimming and stripping trailing slashes), and `normalizeTags` (trimming, lowercasing, dropping empty strings, and deduplicating via a `Set`).
  - `list()`, `getById(id)`, and `findByTag(tag)` always return cloned bookmarks so external callers cannot mutate internal repository state.
  - `create(input)` trims/validates non-empty `title`, verifies `http://` or `https://` protocol, checks case-insensitive URL uniqueness (throwing `DuplicateBookmarkError` on conflict), prepends the new item (newest first), and increments an internal `sequence` ID counter.
  - `remove(id)` filters out the matching bookmark and compares lengths to return `true` when deleted and `false` when not found.

</details>

## Mini Project

Refactor a mini **Bookmarks Feature** using clean feature-based architecture:

- Create `src/features/bookmarks/` with `types.ts`, `repositories/bookmarkRepository.ts`, `hooks/useBookmarks.ts`, and `screens/BookmarksScreen.tsx`.
- Wire a thin `app/bookmarks.tsx` route that renders `<BookmarksScreen />`.
- Swap `InMemoryBookmarkRepository` for an AsyncStorage-backed `AsyncStorageBookmarkRepository` without modifying `useBookmarks.ts` or `BookmarksScreen.tsx`.

## Key Takeaways

- Organize growing apps by **feature** (`src/features/<name>`) rather than dumping everything into giant global folders.
- Keep Expo Router `app/` files **thin** — route files should only bind navigation params to feature screens.
- Separate **UI**, **feature hooks**, and **data access** so every layer is easy to read, change, and test.
- The **Repository pattern** lets you swap mocks, SQLite, and REST APIs seamlessly and keeps DTO mapping in one place.

## Further Reading

- [Expo Router: File-Based Routing Conventions](https://docs.expo.dev/router/basics/notation/)
- [Expo: Organizing Your Project](https://docs.expo.dev/guides/overview/)
- [TypeScript Path Mapping (`paths`)](https://www.typescriptlang.org/tsconfig/#paths)
- [Expo Monorepos Guide](https://docs.expo.dev/guides/monorepos/)

## Progress Checklist

- [ ] Understood the trade-offs between layer-based and feature-based folder structures
- [ ] Learned how to keep Expo Router `app/` route files thin and delegate to `src/features/`
- [ ] Reviewed `TaskRepository` (`InMemoryTaskRepository` + `RestTaskRepository`) and `useTasksFeature`
- [ ] Completed `BookmarkRepositoryExercise.ts` with validation, duplicate detection, and immutability
- [ ] Verified zero `tsc` and ESLint issues

## Next Day

Continue to [Day 19: Native Modules and Platform Differences](../day-19-native-modules-and-platform-differences/README.md) to handle iOS vs. Android behavior cleanly and understand Expo Modules and the New Architecture.
