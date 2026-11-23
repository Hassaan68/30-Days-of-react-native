import { useEffect, useRef } from 'react';

export interface ChangedProp {
  key: string;
  previous: unknown;
  current: unknown;
}

export interface RenderTrackerOptions {
  /** Enable tracking explicitly (defaults to React Native's `__DEV__` flag). */
  enabled?: boolean;
  /** Optional custom logger sink for tests or structured output. */
  logger?: (message: string, details: Record<string, unknown>) => void;
}

/**
 * Pure helper that compares two shallow prop snapshots using `Object.is`
 * and returns the list of keys whose references changed between renders.
 */
export function diffTrackedProps(
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
): ChangedProp[] {
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const changes: ChangedProp[] = [];

  for (const key of keys) {
    const prevValue = previous[key];
    const currValue = current[key];

    if (!Object.is(prevValue, currValue)) {
      changes.push({
        key,
        previous: prevValue,
        current: currValue,
      });
    }
  }

  return changes;
}

/**
 * Development-only diagnostic hook that logs component render counts, time
 * since the previous commit, and which tracked props changed reference.
 *
 * Helpful alongside the React Native DevTools Profiler when hunting down
 * unnecessary re-renders in lists or deeply nested screens.
 */
export function useRenderTracker(
  componentName: string,
  trackedProps?: Record<string, unknown>,
  options: RenderTrackerOptions = {},
): void {
  const enabled = options.enabled ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);
  const customLogger = options.logger;

  const commitCountRef = useRef(0);
  const lastCommitTimeRef = useRef<number | null>(null);
  const previousPropsRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const now = Date.now();
    commitCountRef.current += 1;
    const elapsedMs = lastCommitTimeRef.current === null ? 0 : now - lastCommitTimeRef.current;
    lastCommitTimeRef.current = now;

    const changedKeys =
      trackedProps && previousPropsRef.current
        ? diffTrackedProps(previousPropsRef.current, trackedProps).map((change) => change.key)
        : [];

    previousPropsRef.current = trackedProps ? { ...trackedProps } : null;

    const details: Record<string, unknown> = {
      renderCount: commitCountRef.current,
      elapsedSinceLastMs: elapsedMs,
      changedProps: changedKeys,
    };

    if (customLogger) {
      customLogger(`[RenderTracker] ${componentName}`, details);
    } else {
      console.debug(`[RenderTracker] ${componentName}`, details);
    }
  });
}
