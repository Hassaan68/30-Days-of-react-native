import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CreateTaskInput,
  Task,
  TaskFilterOptions,
  TaskPriority,
  TaskSortBy,
  TaskStatusFilter,
  UpdateTaskInput,
} from '../types/task';

interface PersistedTaskState {
  readonly tasks: Task[];
}

export interface TaskStore extends PersistedTaskState {
  readonly filters: TaskFilterOptions;
  readonly addTask: (input: CreateTaskInput) => Task | null;
  readonly toggleTask: (id: string) => void;
  readonly updateTask: (id: string, patch: UpdateTaskInput) => void;
  readonly deleteTask: (id: string) => void;
  readonly clearCompleted: () => void;
  readonly setStatusFilter: (status: TaskStatusFilter) => void;
  readonly setPriorityFilter: (priority: TaskPriority | 'all') => void;
  readonly setSearchQuery: (searchQuery: string) => void;
  readonly setSortBy: (sortBy: TaskSortBy) => void;
  readonly resetFilters: () => void;
}

const DEFAULT_FILTERS: TaskFilterOptions = {
  status: 'all',
  priority: 'all',
  searchQuery: '',
  sortBy: 'createdAt',
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Review React Native New Architecture checklist',
    notes: 'Verify native modules and test cold startup on Android & iOS.',
    priority: 'high',
    category: 'Work',
    completed: false,
    dueDate: '2026-12-01T17:00:00.000Z',
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'seed-2',
    title: 'Write unit tests for task filtering helpers',
    notes: 'Cover sorting by priority, due date, and overdue edge cases.',
    priority: 'medium',
    category: 'Learning',
    completed: true,
    createdAt: '2026-11-21T11:30:00.000Z',
    updatedAt: '2026-11-21T14:00:00.000Z',
  },
  {
    id: 'seed-3',
    title: 'Plan weekend hike & pack gear',
    priority: 'low',
    category: 'Personal',
    completed: false,
    createdAt: '2026-11-22T08:15:00.000Z',
    updatedAt: '2026-11-22T08:15:00.000Z',
  },
];

function createTaskId(): string {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `task-${Date.now()}-${randomSuffix}`;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      filters: DEFAULT_FILTERS,

      addTask: (input) => {
        const trimmedTitle = input.title.trim();
        if (trimmedTitle.length === 0) {
          return null;
        }

        const now = new Date().toISOString();
        const trimmedNotes = input.notes?.trim();
        const newTask: Task = {
          id: createTaskId(),
          title: trimmedTitle,
          ...(trimmedNotes ? { notes: trimmedNotes } : {}),
          priority: input.priority ?? 'medium',
          category: input.category?.trim() || 'General',
          completed: false,
          ...(input.dueDate ? { dueDate: input.dueDate } : {}),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        return newTask;
      },

      toggleTask: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: now }
              : task,
          ),
        }));
      },

      updateTask: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }
            const nextTitle =
              patch.title !== undefined ? patch.title.trim() : task.title;
            return {
              ...task,
              ...patch,
              title: nextTitle.length > 0 ? nextTitle : task.title,
              updatedAt: now,
            };
          }),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      },

      setStatusFilter: (status) => {
        set((state) => ({
          filters: { ...state.filters, status },
        }));
      },

      setPriorityFilter: (priority) => {
        set((state) => ({
          filters: { ...state.filters, priority },
        }));
      },

      setSearchQuery: (searchQuery) => {
        set((state) => ({
          filters: { ...state.filters, searchQuery },
        }));
      },

      setSortBy: (sortBy) => {
        set((state) => ({
          filters: { ...state.filters, sortBy },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },
    }),
    {
      name: 'project-03-task-manager-v1',
      storage: createJSONStorage<PersistedTaskState>(() => AsyncStorage),
      partialize: (state): PersistedTaskState => ({
        tasks: state.tasks,
      }),
    },
  ),
);
