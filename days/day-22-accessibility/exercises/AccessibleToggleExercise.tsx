import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface AccessibleToggleExerciseProps {
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: (nextEnabled: boolean) => void;
  testID?: string;
}

/**
 * Day 22 Exercise Starter: Accessible Feature Toggle Card
 *
 * This component works visually, but has several accessibility bugs:
 * 1. The touch target is too small and lacks accessibility semantics.
 * 2. Screen readers do not know it behaves as a switch or whether it is checked/disabled.
 * 3. The description color has low contrast against a white background.
 * 4. Text does not cap font scaling (`maxFontSizeMultiplier`), risking layout breakage.
 * 5. Status changes are not announced politely to assistive technologies.
 *
 * Follow the TODO comments below and verify your solution against
 * `../solutions/AccessibleToggleSolution.tsx`.
 */
export function AccessibleToggleExercise({
  title,
  description,
  enabled,
  disabled = false,
  onToggle,
  testID,
}: AccessibleToggleExerciseProps) {
  // TODO (Challenge): Subscribe to AccessibilityInfo.isReduceMotionEnabled()
  // and disable press-scale animations when reduced motion is active.

  const handlePress = () => {
    if (disabled) {
      return;
    }
    onToggle(!enabled);
    // TODO (Intermediate): Announce the state change politely for screen readers.
  };

  return (
    <View style={styles.container}>
      {/*
        TODO (Beginner): Add accessible={true}, accessibilityRole="switch",
        accessibilityLabel combining title and description, accessibilityHint,
        and accessibilityState={{ checked: enabled, disabled }}.
      */}
      <Pressable
        testID={testID}
        onPress={handlePress}
        disabled={disabled}
        style={styles.card}
      >
        <View style={styles.textGroup}>
          {/* TODO (Intermediate): Enable allowFontScaling and cap maxFontSizeMultiplier={2}. */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/*
          TODO (Beginner): Hide this decorative pill from screen readers so the
          label is not announced twice.
        */}
        <View style={[styles.pill, enabled ? styles.pillOn : styles.pillOff]}>
          <Text style={styles.pillText}>{enabled ? 'ON' : 'OFF'}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    // TODO (Beginner): Ensure minHeight is at least 48 (recommended 56-64).
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textGroup: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    // TODO (Beginner): Replace this low-contrast gray (#CBD5E1 is ~1.5:1 on white)
    // with a color meeting WCAG AA (>= 4.5:1), such as #475569.
    color: '#CBD5E1',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillOn: {
    backgroundColor: '#1D4ED8',
  },
  pillOff: {
    backgroundColor: '#64748B',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
