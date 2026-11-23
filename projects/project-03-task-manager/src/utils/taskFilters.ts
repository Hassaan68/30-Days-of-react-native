import type {
  Task,
  TaskFilterOptions,
  TaskPriority,
  TaskSummary,
} from '../types/task';

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function parseTimestamp(isoValue: string | undefined): number | null {
  if (!isoValue) {
    return null;
  }
  const timestamp = Date.parse(isoValue);
  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Pure helper that filters and sorts a list of tasks without mutating the input array.
 */
export function filterAndSortTasks(
  tasks: readonly Task[],
  options: TaskFilterOptions,
): Task[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (options.status === 'active' && task.completed) {
      return false;
    }
    if (options.status === 'completed' && !task.completed) {
      return false;
    }
    if (options.priority !== 'all' && task.priority !== options.priority) {
      return false;
    }
    if (normalizedQuery.length > 0) {
      const haystack = `${task.title} ${task.notes ?? ''} ${task.category}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((left, right) => {
    if (options.sortBy === 'priority') {
      const priorityDiff =
        PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
    }

    if (options.sortBy === 'dueDate') {
      const leftDue = parseTimestamp(left.dueDate);
      const rightDue = parseTimestamp(right.dueDate);

      if (leftDue !== null && rightDue !== null && leftDue !== rightDue) {
        return leftDue - rightDue;
      }
      if (leftDue !== null && rightDue === null) {
        return -1;
      }
      if (leftDue === null && rightDue !== null) {
        return 1;
      }
    }

    // Default / tie-breaker: newest tasks first
    const leftCreated = parseTimestamp(left.createdAt) ?? 0;
    const rightCreated = parseTimestamp(right.createdAt) ?? 0;
    return rightCreated - leftCreated;
  });
}

/**
 * Computes aggregate progress counters for dashboard headers and progress bars.
 */
export function computeTaskSummary(tasks: readonly Task[]): TaskSummary {
  const total = tasks.length;
  let completed = 0;
  let highPriorityActive = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
    } else if (task.priority === 'high') {
      highPriorityActive += 1;
    }
  }

  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    active,
    completed,
    highPriorityActive,
    completionRate,
  };
}

/**
 * Returns true if an incomplete task has a valid dueDate strictly before referenceDate.
 */
export function isTaskOverdue(
  task: Task,
  referenceDate: Date = new Date(),
): boolean {
  if (task.completed) {
    return false;
  }
  const dueTimestamp = parseTimestamp(task.dueDate);
  if (dueTimestamp === null) {
    return false;
  }
  return dueTimestamp < referenceDate.getTime();
}

/**
 * Groups tasks into buckets keyed by category name.
 */
export function groupTasksByCategory(
  tasks: readonly Task[],
): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};

  for (const task of tasks) {
    const key = task.category.trim() || 'General';
    const existing = groups[key];
    if (existing) {
      existing.push(task);
    } else {
      groups[key] = [task];
    }
  }

  return groups;
}
