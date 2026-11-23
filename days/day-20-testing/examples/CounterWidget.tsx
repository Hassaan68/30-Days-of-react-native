import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface CounterWidgetProps {
  initialValue?: number;
  step?: number;
  min?: number;
  max?: number;
  onChange?: (nextValue: number) => void;
}

export function CounterWidget({
  initialValue = 0,
  step = 1,
  min = 0,
  max = 10,
  onChange,
}: CounterWidgetProps) {
  const clampedInitial = Math.min(Math.max(initialValue, min), max);
  const [count, setCount] = useState<number>(clampedInitial);

  const isAtMin = count <= min;
  const isAtMax = count >= max;

  const updateCount = (nextValue: number): void => {
    const bounded = Math.min(Math.max(nextValue, min), max);
    if (bounded === count) {
      return;
    }
    setCount(bounded);
    onChange?.(bounded);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quantity Selector</Text>
      <Text accessibilityLabel="Current count" style={styles.countText}>
        Count: {count}
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrement counter"
          accessibilityState={{ disabled: isAtMin }}
          disabled={isAtMin}
          onPress={() => updateCount(count - step)}
          style={[styles.button, isAtMin ? styles.buttonDisabled : styles.buttonSecondary]}
        >
          <Text style={styles.buttonText}>-{step}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increment counter"
          accessibilityState={{ disabled: isAtMax }}
          disabled={isAtMax}
          onPress={() => updateCount(count + step)}
          style={[styles.button, isAtMax ? styles.buttonDisabled : styles.buttonPrimary]}
        >
          <Text style={styles.buttonText}>+{step}</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset counter"
        onPress={() => updateCount(clampedInitial)}
        style={styles.resetButton}
      >
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  countText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minWidth: 72,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#334155',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CounterWidget;
