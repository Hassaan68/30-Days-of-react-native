import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ExpandableCardExerciseProps {
  title: string;
  summary: string;
  details: string;
  initialExpanded?: boolean;
}

/**
 * Day 15 Starter Exercise: Expandable Card
 *
 * Complete the TODOs below using `react-native-reanimated`:
 * 1. Import `Animated`, `FadeIn`, `FadeOut`, `useAnimatedStyle`, `useReducedMotion`,
 *    `useSharedValue`, `withSpring`, and `withTiming` from `react-native-reanimated`.
 * 2. Track an animation progress shared value (`0` collapsed, `1` expanded).
 * 3. Rotate the chevron indicator 180 degrees smoothly when expanded.
 * 4. Animate press scale feedback with `withSpring` and reveal the body smoothly.
 * 5. Bypass motion animations when `useReducedMotion()` returns `true`.
 */
export function ExpandableCardExercise({
  title,
  summary,
  details,
  initialExpanded = false,
}: ExpandableCardExerciseProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  // TODO (Exercise 1): Create `progress = useSharedValue(initialExpanded ? 1 : 0)`
  // and `cardScale = useSharedValue(1)`.

  // TODO (Exercise 3): Read `const reducedMotion = useReducedMotion();`

  // TODO (Exercise 1): Create `chevronAnimatedStyle` with `useAnimatedStyle`
  // rotating from `0deg` to `180deg` based on `progress.value`.

  // TODO (Exercise 2): Create `cardAnimatedStyle` with `useAnimatedStyle`
  // applying `{ transform: [{ scale: cardScale.value }] }`.

  const handleToggle = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    // TODO (Exercise 1 & 3): Update `progress.value` using `withTiming`
    // (or set directly to `nextExpanded ? 1 : 0` if `reducedMotion` is true).
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        {/* TODO (Exercise 1): Replace with Animated.Text using chevronAnimatedStyle */}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {/* TODO (Exercise 2 & 3): Wrap details in Animated.View with entering/exiting transitions */}
      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.details}>{details}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  summary: {
    fontSize: 13,
    color: '#64748B',
  },
  chevron: {
    fontSize: 14,
    color: '#334155',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  details: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
});
