import React, { Component, useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import {
  calculateCurrentStreak,
  calculateDailySummary,
  type FocusSession,
  type HabitCategory,
  type HabitItem,
} from './habitStats';

const TODAY_KEY = '2026-11-23';

const INITIAL_HABITS: readonly HabitItem[] = [
  {
    id: 'habit-focus',
    title: '45m Deep Focus Sprint',
    category: 'focus',
    targetMinutesPerDay: 45,
    completedDates: ['2026-11-21', '2026-11-22', TODAY_KEY],
  },
  {
    id: 'habit-learn',
    title: 'Study Architecture & Testing',
    category: 'learning',
    targetMinutesPerDay: 30,
    completedDates: ['2026-11-22'],
  },
  {
    id: 'habit-walk',
    title: 'Evening Walk (No Phone)',
    category: 'health',
    targetMinutesPerDay: 20,
    completedDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
  },
];

const INITIAL_SESSIONS: readonly FocusSession[] = [
  {
    id: 'session-1',
    habitId: 'habit-focus',
    durationMinutes: 45,
    completedAtIso: '2026-11-23T09:15:00Z',
  },
];

const NewHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Habit name must be at least 3 characters.')
    .max(60, 'Habit name must be 60 characters or fewer.'),
});

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.fallbackContainer} accessibilityRole="alert">
          <Text style={styles.fallbackTitle}>Something went wrong</Text>
          <Text style={styles.fallbackBody}>
            PulseTrack hit an unexpected error while rendering your dashboard.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reload dashboard"
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

function DashboardContent(): React.JSX.Element {
  const [habits, setHabits] = useState<readonly HabitItem[]>(INITIAL_HABITS);
  const [sessions] = useState<readonly FocusSession[]>(INITIAL_SESSIONS);
  const [draftTitle, setDraftTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const summary = useMemo(
    () => calculateDailySummary(habits, sessions, TODAY_KEY),
    [habits, sessions],
  );

  const handleToggleHabit = useCallback((habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }
        const isDoneToday = habit.completedDates.includes(TODAY_KEY);
        const nextDates = isDoneToday
          ? habit.completedDates.filter((date) => date !== TODAY_KEY)
          : [...habit.completedDates, TODAY_KEY];
        return { ...habit, completedDates: nextDates };
      }),
    );
  }, []);

  const handleCreateHabit = useCallback(() => {
    const parsed = NewHabitSchema.safeParse({ title: draftTitle });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setFormError(firstIssue?.message ?? 'Please enter a valid habit name.');
      return;
    }

    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      title: parsed.data.title,
      category: 'focus' satisfies HabitCategory,
      targetMinutesPerDay: 25,
      completedDates: [],
    };

    setHabits((prev) => [newHabit, ...prev]);
    setDraftTitle('');
    setFormError(null);
  }, [draftTitle]);

  const renderHabitItem: ListRenderItem<HabitItem> = useCallback(
    ({ item }) => {
      const isDoneToday = item.completedDates.includes(TODAY_KEY);
      const streak = calculateCurrentStreak(item.completedDates, TODAY_KEY);

      return (
        <Pressable
          onPress={() => handleToggleHabit(item.id)}
          style={({ pressed }) => [
            styles.habitRow,
            isDoneToday && styles.habitRowCompleted,
            pressed && styles.habitRowPressed,
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDoneToday }}
          accessibilityLabel={`${item.title}, ${streak} day streak`}
          accessibilityHint="Double tap to toggle today's completion"
        >
          <View style={styles.habitTextGroup}>
            <Text style={styles.habitTitle}>{item.title}</Text>
            <Text style={styles.habitMeta}>
              {item.category.toUpperCase()} • {item.targetMinutesPerDay}m goal • {streak}d streak
            </Text>
          </View>
          <View style={[styles.checkBadge, isDoneToday && styles.checkBadgeDone]}>
            <Text style={[styles.checkBadgeText, isDoneToday && styles.checkBadgeTextDone]}>
              {isDoneToday ? 'Done' : 'Check'}
            </Text>
          </View>
        </Pressable>
      );
    },
    [handleToggleHabit],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.brand} accessibilityRole="header">
          PulseTrack
        </Text>
        <Text style={styles.subtitle}>Daily Habit & Focus Dashboard</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard} accessible>
          <Text style={styles.metricValue}>{summary.completionRatePercent}%</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        <View style={styles.metricCard} accessible>
          <Text style={styles.metricValue}>{summary.longestActiveStreak}d</Text>
          <Text style={styles.metricLabel}>Best Streak</Text>
        </View>
        <View style={styles.metricCard} accessible>
          <Text style={styles.metricValue}>{summary.totalFocusMinutes}m</Text>
          <Text style={styles.metricLabel}>Focus Time</Text>
        </View>
      </View>

      <View style={styles.addForm}>
        <TextInput
          value={draftTitle}
          onChangeText={(text) => {
            setDraftTitle(text);
            if (formError) {
              setFormError(null);
            }
          }}
          placeholder="Add a daily habit (e.g., 20m Reading)"
          placeholderTextColor="#64748B"
          style={styles.input}
          accessibilityLabel="New habit name"
          returnKeyType="done"
          onSubmitEditing={handleCreateHabit}
        />
        <Pressable
          onPress={handleCreateHabit}
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel="Add habit"
        >
          <Text style={styles.primaryButtonText}>Add</Text>
        </Pressable>
      </View>

      {formError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits yet. Add your first habit above!</Text>
        }
      />
    </SafeAreaView>
  );
}

export function HabitDashboardScreen(): React.JSX.Element {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}

export default HabitDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  addForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  primaryButton: {
    minHeight: 44,
    minWidth: 68,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 8,
  },
  listContent: {
    paddingVertical: 8,
    gap: 10,
  },
  habitRow: {
    minHeight: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  habitRowCompleted: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  habitRowPressed: {
    opacity: 0.85,
  },
  habitTextGroup: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  habitMeta: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  checkBadge: {
    minHeight: 36,
    minWidth: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  checkBadgeDone: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  checkBadgeTextDone: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 24,
    fontSize: 14,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  fallbackBody: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
});
