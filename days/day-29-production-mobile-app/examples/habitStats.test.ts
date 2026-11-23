import {
  calculateCurrentStreak,
  calculateDailySummary,
  calculateLongestStreak,
  groupFocusMinutesByCategory,
  parseCalendarDateToUtcDay,
  type FocusSession,
  type HabitItem,
} from './habitStats';

describe('PulseTrack habitStats domain logic', () => {
  describe('parseCalendarDateToUtcDay', () => {
    it('parses valid ISO calendar dates and rejects invalid calendar dates', () => {
      const nov22 = parseCalendarDateToUtcDay('2026-11-22');
      const nov23 = parseCalendarDateToUtcDay('2026-11-23');

      expect(nov22).not.toBeNull();
      expect(nov23).not.toBeNull();
      expect((nov23 ?? 0) - (nov22 ?? 0)).toBe(1);

      expect(parseCalendarDateToUtcDay('2026-02-31')).toBeNull();
      expect(parseCalendarDateToUtcDay('not-a-date')).toBeNull();
    });
  });

  describe('calculateCurrentStreak', () => {
    it('counts consecutive days ending on the reference date and ignores duplicates', () => {
      const dates = ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-22', '2026-11-23'];
      expect(calculateCurrentStreak(dates, '2026-11-23')).toBe(4);
    });

    it('stops counting at a missed day and returns 0 when reference date is not completed', () => {
      expect(calculateCurrentStreak(['2026-11-20', '2026-11-22', '2026-11-23'], '2026-11-23')).toBe(
        2,
      );
      expect(calculateCurrentStreak(['2026-11-21', '2026-11-22'], '2026-11-23')).toBe(0);
    });
  });

  describe('calculateLongestStreak', () => {
    it('finds the longest consecutive historical run across multiple gaps', () => {
      const dates = [
        '2026-10-01',
        '2026-10-02',
        '2026-10-03',
        '2026-10-04',
        '2026-10-10',
        '2026-10-11',
      ];
      expect(calculateLongestStreak(dates)).toBe(4);
      expect(calculateLongestStreak([])).toBe(0);
      expect(calculateLongestStreak(['2026-11-23'])).toBe(1);
    });
  });

  describe('calculateDailySummary & groupFocusMinutesByCategory', () => {
    const sampleHabits: readonly HabitItem[] = [
      {
        id: 'h1',
        title: 'Deep Work Block',
        category: 'focus',
        targetMinutesPerDay: 45,
        completedDates: ['2026-11-21', '2026-11-22', '2026-11-23'],
      },
      {
        id: 'h2',
        title: 'Read React Native Docs',
        category: 'learning',
        targetMinutesPerDay: 30,
        completedDates: ['2026-11-22'],
      },
    ];

    const sampleSessions: readonly FocusSession[] = [
      { id: 's1', habitId: 'h1', durationMinutes: 45, completedAtIso: '2026-11-23T09:00:00Z' },
      { id: 's2', habitId: 'h2', durationMinutes: 25, completedAtIso: '2026-11-23T11:30:00Z' },
      { id: 's3', habitId: 'unknown', durationMinutes: 15, completedAtIso: '2026-11-23T12:00:00Z' },
    ];

    it('aggregates daily completion rate, focus minutes, and longest active streak', () => {
      const summary = calculateDailySummary(sampleHabits, sampleSessions, '2026-11-23');

      expect(summary).toEqual({
        totalHabits: 2,
        completedToday: 1,
        completionRatePercent: 50,
        totalFocusMinutes: 85,
        longestActiveStreak: 3,
      });
    });

    it('handles empty habit lists without dividing by zero', () => {
      expect(calculateDailySummary([], [], '2026-11-23')).toEqual({
        totalHabits: 0,
        completedToday: 0,
        completionRatePercent: 0,
        totalFocusMinutes: 0,
        longestActiveStreak: 0,
      });
    });

    it('groups focus minutes by habit category and ignores orphaned sessions', () => {
      const grouped = groupFocusMinutesByCategory(sampleHabits, sampleSessions);
      expect(grouped).toEqual({
        health: 0,
        learning: 25,
        focus: 45,
        mindfulness: 0,
      });
    });
  });
});
