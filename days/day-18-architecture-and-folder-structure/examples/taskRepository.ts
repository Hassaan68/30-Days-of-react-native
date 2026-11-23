export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly priority: TaskPriority;
  readonly createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  priority?: TaskPriority;
}

export interface UpdateTaskPatch {
  title?: string;
  completed?: boolean;
  priority?: TaskPriority;
}

/**
 * Domain-level Repository contract.
 * Feature hooks and UI components depend ONLY on this interface—never directly
 * on `fetch`, Axios, SQLite, or AsyncStorage.
 */
export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, patch: UpdateTaskPatch): Promise<Task>;
  remove(id: string): Promise<void>;
}

/**
 * Fast, deterministic in-memory implementation.
 * Ideal for local prototyping, UI previews, and unit tests with zero network I/O.
 */
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[];
  private sequence = 1;

  constructor(initialTasks: readonly Task[] = []) {
    this.tasks = initialTasks.map((task) => ({ ...task }));
  }

  async list(): Promise<Task[]> {
    return this.tasks.map((task) => ({ ...task }));
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const trimmed = input.title.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty.');
    }

    const created: Task = {
      id: `task-${this.sequence}`,
      title: trimmed,
      completed: false,
      priority: input.priority ?? 'medium',
      createdAt: new Date().toISOString(),
    };

    this.sequence += 1;
    this.tasks = [created, ...this.tasks];
    return { ...created };
  }

  async update(id: string, patch: UpdateTaskPatch): Promise<Task> {
    const index = this.tasks.findIndex((task) => task.id === id);
    const existing = index >= 0 ? this.tasks[index] : undefined;

    if (!existing) {
      throw new Error(`Task "${id}" not found.`);
    }

    const updated: Task = {
      ...existing,
      title: patch.title !== undefined ? patch.title.trim() : existing.title,
      completed: patch.completed !== undefined ? patch.completed : existing.completed,
      priority: patch.priority !== undefined ? patch.priority : existing.priority,
    };

    this.tasks = this.tasks.map((task) => (task.id === id ? updated : task));
    return { ...updated };
  }

  async remove(id: string): Promise<void> {
    const exists = this.tasks.some((task) => task.id === id);
    if (!exists) {
      throw new Error(`Task "${id}" not found.`);
    }
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}

interface TaskDto {
  id: string;
  title: string;
  is_completed: boolean;
  priority: TaskPriority;
  created_at: string;
}

function isTaskDto(value: unknown): value is TaskDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const validPriority =
    candidate.priority === 'low' ||
    candidate.priority === 'medium' ||
    candidate.priority === 'high';

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.is_completed === 'boolean' &&
    validPriority &&
    typeof candidate.created_at === 'string'
  );
}

function mapDtoToTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    completed: dto.is_completed,
    priority: dto.priority,
    createdAt: dto.created_at,
  };
}

/**
 * REST API implementation of `TaskRepository`.
 * Isolates API URLs, snake_case DTO translation, and HTTP status handling
 * behind the exact same interface as `InMemoryTaskRepository`.
 */
export class RestTaskRepository implements TaskRepository {
  private readonly baseUrl: string;
  private readonly authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.authToken = authToken;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async list(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks (HTTP ${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error('Unexpected tasks response format.');
    }

    return payload.filter(isTaskDto).map(mapDtoToTask);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        title: input.title.trim(),
        priority: input.priority ?? 'medium',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task (HTTP ${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!isTaskDto(payload)) {
      throw new Error('Unexpected create-task response format.');
    }

    return mapDtoToTask(payload);
  }

  async update(id: string, patch: UpdateTaskPatch): Promise<Task> {
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title.trim();
    if (patch.completed !== undefined) body.is_completed = patch.completed;
    if (patch.priority !== undefined) body.priority = patch.priority;

    const response = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task "${id}" (HTTP ${response.status}).`);
    }

    const payload: unknown = await response.json();
    if (!isTaskDto(payload)) {
      throw new Error('Unexpected update-task response format.');
    }

    return mapDtoToTask(payload);
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task "${id}" (HTTP ${response.status}).`);
    }
  }
}
