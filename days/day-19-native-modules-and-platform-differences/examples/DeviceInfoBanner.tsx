import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPlatformShadow, showPlatformActionSheet } from './PlatformActionSheet';

interface DiagnosticRow {
  label: string;
  value: string;
}

export function DeviceInfoBanner() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const [lastAction, setLastAction] = useState<string>('None yet');

  const isDark = colorScheme === 'dark';
  const orientation = width >= height ? 'Landscape' : 'Portrait';
  const platformName = Platform.select({
    ios: 'iOS',
    android: 'Android',
    web: 'Web',
    default: Platform.OS,
  });

  const rows: readonly DiagnosticRow[] = [
    { label: 'Platform', value: platformName },
    { label: 'OS Version', value: String(Platform.Version) },
    { label: 'Viewport', value: `${Math.round(width)} x ${Math.round(height)} (${orientation})` },
    { label: 'Color Scheme', value: isDark ? 'Dark' : 'Light' },
    { label: 'App Name', value: Constants.expoConfig?.name ?? 'Expo App' },
    { label: 'App Version', value: Constants.expoConfig?.version ?? '1.0.0' },
  ];

  const handleOpenActions = async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }

    showPlatformActionSheet({
      title: 'Diagnostics Actions',
      message: `Running on ${platformName} ${String(Platform.Version)}`,
      options: [
        {
          label: 'Copy Summary',
          onPress: () => setLastAction('Copied diagnostics summary'),
        },
        {
          label: 'Export JSON Report',
          onPress: () => setLastAction('Prepared JSON diagnostics report'),
        },
        {
          label: 'Reset Diagnostics State',
          destructive: true,
          onPress: () => setLastAction('Diagnostics state cleared'),
        },
      ],
    });
  };

  return (
    <SafeAreaView style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <View
        style={[
          styles.card,
          getPlatformShadow('md'),
          isDark ? styles.cardDark : styles.cardLight,
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
            Device & Platform Info
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{platformName}</Text>
          </View>
        </View>

        <View style={styles.rowsContainer}>
          {rows.map((row) => (
            <View
              key={row.label}
              style={[styles.row, isDark ? styles.rowBorderDark : styles.rowBorderLight]}
            >
              <Text style={isDark ? styles.labelDark : styles.labelLight}>{row.label}</Text>
              <Text style={[styles.value, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.statusText, isDark ? styles.labelDark : styles.labelLight]}>
          Last action: {lastAction}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open platform actions"
          android_ripple={{ color: 'rgba(255, 255, 255, 0.25)' }}
          onPress={() => {
            void handleOpenActions();
          }}
          style={({ pressed }) => [
            styles.button,
            Platform.OS === 'ios' && pressed ? styles.buttonPressedIos : undefined,
          ]}
        >
          <Text style={styles.buttonText}>Open Native Action Sheet</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  screenLight: {
    backgroundColor: '#f8fafc',
  },
  screenDark: {
    backgroundColor: '#020617',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  cardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  rowsContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBorderLight: {
    borderBottomColor: '#e2e8f0',
  },
  rowBorderDark: {
    borderBottomColor: '#1e293b',
  },
  labelLight: {
    color: '#475569',
    fontSize: 14,
  },
  labelDark: {
    color: '#94a3b8',
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  textPrimaryLight: {
    color: '#0f172a',
  },
  textPrimaryDark: {
    color: '#f8fafc',
  },
  statusText: {
    fontSize: 13,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonPressedIos: {
    opacity: 0.78,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DeviceInfoBanner;
