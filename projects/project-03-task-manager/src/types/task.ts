export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatusFilter = 'all' | 'active' | 'completed';

export type TaskSortBy = 'createdAt' | 'priority' | 'dueDate';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly notes?: string;
  readonly priority: TaskPriority;
  readonly category: string;
  readonly completed: boolean;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTaskInput {
  readonly title: string;
  readonly notes?: string;
  readonly priority?: TaskPriority;
  readonly category?: string;
  readonly dueDate?: string;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly notes?: string;
  readonly priority?: TaskPriority;
  readonly category?: string;
  readonly dueDate?: string;
  readonly completed?: boolean;
}

export interface TaskFilterOptions {
  readonly status: TaskStatusFilter;
  readonly priority: TaskPriority | 'all';
  readonly searchQuery: string;
  readonly sortBy: TaskSortBy;
}

export interface TaskSummary {
  readonly total: number;
  readonly active: number;
  readonly completed: number;
  readonly highPriorityActive: number;
  readonly completionRate: number;
}
