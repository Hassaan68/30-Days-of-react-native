export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  readonly id: string;
  title: string;
  difficulty: Difficulty;
  durationMinutes: number;
  completed: boolean;
}

export const SAMPLE_LESSONS: readonly Lesson[] = [
  {
    id: 'day-01',
    title: 'Introduction to React Native and Expo',
    difficulty: 'beginner',
    durationMinutes: 45,
    completed: true,
  },
  {
    id: 'day-02',
    title: 'JavaScript and TypeScript for React Native',
    difficulty: 'beginner',
    durationMinutes: 60,
    completed: false,
  },
  {
    id: 'day-03',
    title: 'React Fundamentals',
    difficulty: 'beginner',
    durationMinutes: 55,
    completed: false,
  },
  {
    id: 'day-15',
    title: 'Animations with Reanimated',
    difficulty: 'intermediate',
    durationMinutes: 75,
    completed: false,
  },
];

/**
 * Uses destructuring and default parameter values.
 */
export function formatLessonLabel(lesson: Lesson, prefix = 'Lesson'): string {
  const { id, title, durationMinutes } = lesson;
  return `${prefix} [${id}]: ${title} (${durationMinutes} min)`;
}

/**
 * Pure filter + map pipeline to get remaining lesson titles.
 */
export function getIncompleteLessonTitles(lessons: readonly Lesson[]): string[] {
  return lessons.filter((lesson) => !lesson.completed).map((lesson) => lesson.title);
}

/**
 * Uses reduce to sum total minutes spent on completed lessons.
 */
export function getTotalCompletedMinutes(lessons: readonly Lesson[]): number {
  return lessons.reduce((total, lesson) => {
    return lesson.completed ? total + lesson.durationMinutes : total;
  }, 0);
}

/**
 * Immutably marks a single lesson as completed using object spread.
 */
export function markLessonCompleted(lessons: readonly Lesson[], lessonId: string): Lesson[] {
  return lessons.map((lesson) =>
    lesson.id === lessonId ? { ...lesson, completed: true } : lesson,
  );
}

/**
 * Demonstrates safe array indexing under `noUncheckedIndexedAccess: true`.
 */
export function getNextLesson(lessons: readonly Lesson[]): Lesson | undefined {
  const remaining = lessons.filter((lesson) => !lesson.completed);
  const firstRemaining = remaining[0];
  return firstRemaining;
}

/**
 * Demonstrates rest parameters for variadic arguments.
 */
export function sumDurations(...durations: number[]): number {
  return durations.reduce((acc, value) => acc + value, 0);
}
