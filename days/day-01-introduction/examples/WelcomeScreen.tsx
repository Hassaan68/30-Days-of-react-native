import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ARCHITECTURE_PILLARS = [
  'Hermes Engine (fast startup & low memory)',
  'JSI (direct C++ native bindings, no JSON bridge)',
  'Fabric (concurrent C++ UI renderer)',
  'TurboModules (lazy, type-safe native modules)',
] as const;

function getPlatformLabel(): string {
  if (Platform.OS === 'ios') {
    return 'iOS';
  }
  if (Platform.OS === 'android') {
    return 'Android';
  }
  return 'Web';
}

export function WelcomeScreen() {
  const [tapCount, setTapCount] = useState<number>(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.badge}>Day 01 · Expo SDK 58</Text>
        <Text style={styles.title}>Hello, React Native!</Text>
        <Text style={styles.subtitle}>
          Running natively on {getPlatformLabel()} with React Native 0.88.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>New Architecture Pillars</Text>
          {ARCHITECTURE_PILLARS.map((pillar) => (
            <Text key={pillar} style={styles.listItem}>
              • {pillar}
            </Text>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increment native interaction counter"
          onPress={() => setTapCount((count) => count + 1)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>
            {tapCount === 0
              ? 'Tap to test native interaction'
              : `Tapped ${tapCount} ${tapCount === 1 ? 'time' : 'times'}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WelcomeScreen;
