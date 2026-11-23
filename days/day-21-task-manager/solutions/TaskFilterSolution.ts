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

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function filterByPriorityAndStatus(
  tasks: readonly TaskItem[],
  options: TaskQueryOptions,
): TaskItem[] {
  const normalizedQuery = options.searchQuery?.trim().toLowerCase() ?? '';

  return tasks.filter((task) => {
    if (options.status === 'active' && task.completed) {
      return false;
    }
    if (options.status === 'completed' && !task.completed) {
      return false;
    }
    if (options.priority && task.priority !== options.priority) {
      return false;
    }
    if (normalizedQuery.length > 0 && !task.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }
    return true;
  });
}

export function sortTasksByUrgency(tasks: readonly TaskItem[]): TaskItem[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) {
      return -1;
    }
    if (b.dueDate) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });
}

export function summarizeByPriority(tasks: readonly TaskItem[]): ActivePrioritySummary {
  const summary: ActivePrioritySummary = {
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const task of tasks) {
    if (!task.completed) {
      summary[task.priority] += 1;
    }
  }

  return summary;
}
