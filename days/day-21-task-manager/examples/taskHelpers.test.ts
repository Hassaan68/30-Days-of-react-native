import {
  filterTasks,
  getTaskStats,
  sortTasks,
  validateCreateTaskInput,
  type Task,
} from './taskHelpers';

const SAMPLE_TASKS: readonly Task[] = [
  {
    id: 't1',
    title: 'Write unit tests for Task Manager',
    notes: 'Cover sorting and filtering edge cases',
    priority: 'high',
    dueDate: '2026-11-26',
    completed: false,
    createdAt: '2026-11-23T09:00:00.000Z',
  },
  {
    id: 't2',
    title: 'Polish empty state illustration',
    priority: 'low',
    completed: true,
    createdAt: '2026-11-22T14:00:00.000Z',
  },
  {
    id: 't3',
    title: 'Configure AsyncStorage persistence',
    priority: 'medium',
    dueDate: '2026-11-24',
    completed: false,
    createdAt: '2026-11-23T11:30:00.000Z',
  },
];

describe('validateCreateTaskInput', () => {
  it('accepts valid input and trims whitespace', () => {
    const result = validateCreateTaskInput({
      title: '  Ship Week 3 capstone  ',
      notes: '  Verify Android & iOS  ',
      priority: 'high',
      dueDate: '2026-11-30',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        title: 'Ship Week 3 capstone',
        notes: 'Verify Android & iOS',
        priority: 'high',
        dueDate: '2026-11-30',
      },
    });
  });

  it('normalizes blank optional fields to undefined', () => {
    const result = validateCreateTaskInput({
      title: 'Quick task',
      notes: '   ',
      priority: 'low',
      dueDate: '',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        title: 'Quick task',
        notes: undefined,
        priority: 'low',
        dueDate: undefined,
      },
    });
  });

  it('rejects titles shorter than 2 characters and invalid date formats', () => {
    const shortTitle = validateCreateTaskInput({ title: 'A', priority: 'medium' });
    expect(shortTitle.ok).toBe(false);

    const badDate = validateCreateTaskInput({
      title: 'Valid title',
      priority: 'medium',
      dueDate: '11/30/2026',
    });
    expect(badDate).toEqual({
      ok: false,
      error: 'Due date must use YYYY-MM-DD format.',
    });
  });
});

describe('filterTasks', () => {
  it('filters by all, active, and completed status', () => {
    expect(filterTasks(SAMPLE_TASKS, 'all').map((t) => t.id)).toEqual(['t1', 't2', 't3']);
    expect(filterTasks(SAMPLE_TASKS, 'active').map((t) => t.id)).toEqual(['t1', 't3']);
    expect(filterTasks(SAMPLE_TASKS, 'completed').map((t) => t.id)).toEqual(['t2']);
  });

  it('matches case-insensitive search queries across title and notes', () => {
    expect(filterTasks(SAMPLE_TASKS, 'all', 'asyncstorage').map((t) => t.id)).toEqual(['t3']);
    expect(filterTasks(SAMPLE_TASKS, 'all', 'EDGE CASES').map((t) => t.id)).toEqual(['t1']);
  });
});

describe('sortTasks', () => {
  it('sorts by priority (high -> medium -> low) without mutating input', () => {
    const originalOrder = SAMPLE_TASKS.map((t) => t.id);
    const sorted = sortTasks(SAMPLE_TASKS, 'priority');

    expect(sorted.map((t) => t.id)).toEqual(['t1', 't3', 't2']);
    expect(SAMPLE_TASKS.map((t) => t.id)).toEqual(originalOrder);
  });

  it('sorts by earliest due date first and places undated tasks last', () => {
    const sorted = sortTasks(SAMPLE_TASKS, 'dueDate');
    expect(sorted.map((t) => t.id)).toEqual(['t3', 't1', 't2']);
  });

  it('sorts by newest createdAt timestamp descending', () => {
    const sorted = sortTasks(SAMPLE_TASKS, 'newest');
    expect(sorted.map((t) => t.id)).toEqual(['t3', 't1', 't2']);
  });
});

describe('getTaskStats', () => {
  it('returns zeroed stats for an empty task list', () => {
    expect(getTaskStats([])).toEqual({
      total: 0,
      active: 0,
      completed: 0,
      completionRate: 0,
    });
  });

  it('computes accurate active, completed, and percentage stats', () => {
    expect(getTaskStats(SAMPLE_TASKS)).toEqual({
      total: 3,
      active: 2,
      completed: 1,
      completionRate: 33,
    });
  });
});
