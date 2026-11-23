import { Pressable, StyleSheet, Text, View, type Insets } from 'react-native';

export interface AccessibleIconButtonProps {
  /** Visual glyph or short icon text (for example, "🔔", "✕", or "+"). */
  icon: string;
  /**
   * Required screen reader description.
   * Icon-only buttons MUST have an explicit accessibilityLabel so screen
   * readers never announce a raw glyph or stay silent.
   */
  label: string;
  /** Optional description of the result of activating the button. */
  hint?: string;
  /** Optional unread/item count announced as part of the button label. */
  badgeCount?: number;
  /** Called when the user activates the button. */
  onPress: () => void;
  /** Marks the button as unavailable to touch and assistive tech. */
  disabled?: boolean;
  /** Indicates an in-progress async operation (e.g., submitting or refreshing). */
  busy?: boolean;
  /** Optional testID for automated tests. */
  testID?: string;
}

const VISUAL_SIZE = 36;
const MIN_TOUCH_TARGET = 48;
const EXTRA_SLOP = Math.ceil((MIN_TOUCH_TARGET - VISUAL_SIZE) / 2);

const TOUCH_HIT_SLOP: Insets = {
  top: EXTRA_SLOP,
  right: EXTRA_SLOP,
  bottom: EXTRA_SLOP,
  left: EXTRA_SLOP,
};

/**
 * An icon-only button that stays compact visually (36x36) while guaranteeing
 * a 48x48 accessible touch target via `hitSlop` and rich VoiceOver/TalkBack semantics.
 */
export function AccessibleIconButton({
  icon,
  label,
  hint,
  badgeCount,
  onPress,
  disabled = false,
  busy = false,
  testID,
}: AccessibleIconButtonProps) {
  const normalizedBadge =
    typeof badgeCount === 'number' && badgeCount > 0 ? badgeCount : null;
  const computedLabel =
    normalizedBadge !== null
      ? `${label}, ${normalizedBadge} ${normalizedBadge === 1 ? 'notification' : 'notifications'}`
      : label;

  const isInteractive = !disabled && !busy;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!isInteractive}
      hitSlop={TOUCH_HIT_SLOP}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={computedLabel}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !isInteractive, busy }}
      style={({ pressed }) => [
        styles.button,
        !isInteractive && styles.buttonDisabled,
        pressed && isInteractive && styles.buttonPressed,
      ]}
    >
      {/* Hide decorative glyph & badge text so assistive tech reads only computedLabel. */}
      <Text
        style={styles.iconText}
        accessible={false}
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
        allowFontScaling={false}
      >
        {busy ? '…' : icon}
      </Text>

      {normalizedBadge !== null ? (
        <View
          style={styles.badge}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <Text style={styles.badgeText} allowFontScaling={false}>
            {normalizedBadge > 99 ? '99+' : String(normalizedBadge)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: VISUAL_SIZE,
    height: VISUAL_SIZE,
    borderRadius: VISUAL_SIZE / 2,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  iconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    // White on #DC2626 is 4.83:1 (passes WCAG AA).
    color: '#FFFFFF',
  },
});
