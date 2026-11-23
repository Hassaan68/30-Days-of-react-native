import {
  calculateCurrentStreak,
  calculateLongestStreak,
  computeDashboardSummary,
  filterHabits,
  toggleHabitDate,
} from './habitAnalytics';
import type { Habit } from './types';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    title: 'Deep Work Sprint',
    notes: 'Ship core feature without distractions',
    category: 'focus',
    frequency: 'daily',
    targetMinutes: 45,
    completedDates: [],
    createdAt: '2026-11-01T08:00:00.000Z',
    archived: false,
    ...overrides,
  };
}

describe('toggleHabitDate', () => {
  it('adds a date in sorted order and removes it when toggled again', () => {
    const added = toggleHabitDate(['2026-11-23', '2026-11-20'], '2026-11-21');
    expect(added).toEqual(['2026-11-20', '2026-11-21', '2026-11-23']);

    const removed = toggleHabitDate(added, '2026-11-21');
    expect(removed).toEqual(['2026-11-20', '2026-11-23']);
  });
});

describe('calculateCurrentStreak', () => {
  it('counts consecutive days ending on the reference date', () => {
    const dates = ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'];
    expect(calculateCurrentStreak(dates, '2026-11-23')).toBe(4);
  });

  it('preserves an active streak if yesterday was completed and today is still pending', () => {
    const dates = ['2026-11-21', '2026-11-22'];
    expect(calculateCurrentStreak(dates, '2026-11-23')).toBe(2);
  });

  it('resets to zero when neither today nor yesterday was completed', () => {
    const dates = ['2026-11-19', '2026-11-20'];
    expect(calculateCurrentStreak(dates, '2026-11-23')).toBe(0);
  });
});

describe('calculateLongestStreak', () => {
  it('finds the longest consecutive run across month boundaries and duplicates', () => {
    const dates = [
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-01',
      '2026-11-02',
      '2026-11-10',
      '2026-11-11',
    ];
    expect(calculateLongestStreak(dates)).toBe(4);
  });

  it('returns 0 when no completion dates are recorded', () => {
    expect(calculateLongestStreak([])).toBe(0);
  });
});

describe('computeDashboardSummary', () => {
  it('computes today progress, focus minutes, and best streak while ignoring archived habits', () => {
    const today = '2026-11-23';
    const habits: Habit[] = [
      makeHabit({
        id: 'h1',
        targetMinutes: 45,
        completedDates: ['2026-11-21', '2026-11-22', '2026-11-23'],
      }),
      makeHabit({
        id: 'h2',
        targetMinutes: 25,
        completedDates: ['2026-11-22'],
      }),
      makeHabit({
        id: 'h3',
        targetMinutes: 60,
        completedDates: ['2026-11-23'],
        archived: true,
      }),
    ];

    expect(computeDashboardSummary(habits, today)).toEqual({
      totalHabits: 2,
      completedToday: 1,
      completionRate: 50,
      totalFocusMinutesToday: 45,
      bestStreak: 3,
    });
  });

  it('returns zeroed metrics when there are no active habits', () => {
    expect(computeDashboardSummary([], '2026-11-23')).toEqual({
      totalHabits: 0,
      completedToday: 0,
      completionRate: 0,
      totalFocusMinutesToday: 0,
      bestStreak: 0,
    });
  });
});

describe('filterHabits', () => {
  const today = '2026-11-23';
  const habits: Habit[] = [
    makeHabit({ id: 'done', title: 'Morning Run', category: 'health', completedDates: [today] }),
    makeHabit({ id: 'todo', title: 'TypeScript Study', category: 'learning', completedDates: [] }),
    makeHabit({ id: 'old', title: 'Archived Habit', archived: true, completedDates: [today] }),
  ];

  it('filters by completion status and excludes archived habits', () => {
    expect(filterHabits(habits, 'all', today).map((h) => h.id)).toEqual(['done', 'todo']);
    expect(filterHabits(habits, 'completed', today).map((h) => h.id)).toEqual(['done']);
    expect(filterHabits(habits, 'pending', today).map((h) => h.id)).toEqual(['todo']);
  });

  it('filters case-insensitively across title, notes, and category', () => {
    expect(filterHabits(habits, 'all', today, 'typescript').map((h) => h.id)).toEqual(['todo']);
    expect(filterHabits(habits, 'all', today, 'HEALTH').map((h) => h.id)).toEqual(['done']);
  });
});
