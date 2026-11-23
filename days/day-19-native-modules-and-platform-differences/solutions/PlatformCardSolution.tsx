import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native';

export interface PlatformCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  elevated?: boolean;
}

export function getCardDepthStyle(elevated: boolean): ViewStyle {
  if (!elevated) {
    return {};
  }

  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
  });
}

export function getPlatformBadgeText(): string {
  return Platform.select({
    ios: 'iOS Native',
    android: 'Android Material',
    default: 'Cross-Platform',
  });
}

export function PlatformCardSolution({
  title,
  subtitle,
  onPress,
  elevated = true,
}: PlatformCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.wrapper,
        getCardDepthStyle(elevated),
        isDark ? styles.wrapperDark : styles.wrapperLight,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        android_ripple={{
          color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(37, 99, 235, 0.14)',
        }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          isDark ? styles.cardDark : styles.cardLight,
          Platform.OS === 'ios' && pressed ? styles.pressedIos : undefined,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
            {title}
          </Text>
          <View style={[styles.badgeContainer, isDark ? styles.badgeDark : styles.badgeLight]}>
            <Text style={[styles.badgeText, isDark ? styles.badgeTextDark : styles.badgeTextLight]}>
              {getPlatformBadgeText()}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
          {subtitle}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
  },
  wrapperLight: {
    backgroundColor: '#ffffff',
  },
  wrapperDark: {
    backgroundColor: '#0f172a',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  cardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  pressedIos: {
    opacity: 0.78,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  titleLight: {
    color: '#0f172a',
  },
  titleDark: {
    color: '#f8fafc',
  },
  badgeContainer: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLight: {
    backgroundColor: '#dbeafe',
  },
  badgeDark: {
    backgroundColor: '#1e3a8a',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextLight: {
    color: '#1d4ed8',
  },
  badgeTextDark: {
    color: '#bfdbfe',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  subtitleLight: {
    color: '#475569',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
});

export default PlatformCardSolution;
