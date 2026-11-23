import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

export interface PlatformCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  elevated?: boolean;
}

/**
 * TODO 1: Return iOS shadow properties on iOS and Material `elevation` on Android
 * when `elevated` is true. Return an empty object when `elevated` is false.
 */
export function getCardDepthStyle(elevated: boolean): ViewStyle {
  if (!elevated) {
    return {};
  }

  return Platform.select<ViewStyle>({
    ios: {},
    android: {},
    default: {},
  });
}

/**
 * TODO 2: Return a readable platform label using `Platform.select`:
 * - ios -> "iOS Native"
 * - android -> "Android Material"
 * - default -> "Cross-Platform"
 */
export function getPlatformBadgeText(): string {
  return Platform.OS;
}

export function PlatformCardExercise({
  title,
  subtitle,
  onPress,
  elevated = true,
}: PlatformCardProps) {
  // TODO 3: Add `useColorScheme()` support for light and dark surfaces.
  // TODO 4: Add `android_ripple` and iOS pressed opacity feedback on `Pressable`.
  return (
    <View style={[styles.wrapper, getCardDepthStyle(elevated)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.badge}>{getPlatformBadgeText()}</Text>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
});

export default PlatformCardExercise;
