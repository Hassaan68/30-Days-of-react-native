import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export interface AccessibleSettingsRowProps {
  /** Short, clear name of the setting (e.g., "Push Notifications"). */
  title: string;
  /** Optional supporting explanation displayed beneath the title. */
  description?: string;
  /** Current boolean state of the toggle. */
  value: boolean;
  /** Called when the user toggles the setting. */
  onValueChange: (nextValue: boolean) => void;
  /** Optional hint explaining the effect of toggling (avoid repeating the role). */
  hint?: string;
  /** Disables interaction and communicates disabled state to assistive tech. */
  disabled?: boolean;
  /** Optional testID for React Native Testing Library queries. */
  testID?: string;
}

/**
 * A single-focus-stop accessible settings row.
 *
 * Grouping the label, description, and switch inside one `Pressable` with
 * `accessibilityRole="switch"` lets VoiceOver and TalkBack users swipe once
 * to hear the title, description, current on/off state, and double-tap anywhere
 * on the row to toggle it.
 */
export function AccessibleSettingsRow({
  title,
  description,
  value,
  onValueChange,
  hint,
  disabled = false,
  testID,
}: AccessibleSettingsRowProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Gracefully fall back to default motion preference if query fails.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    const nextValue = !value;
    onValueChange(nextValue);

    const announcement = `${title} ${nextValue ? 'enabled' : 'disabled'}`;
    setStatusMessage(announcement);

    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  };

  const combinedLabel = description ? `${title}. ${description}` : title;

  return (
    <View style={styles.wrapper}>
      <Pressable
        testID={testID}
        onPress={handleToggle}
        disabled={disabled}
        accessible={true}
        accessibilityRole="switch"
        accessibilityLabel={combinedLabel}
        accessibilityHint={hint ?? `Toggles ${title.toLowerCase()}`}
        accessibilityState={{ checked: value, disabled }}
        style={({ pressed }) => [
          styles.row,
          disabled && styles.rowDisabled,
          pressed && !disabled && (reduceMotion ? styles.rowPressedStatic : styles.rowPressed),
        ]}
      >
        <View style={styles.textColumn}>
          <Text style={styles.title} allowFontScaling={true} maxFontSizeMultiplier={2}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.description} allowFontScaling={true} maxFontSizeMultiplier={2}>
              {description}
            </Text>
          ) : null}
        </View>

        {/* Hide the visual Switch from assistive tech so the row is announced once. */}
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
          pointerEvents="none"
          style={styles.switchContainer}
        >
          <Switch
            value={value}
            disabled={disabled}
            trackColor={{ false: '#94A3B8', true: '#1D4ED8' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Pressable>

      {/* Polite live region announces state updates on Android without stealing focus. */}
      {statusMessage.length > 0 ? (
        <Text
          accessibilityLiveRegion="polite"
          style={styles.screenReaderOnly}
          allowFontScaling={false}
        >
          {statusMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  row: {
    // Exceeds both iOS (44pt) and Android (48dp) minimum touch targets.
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
  rowPressed: {
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 0.99 }],
  },
  rowPressedStatic: {
    // Respects Reduce Motion: visual feedback without scale/movement.
    backgroundColor: '#EFF6FF',
  },
  rowDisabled: {
    opacity: 0.55,
  },
  textColumn: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    // Contrast ratio vs #FFFFFF is ~17.8:1 (exceeds WCAG AAA).
    color: '#0F172A',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    // Contrast ratio vs #FFFFFF is ~7.5:1 (exceeds WCAG AA 4.5:1).
    color: '#475569',
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenReaderOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
