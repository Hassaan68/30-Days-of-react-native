import type { Task, TaskFilterOptions } from '../types/task';
import {
  computeTaskSummary,
  filterAndSortTasks,
  groupTasksByCategory,
  isTaskOverdue,
} from './taskFilters';

const SAMPLE_TASKS: readonly Task[] = [
  {
    id: 't1',
    title: 'Ship onboarding polish',
    notes: 'Check VoiceOver focus order on iOS',
    priority: 'medium',
    category: 'Work',
    completed: false,
    dueDate: '2026-11-28T12:00:00.000Z',
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 't2',
    title: 'Fix offline cache migration',
    notes: 'Critical for SDK 58 release',
    priority: 'high',
    category: 'Work',
    completed: false,
    dueDate: '2026-11-24T09:00:00.000Z',
    createdAt: '2026-11-19T08:00:00.000Z',
    updatedAt: '2026-11-19T08:00:00.000Z',
  },
  {
    id: 't3',
    title: 'Buy running shoes',
    priority: 'low',
    category: 'Personal',
    completed: true,
    dueDate: '2026-11-15T10:00:00.000Z',
    createdAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-18T15:00:00.000Z',
  },
  {
    id: 't4',
    title: 'Practice Reanimated spring physics',
    notes: 'Day 15 animation exercises',
    priority: 'high',
    category: 'Learning',
    completed: false,
    createdAt: '2026-11-22T12:00:00.000Z',
    updatedAt: '2026-11-22T12:00:00.000Z',
  },
];

const BASE_OPTIONS: TaskFilterOptions = {
  status: 'all',
  priority: 'all',
  searchQuery: '',
  sortBy: 'createdAt',
};

describe('filterAndSortTasks', () => {
  it('filters tasks by completion status', () => {
    const active = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      status: 'active',
    });
    const completed = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      status: 'completed',
    });

    expect(active.map((task) => task.id)).toEqual(['t4', 't1', 't2']);
    expect(completed.map((task) => task.id)).toEqual(['t3']);
  });

  it('filters tasks by priority', () => {
    const highOnly = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      priority: 'high',
    });

    expect(highOnly.map((task) => task.id)).toEqual(['t4', 't2']);
  });

  it('performs case-insensitive search across title, notes, and category', () => {
    const byNote = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      searchQuery: '  voiceover ',
    });
    const byCategory = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      searchQuery: 'LEARNING',
    });

    expect(byNote.map((task) => task.id)).toEqual(['t1']);
    expect(byCategory.map((task) => task.id)).toEqual(['t4']);
  });

  it('sorts by priority descending with newest createdAt as tie-breaker', () => {
    const sorted = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      sortBy: 'priority',
    });

    expect(sorted.map((task) => task.id)).toEqual(['t4', 't2', 't1', 't3']);
  });

  it('sorts by earliest dueDate first and places tasks without dueDate last', () => {
    const sorted = filterAndSortTasks(SAMPLE_TASKS, {
      ...BASE_OPTIONS,
      sortBy: 'dueDate',
    });

    expect(sorted.map((task) => task.id)).toEqual(['t3', 't2', 't1', 't4']);
  });

  it('does not mutate the original tasks array', () => {
    const copy = [...SAMPLE_TASKS];
    filterAndSortTasks(copy, { ...BASE_OPTIONS, sortBy: 'priority' });

    expect(copy.map((task) => task.id)).toEqual(['t1', 't2', 't3', 't4']);
  });
});

describe('computeTaskSummary', () => {
  it('returns zeroed metrics for an empty list', () => {
    expect(computeTaskSummary([])).toEqual({
      total: 0,
      active: 0,
      completed: 0,
      highPriorityActive: 0,
      completionRate: 0,
    });
  });

  it('calculates totals, active high-priority count, and completion percentage', () => {
    expect(computeTaskSummary(SAMPLE_TASKS)).toEqual({
      total: 4,
      active: 3,
      completed: 1,
      highPriorityActive: 2,
      completionRate: 25,
    });
  });
});

describe('isTaskOverdue', () => {
  const referenceDate = new Date('2026-11-25T00:00:00.000Z');

  it('returns true for an active task whose dueDate is in the past', () => {
    const pastActiveTask = SAMPLE_TASKS[1];
    expect(pastActiveTask).toBeDefined();
    if (pastActiveTask) {
      expect(isTaskOverdue(pastActiveTask, referenceDate)).toBe(true);
    }
  });

  it('returns false for completed tasks even if dueDate is in the past', () => {
    const pastCompletedTask = SAMPLE_TASKS[2];
    expect(pastCompletedTask).toBeDefined();
    if (pastCompletedTask) {
      expect(isTaskOverdue(pastCompletedTask, referenceDate)).toBe(false);
    }
  });

  it('returns false for tasks with future dueDate or no dueDate', () => {
    const futureTask = SAMPLE_TASKS[0];
    const noDueDateTask = SAMPLE_TASKS[3];
    expect(futureTask).toBeDefined();
    expect(noDueDateTask).toBeDefined();

    if (futureTask && noDueDateTask) {
      expect(isTaskOverdue(futureTask, referenceDate)).toBe(false);
      expect(isTaskOverdue(noDueDateTask, referenceDate)).toBe(false);
    }
  });
});

describe('groupTasksByCategory', () => {
  it('groups tasks cleanly by category', () => {
    const grouped = groupTasksByCategory(SAMPLE_TASKS);

    expect(Object.keys(grouped).sort()).toEqual(['Learning', 'Personal', 'Work']);
    expect(grouped['Work']?.map((task) => task.id)).toEqual(['t1', 't2']);
    expect(grouped['Personal']?.map((task) => task.id)).toEqual(['t3']);
    expect(grouped['Learning']?.map((task) => task.id)).toEqual(['t4']);
  });
});
