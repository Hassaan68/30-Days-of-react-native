import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface AccessibleToggleSolutionProps {
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: (nextEnabled: boolean) => void;
  testID?: string;
}

/**
 * Custom hook that reads and subscribes to the OS "Reduce Motion" setting.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) {
          setReduceMotion(value);
        }
      })
      .catch(() => {
        // Keep default false if the query is unavailable in a test environment.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      setReduceMotion(value);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Complete accessible implementation of the Feature Toggle Card exercise.
 */
export function AccessibleToggleSolution({
  title,
  description,
  enabled,
  disabled = false,
  onToggle,
  testID,
}: AccessibleToggleSolutionProps) {
  const reduceMotion = useReducedMotion();
  const [liveStatus, setLiveStatus] = useState('');

  const handlePress = () => {
    if (disabled) {
      return;
    }

    const nextEnabled = !enabled;
    onToggle(nextEnabled);

    const announcement = `${title} turned ${nextEnabled ? 'on' : 'off'}`;
    setLiveStatus(announcement);

    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        testID={testID}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="switch"
        accessibilityLabel={`${title}. ${description}`}
        accessibilityHint={`Switches ${title.toLowerCase()} ${enabled ? 'off' : 'on'}`}
        accessibilityState={{ checked: enabled, disabled }}
        style={({ pressed }) => [
          styles.card,
          disabled && styles.cardDisabled,
          pressed && !disabled && (reduceMotion ? styles.cardPressedNoMotion : styles.cardPressed),
        ]}
      >
        <View style={styles.textGroup}>
          <Text style={styles.title} allowFontScaling={true} maxFontSizeMultiplier={2}>
            {title}
          </Text>
          <Text style={styles.description} allowFontScaling={true} maxFontSizeMultiplier={2}>
            {description}
          </Text>
        </View>

        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
          style={[styles.pill, enabled ? styles.pillOn : styles.pillOff]}
        >
          <Text style={styles.pillText} allowFontScaling={true} maxFontSizeMultiplier={1.5}>
            {enabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </Pressable>

      {liveStatus.length > 0 ? (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.srOnly}
          allowFontScaling={false}
        >
          {liveStatus}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Example screen composing multiple AccessibleToggleSolution cards safely.
 */
export function AccessiblePreferencesDemo() {
  const [highContrast, setHighContrast] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <Text
        accessibilityRole="header"
        style={styles.heading}
        allowFontScaling={true}
        maxFontSizeMultiplier={2}
      >
        Accessibility Preferences
      </Text>

      <View style={styles.list}>
        <AccessibleToggleSolution
          testID="toggle-high-contrast"
          title="High Contrast Mode"
          description="Increases border visibility and darkens secondary text."
          enabled={highContrast}
          onToggle={setHighContrast}
        />
        <AccessibleToggleSolution
          testID="toggle-haptics"
          title="Haptic Feedback"
          description="Provides subtle tactile confirmation on important actions."
          enabled={hapticsEnabled}
          onToggle={setHapticsEnabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  container: {
    width: '100%',
  },
  card: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardPressed: {
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 0.99 }],
  },
  cardPressedNoMotion: {
    backgroundColor: '#EFF6FF',
  },
  cardDisabled: {
    opacity: 0.55,
  },
  textGroup: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    // Contrast ratio vs #FFFFFF is 7.58:1 (passes WCAG AA & AAA).
    color: '#475569',
  },
  pill: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: {
    backgroundColor: '#1D4ED8',
  },
  pillOff: {
    backgroundColor: '#475569',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
