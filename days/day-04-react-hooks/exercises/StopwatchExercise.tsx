import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
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

export function StopwatchExercise() {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapEntry[]>([]);
  const [note, setNote] = useState<string>('');

  const noteInputRef = useRef<TextInputInstance>(null);

  // TODO (Beginner): When `isRunning` is true, start a 100ms interval updating `elapsedMs`
  // using a functional updater, and return a cleanup function calling `clearInterval`.
  useEffect(() => {
    if (!isRunning) {
      return;
    }
    // Implement interval + cleanup here
    return undefined;
  }, [isRunning]);

  const handleToggleRunning = (): void => {
    setIsRunning((prev) => !prev);
  };

  // TODO (Beginner): Stop the timer, reset `elapsedMs` to 0, and clear `laps`.
  const handleReset = (): void => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  // TODO (Intermediate): Record a new LapEntry (computing `splitMs` from the previous lap's `totalMs`),
  // prepend it to `laps`, and clear `note`.
  const handleRecordLap = (): void => {
    if (elapsedMs === 0) {
      return;
    }
    // Implement lap creation here
  };

  // TODO (Challenge): Focus `noteInputRef.current` when pressed.
  const handleFocusNote = (): void => {
    noteInputRef.current?.focus();
  };

  // TODO (Intermediate): Derive the fastest lap split duration without using `useEffect`.
  const fastestSplitMs: number | null = null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Stopwatch Exercise</Text>
        <Text style={styles.timer}>{formatDuration(elapsedMs)}</Text>

        {fastestSplitMs !== null && (
          <Text style={styles.fastest}>Fastest Lap: {formatDuration(fastestSplitMs)}</Text>
        )}

        <View style={styles.noteRow}>
          <TextInput
            ref={noteInputRef}
            value={note}
            onChangeText={setNote}
            placeholder="Optional lap note..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            onPress={handleFocusNote}
            style={styles.focusButton}
          >
            <Text style={styles.focusButtonText}>Focus</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            onPress={handleToggleRunning}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleRecordLap}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Lap</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
        </View>

        <View style={styles.lapList}>
          {laps.map((lap) => (
            <View key={lap.id} style={styles.lapRow}>
              <Text style={styles.lapText}>
                Lap {lap.lapNumber}: {formatDuration(lap.splitMs)}
                {lap.note.length > 0 ? ` — ${lap.note}` : ''}
              </Text>
            </View>
          ))}
        </View>
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
    fontSize: 48,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  fastest: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
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
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  lapList: {
    gap: 8,
  },
  lapRow: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lapText: {
    fontSize: 14,
    color: '#334155',
  },
});

export default StopwatchExercise;
