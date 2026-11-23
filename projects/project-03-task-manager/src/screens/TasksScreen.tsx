import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTaskStore } from '../store/useTaskStore';
import type {
  Task,
  TaskPriority,
  TaskSortBy,
  TaskStatusFilter,
} from '../types/task';
import {
  computeTaskSummary,
  filterAndSortTasks,
  isTaskOverdue,
} from '../utils/taskFilters';

const PRIORITIES: readonly TaskPriority[] = ['high', 'medium', 'low'];
const CATEGORIES: readonly string[] = ['Work', 'Personal', 'Learning'];
const STATUS_TABS: readonly { readonly value: TaskStatusFilter; readonly label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];
const SORT_OPTIONS: readonly { readonly value: TaskSortBy; readonly label: string }[] = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
];

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#B91C1C' },
  medium: { bg: '#FEF3C7', text: '#B45309' },
  low: { bg: '#DCFCE7', text: '#15803D' },
};

export function TasksScreen(): React.JSX.Element {
  const tasks = useTaskStore((state) => state.tasks);
  const filters = useTaskStore((state) => state.filters);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const clearCompleted = useTaskStore((state) => state.clearCompleted);
  const setStatusFilter = useTaskStore((state) => state.setStatusFilter);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const setSortBy = useTaskStore((state) => state.setSortBy);
  const resetFilters = useTaskStore((state) => state.resetFilters);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftPriority, setDraftPriority] = useState<TaskPriority>('medium');
  const [draftCategory, setDraftCategory] = useState('Work');
  const [validationError, setValidationError] = useState<string | null>(null);

  const summary = useMemo(() => computeTaskSummary(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, filters),
    [tasks, filters],
  );

  const handleAddTask = (): void => {
    const trimmed = draftTitle.trim();
    if (trimmed.length === 0) {
      setValidationError('Enter a task title before adding.');
      return;
    }

    addTask({
      title: trimmed,
      priority: draftPriority,
      category: draftCategory,
    });
    setDraftTitle('');
    setValidationError(null);
  };

  const renderTaskItem = ({ item }: { item: Task }): React.JSX.Element => {
    const badgeColors = PRIORITY_COLORS[item.priority];
    const overdue = isTaskOverdue(item);

    return (
      <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
        <Pressable
          onPress={() => toggleTask(item.id)}
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark "${item.title}" as ${
            item.completed ? 'incomplete' : 'completed'
          }`}
          accessibilityState={{ checked: item.completed }}
          style={[
            styles.checkbox,
            item.completed && styles.checkboxChecked,
          ]}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.taskBody}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.taskTitleCompleted,
            ]}
          >
            {item.title}
          </Text>

          {item.notes !== undefined && (
            <Text style={styles.taskNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          <View style={styles.taskMetaRow}>
            <View style={[styles.priorityPill, { backgroundColor: badgeColors.bg }]}>
              <Text style={[styles.priorityPillText, { color: badgeColors.text }]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category}</Text>
            </View>
            {overdue && (
              <View style={styles.overduePill}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => deleteTask(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete "${item.title}"`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header & Progress */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.screenTitle}>Task Manager</Text>
              <Text style={styles.summarySubtitle}>
                {summary.active} active · {summary.completed} done ·{' '}
                {summary.highPriorityActive} high priority
              </Text>
            </View>
            <Text style={styles.completionPercent}>
              {summary.completionRate}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${summary.completionRate}%` },
              ]}
            />
          </View>
        </View>

        {/* Quick Add Composer */}
        <View style={styles.composerCard}>
          <View style={styles.inputRow}>
            <TextInput
              value={draftTitle}
              onChangeText={(text) => {
                setDraftTitle(text);
                if (validationError !== null) {
                  setValidationError(null);
                }
              }}
              onSubmitEditing={handleAddTask}
              placeholder="Add a new task…"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              style={styles.input}
              accessibilityLabel="New task title"
            />
            <Pressable
              onPress={handleAddTask}
              accessibilityRole="button"
              accessibilityLabel="Add task"
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {validationError !== null && (
            <Text style={styles.validationError}>{validationError}</Text>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.composerChips}
          >
            {PRIORITIES.map((priority) => {
              const selected = draftPriority === priority;
              return (
                <Pressable
                  key={priority}
                  onPress={() => setDraftPriority(priority)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextActive]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.chipDivider} />

            {CATEGORIES.map((category) => {
              const selected = draftCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setDraftCategory(category)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={[styles.chip, selected && styles.chipSecondaryActive]}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextActive]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Search & Filter Controls */}
        <View style={styles.controlsSection}>
          <TextInput
            value={filters.searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks, notes, or categories…"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            accessibilityLabel="Search tasks"
          />

          <View style={styles.filterBar}>
            <View style={styles.statusGroup}>
              {STATUS_TABS.map((tab) => {
                const active = filters.status === tab.value;
                return (
                  <Pressable
                    key={tab.value}
                    onPress={() => setStatusFilter(tab.value)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.statusTab,
                      active && styles.statusTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTabText,
                        active && styles.statusTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sortGroup}>
              {SORT_OPTIONS.map((option) => {
                const active = filters.sortBy === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.sortPill, active && styles.sortPillActive]}
                  >
                    <Text
                      style={[
                        styles.sortPillText,
                        active && styles.sortPillTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Task List */}
        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks match your view</Text>
              <Text style={styles.emptySubtitle}>
                Add a new task above or clear your active search and filters.
              </Text>
              <Pressable
                onPress={resetFilters}
                accessibilityRole="button"
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </Pressable>
            </View>
          }
          ListFooterComponent={
            summary.completed > 0 ? (
              <Pressable
                onPress={clearCompleted}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.clearCompletedButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.clearCompletedText}>
                  Clear {summary.completed} Completed{' '}
                  {summary.completed === 1 ? 'Task' : 'Tasks'}
                </Text>
              </Pressable>
            ) : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  completionPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#38BDF8',
  },
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  validationError: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  composerChips: {
    gap: 6,
    alignItems: 'center',
  },
  chipDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipSecondaryActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  controlsSection: {
    gap: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  filterBar: {
    gap: 8,
  },
  statusGroup: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusTabActive: {
    backgroundColor: '#FFFFFF',
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  statusTabTextActive: {
    color: '#0F172A',
  },
  sortGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortPillActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sortPillTextActive: {
    color: '#1D4ED8',
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    opacity: 0.72,
    backgroundColor: '#F8FAFC',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  taskBody: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskNotes: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  taskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  overduePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  clearCompletedButton: {
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  clearCompletedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pressed: {
    opacity: 0.75,
  },
});
