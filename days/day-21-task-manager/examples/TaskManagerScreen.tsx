import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  filterTasks,
  getTaskStats,
  sortTasks,
  validateCreateTaskInput,
  type CreateTaskInput,
  type Task,
  type TaskFilter,
  type TaskPriority,
  type TaskSortBy,
} from './taskHelpers';

interface TaskStoreState {
  tasks: Task[];
  filter: TaskFilter;
  sortBy: TaskSortBy;
  searchQuery: string;
  addTask: (input: CreateTaskInput) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: TaskFilter) => void;
  setSortBy: (sortBy: TaskSortBy) => void;
  setSearchQuery: (query: string) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: 'all',
      sortBy: 'priority',
      searchQuery: '',
      addTask: (input) =>
        set((state) => ({
          tasks: [
            {
              id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: input.title,
              notes: input.notes,
              priority: input.priority,
              dueDate: input.dueDate,
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        })),
      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        })),
      setFilter: (filter) => set({ filter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'day21-task-manager-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        filter: state.filter,
        sortBy: state.sortBy,
      }),
    },
  ),
);

const PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'];
const FILTERS: readonly TaskFilter[] = ['all', 'active', 'completed'];
const SORT_OPTIONS: readonly { value: TaskSortBy; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'newest', label: 'Newest' },
];

export function TaskManagerScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);
  const sortBy = useTaskStore((state) => state.sortBy);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const clearCompleted = useTaskStore((state) => state.clearCompleted);
  const setFilter = useTaskStore((state) => state.setFilter);
  const setSortBy = useTaskStore((state) => state.setSortBy);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);

  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [formError, setFormError] = useState<string | null>(null);

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filter, searchQuery), sortBy),
    [tasks, filter, searchQuery, sortBy],
  );

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const handleCreateTask = (): void => {
    const validation = validateCreateTaskInput({
      title,
      priority,
      dueDate,
    });

    if (!validation.ok) {
      setFormError(validation.error);
      return;
    }

    addTask(validation.data);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setFormError(null);
  };

  const renderTaskItem = ({ item }: ListRenderItemInfo<Task>) => (
    <View style={styles.taskCard}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Toggle ${item.title}`}
        accessibilityState={{ checked: item.completed }}
        onPress={() => toggleTask(item.id)}
        style={styles.taskContent}
      >
        <View style={[styles.checkbox, item.completed ? styles.checkboxChecked : undefined]}>
          <Text style={styles.checkboxMark}>{item.completed ? '✓' : ''}</Text>
        </View>
        <View style={styles.taskMeta}>
          <Text style={[styles.taskTitle, item.completed ? styles.taskTitleDone : undefined]}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.priorityTag, getPriorityStyle(item.priority)]}>
              {item.priority.toUpperCase()}
            </Text>
            {item.dueDate ? <Text style={styles.dueDateText}>Due {item.dueDate}</Text> : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
        onPress={() => deleteTask(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Task Manager</Text>
        <Text style={styles.statsText}>
          {stats.active} active · {stats.completed} done ({stats.completionRate}%)
        </Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          accessibilityLabel="Task title"
          onChangeText={setTitle}
          placeholder="Add a new task..."
          style={styles.input}
          value={title}
        />

        <TextInput
          accessibilityLabel="Due date"
          onChangeText={setDueDate}
          placeholder="Optional due date (YYYY-MM-DD)"
          style={styles.input}
          value={dueDate}
        />

        <View style={styles.pillRow}>
          {PRIORITIES.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`Priority ${option}`}
              onPress={() => setPriority(option)}
              style={[styles.pill, priority === option ? styles.pillSelected : undefined]}
            >
              <Text style={[styles.pillText, priority === option ? styles.pillTextSelected : undefined]}>
                {option.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {formError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {formError}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add task"
          onPress={handleCreateTask}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Add Task</Text>
        </Pressable>
      </View>

      <TextInput
        accessibilityLabel="Search tasks"
        onChangeText={setSearchQuery}
        placeholder="Search tasks..."
        style={styles.searchInput}
        value={searchQuery}
      />

      <View style={styles.controlsRow}>
        <View style={styles.pillRow}>
          {FILTERS.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${item}`}
              onPress={() => setFilter(item)}
              style={[styles.pill, filter === item ? styles.pillSelected : undefined]}
            >
              <Text style={[styles.pillText, filter === item ? styles.pillTextSelected : undefined]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {stats.completed > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear completed tasks"
            onPress={clearCompleted}
          >
            <Text style={styles.clearLink}>Clear Done</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.pillRow}>
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${option.label}`}
            onPress={() => setSortBy(option.value)}
            style={[styles.pill, sortBy === option.value ? styles.pillSelected : undefined]}
          >
            <Text
              style={[
                styles.pillText,
                sortBy === option.value ? styles.pillTextSelected : undefined,
              ]}
            >
              Sort: {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks match your view</Text>
            <Text style={styles.emptySubtitle}>
              Add a task above or switch filters to see your full list.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getPriorityStyle(priority: TaskPriority) {
  if (priority === 'high') {
    return styles.priorityHigh;
  }
  if (priority === 'medium') {
    return styles.priorityMedium;
  }
  return styles.priorityLow;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    paddingTop: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  statsText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  pillSelected: {
    backgroundColor: '#2563eb',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    gap: 10,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  taskMeta: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  priorityLow: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  dueDateText: {
    fontSize: 12,
    color: '#64748b',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default TaskManagerScreen;
