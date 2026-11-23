import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  createCardShadow,
  getBreakpoint,
  getThemeColors,
  radius,
  spacing,
  typography,
  type ThemeMode,
} from './ThemeTokens';

interface MetricCard {
  id: string;
  label: string;
  value: string;
  delta: string;
}

const METRICS: readonly MetricCard[] = [
  { id: 'lessons', label: 'Lessons Completed', value: '5 / 30', delta: '+1 today' },
  { id: 'streak', label: 'Active Streak', value: '5 days', delta: 'Personal best' },
  { id: 'components', label: 'Screens Styled', value: '12', delta: 'iOS + Android' },
  { id: 'accessibility', label: 'Font Scaling', value: 'Enabled', delta: 'Dynamic Type' },
];

function ResponsiveDashboardContent() {
  const systemScheme = useColorScheme();
  const [overrideMode, setOverrideMode] = useState<ThemeMode | null>(null);
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const activeMode: ThemeMode = overrideMode ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const colors = getThemeColors(activeMode);
  const breakpoint = getBreakpoint(width);
  const cardShadow = createCardShadow(activeMode);

  const columns = breakpoint === 'expanded' ? 4 : breakpoint === 'medium' ? 2 : 1;
  const horizontalPadding = spacing.lg * 2;
  const totalGap = spacing.md * (columns - 1);
  const cardWidth = Math.max(220, Math.floor((width - horizontalPadding - totalGap) / columns));

  const toggleTheme = () => {
    setOverrideMode(activeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={[typography.display, { color: colors.textPrimary }]}>
              Layout &amp; Styling
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {Math.round(width)} x {Math.round(height)} dp • {breakpoint} • {Platform.OS}
            </Text>
          </View>

          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Switch light or dark theme"
            style={({ pressed }) => [
              styles.themeButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.textPrimary }]}>
              {activeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.banner,
            cardShadow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[typography.subtitle, { color: colors.textPrimary }]}>
            Adaptive Flexbox Grid
          </Text>
          <Text
            style={[typography.body, styles.bannerDescription, { color: colors.textSecondary }]}
            maxFontSizeMultiplier={1.6}
          >
            Rotate the simulator or resize the window to see the card grid adjust between 1, 2,
            and 4 columns automatically. Current font scale: {fontScale.toFixed(2)}x.
          </Text>
        </View>

        <View style={styles.grid}>
          {METRICS.map((metric) => (
            <View
              key={metric.id}
              style={[
                styles.metricCard,
                cardShadow,
                {
                  width: columns === 1 ? '100%' : cardWidth,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textMuted }]}>{metric.label}</Text>
              <Text style={[typography.title, styles.metricValue, { color: colors.textPrimary }]}>
                {metric.value}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[typography.caption, { color: colors.primary }]}>{metric.delta}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.insetsCard, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Safe Area Insets — top: {Math.round(insets.top)}px, bottom: {Math.round(insets.bottom)}
            px, left: {Math.round(insets.left)}px, right: {Math.round(insets.right)}px
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ResponsiveLayoutScreen() {
  return (
    <SafeAreaProvider>
      <ResponsiveDashboardContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  themeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  banner: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  bannerDescription: {
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  metricValue: {
    marginTop: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  insetsCard: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
