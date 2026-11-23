export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatusFilter = 'all' | 'active' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
}

export interface TaskQueryOptions {
  status: TaskStatusFilter;
  priority?: TaskPriority;
  searchQuery?: string;
}

export interface ActivePrioritySummary {
  high: number;
  medium: number;
  low: number;
}

/**
 * TODO 1: Filter tasks by completion status, optional priority, and optional search query.
 */
export function filterByPriorityAndStatus(
  tasks: readonly TaskItem[],
  _options: TaskQueryOptions,
): TaskItem[] {
  return [...tasks];
}

/**
 * TODO 2: Return a new array sorted by urgency without mutating `tasks`:
 * 1) Active tasks before completed tasks.
 * 2) Priority order: high -> medium -> low.
 * 3) Earlier ISO dueDate (YYYY-MM-DD) before later or missing dueDate.
 */
export function sortTasksByUrgency(tasks: readonly TaskItem[]): TaskItem[] {
  return [...tasks];
}

/**
 * TODO 3: Count how many ACTIVE (incomplete) tasks exist for each priority level.
 */
export function summarizeByPriority(_tasks: readonly TaskItem[]): ActivePrioritySummary {
  return {
    high: 0,
    medium: 0,
    low: 0,
  };
}
