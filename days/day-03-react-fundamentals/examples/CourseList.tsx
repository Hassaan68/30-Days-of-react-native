import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface Course {
  readonly id: string;
  title: string;
  dayNumber: number;
  completed: boolean;
}

type FilterOption = 'all' | 'active' | 'completed';

const INITIAL_COURSES: readonly Course[] = [
  { id: 'c-1', title: 'Introduction to React Native', dayNumber: 1, completed: true },
  { id: 'c-2', title: 'TypeScript for Mobile Apps', dayNumber: 2, completed: true },
  { id: 'c-3', title: 'React Fundamentals', dayNumber: 3, completed: false },
  { id: 'c-4', title: 'React Hooks Deep Dive', dayNumber: 4, completed: false },
];

const FILTER_OPTIONS: readonly FilterOption[] = ['all', 'active', 'completed'];

interface CourseRowProps {
  course: Course;
  onToggle: (id: string) => void;
}

function CourseRow({ course, onToggle }: CourseRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mark ${course.title} as ${course.completed ? 'incomplete' : 'completed'}`}
      onPress={() => onToggle(course.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.checkbox, course.completed && styles.checkboxChecked]}>
        {course.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.dayLabel}>Day {String(course.dayNumber).padStart(2, '0')}</Text>
        <Text style={[styles.courseTitle, course.completed && styles.courseTitleCompleted]}>
          {course.title}
        </Text>
      </View>
    </Pressable>
  );
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([...INITIAL_COURSES]);
  const [filter, setFilter] = useState<FilterOption>('all');

  const handleToggleCourse = (courseId: string): void => {
    setCourses((previous) =>
      previous.map((course) =>
        course.id === courseId ? { ...course, completed: !course.completed } : course,
      ),
    );
  };

  // Derived values computed cleanly during render.
  const completedCount = courses.filter((course) => course.completed).length;
  const visibleCourses = courses.filter((course) => {
    if (filter === 'active') {
      return !course.completed;
    }
    if (filter === 'completed') {
      return course.completed;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Curriculum Checklist</Text>
      <Text style={styles.progressText}>
        {completedCount} of {courses.length} lessons completed
      </Text>

      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = filter === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${option} lessons`}
              onPress={() => setFilter(option)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visibleCourses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No lessons match the &ldquo;{filter}&rdquo; filter.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visibleCourses.map((course) => (
            <CourseRow key={course.id} course={course} onToggle={handleToggleCourse} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressText: {
    fontSize: 14,
    color: '#475569',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
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
  rowBody: {
    flex: 1,
    gap: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  courseTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  emptyBox: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default CourseList;
