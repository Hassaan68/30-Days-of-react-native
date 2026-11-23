import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { HabitCard } from '../components/HabitCard';
import {
  calculateCurrentStreak,
  computeDashboardSummary,
  filterHabits,
  isCompletedOnDate,
} from '../features/habits/habitAnalytics';
import { toDateKey, type Habit, type HabitFilter } from '../features/habits/types';
import { useHabitStore } from '../features/habits/useHabitStore';

export interface DashboardScreenProps {
  onCreatePress?: () => void;
}

const FILTER_OPTIONS: readonly { value: HabitFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function DashboardScreen({ onCreatePress }: DashboardScreenProps) {
  const habits = useHabitStore((state) => state.habits);
  const filter = useHabitStore((state) => state.filter);
  const searchQuery = useHabitStore((state) => state.searchQuery);
  const isHydrated = useHabitStore((state) => state.isHydrated);
  const isLoading = useHabitStore((state) => state.isLoading);
  const error = useHabitStore((state) => state.error);
  const hydrate = useHabitStore((state) => state.hydrate);
  const toggleHabitCompletion = useHabitStore((state) => state.toggleHabitCompletion);
  const archiveHabit = useHabitStore((state) => state.archiveHabit);
  const setFilter = useHabitStore((state) => state.setFilter);
  const setSearchQuery = useHabitStore((state) => state.setSearchQuery);
  const clearError = useHabitStore((state) => state.clearError);

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [isHydrated, hydrate]);

  const todayKey = useMemo(() => toDateKey(), []);

  const summary = useMemo(() => computeDashboardSummary(habits, todayKey), [habits, todayKey]);

  const visibleHabits = useMemo(
    () => filterHabits(habits, filter, todayKey, searchQuery),
    [habits, filter, todayKey, searchQuery],
  );

  const handleToggle = useCallback(
    (habitId: string) => {
      void Haptics.selectionAsync().catch(() => {
        // Ignore haptics errors on platforms where haptic engines are unavailable.
      });
      void toggleHabitCompletion(habitId, todayKey);
    },
    [toggleHabitCompletion, todayKey],
  );

  const handleArchive = useCallback(
    (habitId: string) => {
      void archiveHabit(habitId);
    },
    [archiveHabit],
  );

  const handleRefresh = useCallback(() => {
    void hydrate();
  }, [hydrate]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  const renderHabitItem = useCallback(
    ({ item }: ListRenderItemInfo<Habit>) => (
      <HabitCard
        habit={item}
        isCompletedToday={isCompletedOnDate(item, todayKey)}
        currentStreak={calculateCurrentStreak(item.completedDates, todayKey)}
        onToggle={handleToggle}
        onArchive={handleArchive}
      />
    ),
    [todayKey, handleToggle, handleArchive],
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.brandTag}>PULSETRACK</Text>
          <Text style={styles.title} accessibilityRole="header">
            Today&apos;s Focus
          </Text>
        </View>
        {onCreatePress ? (
          <Pressable
            onPress={onCreatePress}
            style={({ pressed }) => [
              styles.addButton,
              pressed ? styles.addButtonPressed : undefined,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create new habit"
          >
            <Text style={styles.addButtonText}>+ New Habit</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={clearError} accessibilityRole="button" accessibilityLabel="Dismiss">
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.completionRate}%</Text>
          <Text style={styles.metricLabel}>
            {summary.completedToday}/{summary.totalHabits} Done
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.totalFocusMinutesToday}m</Text>
          <Text style={styles.metricLabel}>Focus Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.bestStreak}d</Text>
          <Text style={styles.metricLabel}>Best Streak</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search habits or categories…"
        placeholderTextColor="#94A3B8"
        clearButtonMode="while-editing"
        accessibilityLabel="Search habits"
      />

      <View style={styles.filterRow} accessibilityRole="tablist">
        {FILTER_OPTIONS.map((option) => {
          const selected = filter === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setFilter(option.value)}
              style={[styles.filterChip, selected ? styles.filterChipSelected : undefined]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selected ? styles.filterChipTextSelected : undefined,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (!isHydrated && isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your habits…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        data={visibleHabits}
        keyExtractor={keyExtractor}
        renderItem={renderHabitItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No habits match this view</Text>
            <Text style={styles.emptySubtitle}>
              Try switching filters, clearing your search query, or creating a new habit.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#2563EB" />
        }
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#475569',
  },
  listContent: {
    padding: 20,
    paddingBottom: 36,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#2563EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 14,
  },
  dismissText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    fontSize: 15,
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  separator: {
    height: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
});
