export interface LessonSummary {
  readonly id: string;
  readonly title: string;
  readonly track: 'foundations' | 'core' | 'production';
}

/**
 * Discriminated union for async UI state.
 * Eliminates impossible combinations like `isLoading: true` + `error: '...'`.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

/**
 * Generic API envelope that works for any payload type T.
 */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorMessage: string };

/**
 * Exhaustively formats an AsyncState<T> into a human-readable message.
 */
export function describeAsyncState<T>(
  state: AsyncState<T>,
  formatData: (data: T) => string,
): string {
  switch (state.status) {
    case 'idle':
      return 'Ready to load.';
    case 'loading':
      return 'Loading...';
    case 'success':
      return formatData(state.data);
    case 'error':
      return `Error: ${state.message}`;
  }
}

/**
 * Generic grouping utility demonstrating constrained type parameters
 * and safe record indexing under `noUncheckedIndexedAccess`.
 */
export function groupBy<T, K extends string>(
  items: readonly T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  const grouped: Partial<Record<K, T[]>> = {};

  for (const item of items) {
    const key = getKey(item);
    const existing = grouped[key];
    if (existing) {
      existing.push(item);
    } else {
      grouped[key] = [item];
    }
  }

  return grouped;
}

const MOCK_LESSONS: readonly LessonSummary[] = [
  { id: '01', title: 'Introduction to React Native and Expo', track: 'foundations' },
  { id: '02', title: 'JavaScript and TypeScript', track: 'foundations' },
  { id: '08', title: 'Navigation with Expo Router', track: 'core' },
  { id: '28', title: 'Production Readiness', track: 'production' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Simulates an async API call with strict error narrowing (`unknown`).
 */
export async function fetchLessonById(id: string): Promise<ApiResponse<LessonSummary>> {
  try {
    await delay(100);

    if (id.trim().length === 0) {
      throw new Error('Lesson ID cannot be empty.');
    }

    const match = MOCK_LESSONS.find((lesson) => lesson.id === id);
    if (!match) {
      return { ok: false, errorMessage: `Lesson "${id}" was not found.` };
    }

    return { ok: true, data: match };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    return { ok: false, errorMessage: message };
  }
}
