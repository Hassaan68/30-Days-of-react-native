import { z } from 'zod';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSortBy = 'priority' | 'dueDate' | 'newest';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Task title must be at least 2 characters.')
    .max(100, 'Task title must be 100 characters or fewer.'),
  notes: z.string().trim().max(300, 'Notes must be 300 characters or fewer.').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || ISO_DATE_REGEX.test(value),
      'Due date must use YYYY-MM-DD format.',
    )
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Validates raw form input for a new task and returns a typed discriminated union.
 */
export function validateCreateTaskInput(input: unknown): ValidationResult<CreateTaskInput> {
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error: firstIssue?.message ?? 'Please check the task details and try again.',
    };
  }

  const normalizedDueDate =
    parsed.data.dueDate && parsed.data.dueDate.length > 0 ? parsed.data.dueDate : undefined;
  const normalizedNotes =
    parsed.data.notes && parsed.data.notes.length > 0 ? parsed.data.notes : undefined;

  return {
    ok: true,
    data: {
      title: parsed.data.title,
      priority: parsed.data.priority,
      notes: normalizedNotes,
      dueDate: normalizedDueDate,
    },
  };
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Filters tasks by completion status and optional case-insensitive search query.
 */
export function filterTasks(
  tasks: readonly Task[],
  filter: TaskFilter,
  searchQuery = '',
): Task[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter === 'active' && task.completed) {
      return false;
    }
    if (filter === 'completed' && !task.completed) {
      return false;
    }
    if (normalizedQuery.length > 0) {
      const haystack = `${task.title} ${task.notes ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }
    return true;
  });
}

/**
 * Returns a new sorted array of tasks without mutating the input array.
 */
export function sortTasks(tasks: readonly Task[], sortBy: TaskSortBy): Task[] {
  const copy = [...tasks];

  copy.sort((a, b) => {
    if (sortBy === 'priority') {
      const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rankDiff !== 0) {
        return rankDiff;
      }
      return b.createdAt.localeCompare(a.createdAt);
    }

    if (sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate) {
        return -1;
      }
      if (b.dueDate) {
        return 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    }

    return b.createdAt.localeCompare(a.createdAt);
  });

  return copy;
}

/**
 * Computes high-level progress metrics for the header summary bar.
 */
export function getTaskStats(tasks: readonly Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    active,
    completed,
    completionRate,
  };
}
