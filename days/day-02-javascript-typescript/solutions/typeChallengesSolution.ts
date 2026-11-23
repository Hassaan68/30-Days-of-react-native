export interface UserProfile {
  readonly id: string;
  displayName?: string;
  streakDays: number;
}

export interface Task {
  readonly id: string;
  title: string;
  completed: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  remaining: number;
}

export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

/**
 * Beginner 1: Destructuring with default fallback.
 */
export function formatUserGreeting(profile: UserProfile): string {
  const { displayName = 'Learner', streakDays } = profile;
  return `Welcome back, ${displayName} (${streakDays} day streak)!`;
}

/**
 * Beginner 2: Pure filter + map transformation.
 */
export function getActiveTaskTitles(tasks: readonly Task[]): string[] {
  return tasks.filter((task) => !task.completed).map((task) => task.title);
}

/**
 * Intermediate 1: Immutable single-item update.
 */
export function toggleTaskById(tasks: readonly Task[], taskId: string): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );
}

/**
 * Intermediate 2: Aggregating stats with reduce.
 */
export function getTaskStats(tasks: readonly Task[]): TaskStats {
  return tasks.reduce<TaskStats>(
    (stats, task) => ({
      total: stats.total + 1,
      completed: stats.completed + (task.completed ? 1 : 0),
      remaining: stats.remaining + (task.completed ? 0 : 1),
    }),
    { total: 0, completed: 0, remaining: 0 },
  );
}

/**
 * Challenge 1: Type-safe generic property extractor.
 */
export function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

/**
 * Challenge 2: Exhaustive handling of a discriminated union.
 */
export function renderRequestStatus<T>(
  state: RequestState<T>,
  onSuccess: (data: T) => string,
): string {
  switch (state.status) {
    case 'idle':
      return 'Waiting to start.';
    case 'loading':
      return 'Loading data...';
    case 'success':
      return onSuccess(state.data);
    case 'error':
      return `Failed: ${state.error}`;
  }
}

/**
 * Challenge 3: Safe async lookup with `noUncheckedIndexedAccess` and `unknown` error narrowing.
 */
export async function fetchTaskSafely(
  tasks: readonly Task[],
  index: number,
): Promise<RequestState<Task>> {
  try {
    if (!Number.isInteger(index) || index < 0) {
      return { status: 'error', error: `Invalid task index: ${index}` };
    }

    const task = await Promise.resolve(tasks[index]);
    if (task === undefined) {
      return { status: 'error', error: `No task found at index ${index}.` };
    }

    return { status: 'success', data: task };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error fetching task.';
    return { status: 'error', error: message };
  }
}
