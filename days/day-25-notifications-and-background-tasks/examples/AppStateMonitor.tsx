import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface AppLifecycleCallbacks {
  /** Called when the app returns to `'active'` from `'background'` or `'inactive'`. */
  onForeground?: (awayDurationMs: number) => void;
  /** Called when the app moves into `'background'`. */
  onBackground?: () => void;
}

export interface AppTransitionEntry {
  id: string;
  from: AppStateStatus;
  to: AppStateStatus;
  timestamp: string;
}

export interface UseAppLifecycleResult {
  appState: AppStateStatus;
  lastAwayDurationMs: number | null;
  transitions: AppTransitionEntry[];
}

const MAX_HISTORY_ENTRIES = 8;

/**
 * Tracks React Native's `AppState` lifecycle (`active`, `inactive`, `background`)
 * and triggers callbacks when the user leaves or returns to the app.
 */
export function useAppLifecycle(callbacks: AppLifecycleCallbacks = {}): UseAppLifecycleResult {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [lastAwayDurationMs, setLastAwayDurationMs] = useState<number | null>(null);
  const [transitions, setTransitions] = useState<AppTransitionEntry[]>([]);

  const previousStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);
  const callbacksRef = useRef<AppLifecycleCallbacks>(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = previousStateRef.current;
      previousStateRef.current = nextState;
      setAppState(nextState);

      const now = Date.now();
      const entry: AppTransitionEntry = {
        id: `${now}-${nextState}`,
        from: previousState,
        to: nextState,
        timestamp: new Date(now).toLocaleTimeString(),
      };

      setTransitions((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));

      if (nextState === 'background') {
        backgroundedAtRef.current = now;
        callbacksRef.current.onBackground?.();
        return;
      }

      const wasAway = previousState === 'background' || previousState === 'inactive';
      if (wasAway && nextState === 'active') {
        const awayMs = backgroundedAtRef.current !== null ? now - backgroundedAtRef.current : 0;
        backgroundedAtRef.current = null;
        setLastAwayDurationMs(awayMs);
        callbacksRef.current.onForeground?.(awayMs);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appState,
    lastAwayDurationMs,
    transitions,
  };
}

/**
 * Interactive monitor displaying the current `AppState` and recent lifecycle
 * transitions. Useful for verifying pause/resume and draft-saving hooks.
 */
export function AppStateMonitor() {
  const { appState, lastAwayDurationMs, transitions } = useAppLifecycle({
    onForeground: (awayMs) => {
      if (awayMs > 60_000) {
        // Real apps typically invalidate stale queries or re-sync data here.
        console.info(`[AppStateMonitor] Returned after ${Math.round(awayMs / 1000)}s away.`);
      }
    },
    onBackground: () => {
      // Real apps flush unsaved drafts or pause active timers/streams here.
      console.info('[AppStateMonitor] App moved to background.');
    },
  });

  return (
    <SafeAreaView style={styles.screen}>
      <Text accessibilityRole="header" style={styles.heading}>
        App Lifecycle Monitor
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Current AppState</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{appState.toUpperCase()}</Text>
        </View>
        <Text style={styles.meta}>
          {lastAwayDurationMs !== null
            ? `Last time in background: ${(lastAwayDurationMs / 1000).toFixed(1)}s`
            : 'Background the app and return to measure away duration.'}
        </Text>
      </View>

      <View style={styles.historyCard}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Recent Transitions
        </Text>
        {transitions.length === 0 ? (
          <Text style={styles.emptyText}>No transitions recorded yet.</Text>
        ) : (
          transitions.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <Text style={styles.historyTransition}>
                {item.from} → {item.to}
              </Text>
              <Text style={styles.historyTime}>{item.timestamp}</Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 14,
    color: '#475569',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  historyTransition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyTime: {
    fontSize: 13,
    color: '#475569',
  },
});
