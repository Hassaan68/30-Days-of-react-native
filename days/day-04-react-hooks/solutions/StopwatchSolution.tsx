import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface LapEntry {
  readonly id: string;
  readonly lapNumber: number;
  readonly splitMs: number;
  readonly totalMs: number;
  readonly note: string;
}

export function formatDuration(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export interface UseStopwatchResult {
  elapsedMs: number;
  isRunning: boolean;
  laps: readonly LapEntry[];
  fastestSplitMs: number | null;
  toggleRunning: () => void;
  recordLap: (note: string) => void;
  reset: () => void;
}

export function useStopwatch(): UseStopwatchResult {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedMs((previous) => previous + 100);
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const toggleRunning = useCallback(() => {
    setIsRunning((previous) => !previous);
  }, []);

  const recordLap = useCallback(
    (note: string) => {
      if (elapsedMs === 0) {
        return;
      }

      setLaps((previousLaps) => {
        const lastLap = previousLaps[0];
        const previousTotalMs = lastLap ? lastLap.totalMs : 0;
        const lapNumber = previousLaps.length + 1;
        const nextLap: LapEntry = {
          id: `lap-${lapNumber}-${elapsedMs}`,
          lapNumber,
          splitMs: Math.max(0, elapsedMs - previousTotalMs),
          totalMs: elapsedMs,
          note: note.trim(),
        };
        return [nextLap, ...previousLaps];
      });
    },
    [elapsedMs],
  );

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  }, []);

  const fastestSplitMs = useMemo<number | null>(() => {
    const firstLap = laps[0];
    if (!firstLap) {
      return null;
    }
    return laps.reduce(
      (fastest, lap) => (lap.splitMs < fastest ? lap.splitMs : fastest),
      firstLap.splitMs,
    );
  }, [laps]);

  return {
    elapsedMs,
    isRunning,
    laps,
    fastestSplitMs,
    toggleRunning,
    recordLap,
    reset,
  };
}

export function StopwatchSolution() {
  const { elapsedMs, isRunning, laps, fastestSplitMs, toggleRunning, recordLap, reset } =
    useStopwatch();
  const [note, setNote] = useState<string>('');
  const noteInputRef = useRef<TextInput | null>(null);

  const handleRecordLap = (): void => {
    recordLap(note);
    setNote('');
  };

  const handleFocusNote = (): void => {
    noteInputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Precision Stopwatch</Text>
        <Text style={styles.timer}>{formatDuration(elapsedMs)}</Text>

        {fastestSplitMs !== null && (
          <View style={styles.fastestBadge}>
            <Text style={styles.fastestText}>
              Fastest Lap: {formatDuration(fastestSplitMs)}
            </Text>
          </View>
        )}

        <View style={styles.noteRow}>
          <TextInput
            ref={noteInputRef}
            value={note}
            onChangeText={setNote}
            placeholder="Optional lap note (e.g., Warmup)..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleRecordLap}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Focus lap note text input"
            onPress={handleFocusNote}
            style={({ pressed }) => [styles.focusButton, pressed && styles.pressed]}
          >
            <Text style={styles.focusButtonText}>Add Note</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRunning ? 'Pause stopwatch' : 'Start stopwatch'}
            onPress={toggleRunning}
            style={({ pressed }) => [
              styles.primaryButton,
              isRunning && styles.pauseButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record lap split"
            disabled={elapsedMs === 0}
            onPress={handleRecordLap}
            style={({ pressed }) => [
              styles.secondaryButton,
              elapsedMs === 0 && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Lap</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset stopwatch and clear laps"
            onPress={reset}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
        </View>

        {laps.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Start the timer and press Lap to record splits.</Text>
          </View>
        ) : (
          <View style={styles.lapList}>
            {laps.map((lap) => {
              const isFastest = fastestSplitMs !== null && lap.splitMs === fastestSplitMs;
              return (
                <View key={lap.id} style={[styles.lapRow, isFastest && styles.lapRowFastest]}>
                  <View style={styles.lapHeader}>
                    <Text style={styles.lapTitle}>
                      Lap {lap.lapNumber}
                      {isFastest ? ' ★' : ''}
                    </Text>
                    <Text style={styles.lapSplit}>{formatDuration(lap.splitMs)}</Text>
                  </View>
                  <Text style={styles.lapMeta}>
                    Total: {formatDuration(lap.totalMs)}
                    {lap.note.length > 0 ? ` · ${lap.note}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  timer: {
    fontSize: 52,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  fastestBadge: {
    alignSelf: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  fastestText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  noteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  focusButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  focusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#D97706',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  lapList: {
    gap: 8,
  },
  lapRow: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  lapRowFastest: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  lapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lapSplit: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D4ED8',
    fontVariant: ['tabular-nums'],
  },
  lapMeta: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default StopwatchSolution;
