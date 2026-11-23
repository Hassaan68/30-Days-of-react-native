import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface DraggableCardProps {
  title?: string;
  subtitle?: string;
  dismissThreshold?: number;
  onDismiss?: () => void;
}

const DEFAULT_DISMISS_THRESHOLD = 140;

/**
 * Demonstrates UI-thread gestures and spring physics using
 * `react-native-gesture-handler` + `react-native-reanimated`.
 * Supports drag-to-dismiss, spring snap-back, double-tap reset,
 * and reduced-motion accessibility.
 */
export function DraggableCard({
  title = 'Swipe or Drag Me',
  subtitle = 'Drag horizontally past the threshold to dismiss, or double-tap to center.',
  dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  onDismiss,
}: DraggableCardProps) {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const resetPosition = () => {
    translateX.value = reducedMotion ? 0 : withSpring(0, { damping: 16, stiffness: 180 });
    translateY.value = reducedMotion ? 0 : withSpring(0, { damping: 16, stiffness: 180 });
    scale.value = reducedMotion ? 1 : withSpring(1);
  };

  const handleRestore = () => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    setVisible(true);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = reducedMotion ? 1 : withTiming(1.03, { duration: 120 });
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(translateX.value) > dismissThreshold || Math.abs(event.velocityX) > 900;

      if (shouldDismiss) {
        const direction = translateX.value >= 0 ? 1 : -1;
        const targetX = direction * 420;
        translateX.value = reducedMotion
          ? targetX
          : withTiming(targetX, { duration: 220 }, (finished) => {
              if (finished) {
                runOnJS(handleDismiss)();
              }
            });

        if (reducedMotion) {
          runOnJS(handleDismiss)();
        }
        return;
      }

      translateX.value = reducedMotion ? 0 : withSpring(0, { damping: 15, stiffness: 170 });
      translateY.value = reducedMotion ? 0 : withSpring(0, { damping: 15, stiffness: 170 });
      scale.value = reducedMotion ? 1 : withSpring(1);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        translateX.value = reducedMotion ? 0 : withSpring(0, { damping: 16, stiffness: 180 });
        translateY.value = reducedMotion ? 0 : withSpring(0, { damping: 16, stiffness: 180 });
        scale.value = reducedMotion ? 1 : withSpring(1);
      }
    });

  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotationDeg = reducedMotion ? 0 : translateX.value / 20;
    const progress = Math.min(Math.abs(translateX.value) / (dismissThreshold * 1.5), 1);

    return {
      opacity: 1 - progress * 0.45,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotationDeg}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      {visible ? (
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            entering={reducedMotion ? undefined : FadeIn.duration(220)}
            exiting={reducedMotion ? undefined : FadeOut.duration(180)}
            style={[styles.card, animatedCardStyle]}
            accessibilityRole="adjustable"
            accessibilityLabel={title}
            accessibilityHint="Drag horizontally to dismiss or double tap to recenter"
          >
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Pressable onPress={resetPosition} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Recenter Card</Text>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      ) : (
        <Animated.View
          entering={reducedMotion ? undefined : FadeIn.duration(200)}
          style={styles.emptyState}
        >
          <Text style={styles.emptyTitle}>Card Dismissed</Text>
          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>Restore Card</Text>
          </Pressable>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 16,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  restoreButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
