import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export interface AnimatedLikeButtonProps {
  initialCount?: number;
  initialLiked?: boolean;
  onToggle?: (liked: boolean, count: number) => void;
}

/**
 * Demonstrates React Native's built-in Animated API with `useNativeDriver: true`.
 * Animates scale and halo opacity on the native UI thread while respecting
 * the user's system "Reduce Motion" accessibility preference.
 */
export function AnimatedLikeButton({
  initialCount = 42,
  initialLiked = false,
  onToggle,
}: AnimatedLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [reduceMotion, setReduceMotion] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.6)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Fallback to standard motion if platform query fails
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const runLikeAnimation = (nextLiked: boolean) => {
    if (reduceMotion) {
      scaleAnim.setValue(1);
      ringOpacityAnim.setValue(0);
      return;
    }

    if (nextLiked) {
      ringScaleAnim.setValue(0.6);
      ringOpacityAnim.setValue(0.75);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.28,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 160,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScaleAnim, {
            toValue: 1.8,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.88,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);

    setLiked(nextLiked);
    setCount(nextCount);
    runLikeAnimation(nextLiked);
    onToggle?.(nextLiked, nextCount);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={liked ? `Unlike post, ${count} likes` : `Like post, ${count} likes`}
      style={({ pressed }) => [
        styles.button,
        liked ? styles.buttonLiked : styles.buttonDefault,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              opacity: ringOpacityAnim,
              transform: [{ scale: ringScaleAnim }],
            },
          ]}
        />
        <Animated.Text
          style={[
            styles.heart,
            liked ? styles.heartLiked : styles.heartDefault,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {liked ? '♥' : '♡'}
        </Animated.Text>
      </View>

      <Text style={[styles.count, liked && styles.countLiked]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  buttonDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  buttonLiked: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E11D48',
  },
  heart: {
    fontSize: 20,
    lineHeight: 22,
  },
  heartDefault: {
    color: '#475569',
  },
  heartLiked: {
    color: '#E11D48',
  },
  count: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  countLiked: {
    color: '#BE123C',
  },
});
