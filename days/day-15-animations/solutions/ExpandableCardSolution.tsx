import { type Ref, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type TextInstance,
  type TextProps,
  type TextStyle,
  View,
  type ViewInstance,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * React Native 0.88 uses recursive `ReadonlyArray` style props, which can hit
 * TypeScript's instantiation depth limit inside Reanimated 3's `AnimatedStyle`.
 * These flat-style wrappers preserve strict typing and host ref forwarding.
 */
interface FlatAnimatedViewProps extends Omit<ViewProps, 'style'> {
  ref?: Ref<ViewInstance>;
  style?: ViewStyle | ViewStyle[];
}

interface FlatAnimatedTextProps extends Omit<TextProps, 'style'> {
  ref?: Ref<TextInstance>;
  style?: TextStyle | TextStyle[];
}

function FlatView({ ref, ...props }: FlatAnimatedViewProps) {
  return <View ref={ref} {...props} />;
}

function FlatText({ ref, ...props }: FlatAnimatedTextProps) {
  return <Text ref={ref} {...props} />;
}

const ReanimatedView = Animated.createAnimatedComponent(FlatView);
const ReanimatedText = Animated.createAnimatedComponent(FlatText);

export interface ExpandableCardSolutionProps {
  title: string;
  summary: string;
  details: string;
  initialExpanded?: boolean;
}

/**
 * Day 15 Solution: Accessible Expandable Card powered by Reanimated.
 * Animates GPU-friendly transform & opacity properties on the UI thread
 * and automatically respects the user's Reduce Motion preference.
 */
export function ExpandableCardSolution({
  title,
  summary,
  details,
  initialExpanded = false,
}: ExpandableCardSolutionProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(initialExpanded ? 1 : 0);
  const cardScale = useSharedValue(1);

  const chevronAnimatedStyle: TextStyle = useAnimatedStyle<TextStyle>(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const cardAnimatedStyle: ViewStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const bodyAnimatedStyle: ViewStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: progress.value,
    transform: [{ translateY: reducedMotion ? 0 : (1 - progress.value) * -6 }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    cardScale.value = withTiming(0.985, { duration: 100 });
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    cardScale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  const handleToggle = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    const target = nextExpanded ? 1 : 0;
    progress.value = reducedMotion ? target : withTiming(target, { duration: 220 });
  };

  return (
    <ReanimatedView style={[styles.card, cardAnimatedStyle]}>
      <Pressable
        onPress={handleToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Collapses card details' : 'Expands card details'}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <ReanimatedText style={[styles.chevron, chevronAnimatedStyle]}>▼</ReanimatedText>
      </Pressable>

      {expanded ? (
        <ReanimatedView
          entering={reducedMotion ? undefined : FadeIn.duration(180)}
          exiting={reducedMotion ? undefined : FadeOut.duration(140)}
          style={[styles.body, bodyAnimatedStyle]}
        >
          <Text style={styles.details}>{details}</Text>
        </ReanimatedView>
      ) : null}
    </ReanimatedView>
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
