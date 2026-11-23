import { useCallback, useEffect, useState } from 'react';
import type { CreateTaskInput, Task, TaskRepository } from './taskRepository';

export interface TasksFeatureState {
  tasks: readonly Task[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

/**
 * Feature-layer hook (`src/features/tasks/hooks/useTasksFeature.ts`).
 *
 * Notice how clean the boundary is:
 * - No JSX or React Native styling (belongs in UI components / screens)
 * - No `fetch`, SQL, or storage keys (belongs in the `TaskRepository` implementation)
 * - Easily tested by injecting an `InMemoryTaskRepository`
 */
export function useTasksFeature(repository: TaskRepository): TasksFeatureState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await repository.list();
      setTasks(items);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await repository.list();
        if (!cancelled) {
          setTasks(items);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setError(null);
      try {
        const created = await repository.create(input);
        setTasks((prev) => [created, ...prev]);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    },
    [repository],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const target = tasks.find((task) => task.id === id);
      if (!target) {
        return;
      }

      const nextCompleted = !target.completed;
      setError(null);

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, completed: nextCompleted } : task)),
      );

      try {
        const saved = await repository.update(id, { completed: nextCompleted });
        setTasks((prev) => prev.map((task) => (task.id === id ? saved : task)));
      } catch (err: unknown) {
        // Roll back on failure
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? { ...task, completed: target.completed } : task)),
        );
        setError(getErrorMessage(err));
      }
    },
    [repository, tasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const previous = tasks;
      setError(null);
      setTasks((prev) => prev.filter((task) => task.id !== id));

      try {
        await repository.remove(id);
      } catch (err: unknown) {
        setTasks(previous);
        setError(getErrorMessage(err));
      }
    },
    [repository, tasks],
  );

  return {
    tasks,
    isLoading,
    error,
    refresh,
    createTask,
    toggleTask,
    deleteTask,
  };
}
