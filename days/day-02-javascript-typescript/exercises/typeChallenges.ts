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
 * Beginner 1:
 * Destructure `displayName` (defaulting to 'Learner') and `streakDays` from `profile`.
 * Return: `Welcome back, ${name} (${streakDays} day streak)!`
 */
export function formatUserGreeting(profile: UserProfile): string {
  // TODO: Replace with destructuring + default value
  return `Welcome back, ${profile.id}!`;
}

/**
 * Beginner 2:
 * Return an array of titles for tasks where `completed === false`.
 */
export function getActiveTaskTitles(_tasks: readonly Task[]): string[] {
  // TODO: Filter incomplete tasks and map to their titles
  return [];
}

/**
 * Intermediate 1:
 * Immutably flip `completed` for the task matching `taskId`.
 */
export function toggleTaskById(tasks: readonly Task[], _taskId: string): Task[] {
  // TODO: Use `map` and object spread `{ ...task, completed: !task.completed }`
  return [...tasks];
}

/**
 * Intermediate 2:
 * Use `reduce` to calculate total, completed, and remaining task counts.
 */
export function getTaskStats(_tasks: readonly Task[]): TaskStats {
  // TODO: Implement using Array.prototype.reduce
  return { total: 0, completed: 0, remaining: 0 };
}

/**
 * Challenge 1:
 * Generic function that extracts `item[key]` from each item in `items`.
 */
export function pluck<T, K extends keyof T>(_items: readonly T[], _key: K): T[K][] {
  // TODO: Map over `items` and return `item[key]`
  return [];
}

/**
 * Challenge 2:
 * Switch over `state.status` and return a user-friendly status string.
 */
export function renderRequestStatus<T>(
  state: RequestState<T>,
  _onSuccess: (data: T) => string,
): string {
  // TODO: Handle 'idle', 'loading', 'success', and 'error'
  return state.status;
}

/**
 * Challenge 3:
 * Async function that validates `index`, safely reads `tasks[index]`,
 * and returns a `RequestState<Task>` without throwing unhandled errors.
 */
export async function fetchTaskSafely(
  _tasks: readonly Task[],
  _index: number,
): Promise<RequestState<Task>> {
  // TODO: Guard against negative/out-of-bounds index using `noUncheckedIndexedAccess`
  return { status: 'idle' };
}
