import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Habit } from '../features/habits/types';
import { HabitCard } from './HabitCard';

const sampleHabit: Habit = {
  id: 'habit-focus-1',
  title: 'Deep Work Sprint',
  notes: 'Complete one architecture milestone without interruptions.',
  category: 'focus',
  frequency: 'weekdays',
  targetMinutes: 45,
  completedDates: ['2026-11-22'],
  createdAt: '2026-11-01T08:00:00.000Z',
  archived: false,
};

describe('HabitCard', () => {
  it('renders habit details, duration, category, and streak', async () => {
    await render(
      <HabitCard
        habit={sampleHabit}
        isCompletedToday={false}
        currentStreak={3}
        onToggle={jest.fn()}
      />,
    );

    expect(screen.getByText('Deep Work Sprint')).toBeTruthy();
    expect(
      screen.getByText('Complete one architecture milestone without interruptions.'),
    ).toBeTruthy();
    expect(screen.getByText('Focus')).toBeTruthy();
    expect(screen.getByText('45 min')).toBeTruthy();
    expect(screen.getByText('3 day streak')).toBeTruthy();
  });

  it('calls onToggle with the habit id and reflects checked accessibility state', async () => {
    const onToggle = jest.fn();

    await render(
      <HabitCard
        habit={sampleHabit}
        isCompletedToday={true}
        currentStreak={4}
        onToggle={onToggle}
      />,
    );

    const toggleButton = screen.getByTestId('habit-toggle-habit-focus-1');
    expect(toggleButton.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(toggleButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('habit-focus-1');
  });

  it('renders archive action only when onArchive is provided and triggers it on press', async () => {
    const onArchive = jest.fn();

    const { rerender } = await render(
      <HabitCard
        habit={sampleHabit}
        isCompletedToday={false}
        currentStreak={1}
        onToggle={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('habit-archive-habit-focus-1')).toBeNull();

    await rerender(
      <HabitCard
        habit={sampleHabit}
        isCompletedToday={false}
        currentStreak={1}
        onToggle={jest.fn()}
        onArchive={onArchive}
      />,
    );

    const archiveButton = screen.getByTestId('habit-archive-habit-focus-1');
    await fireEvent.press(archiveButton);
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onArchive).toHaveBeenCalledWith('habit-focus-1');
  });
});
