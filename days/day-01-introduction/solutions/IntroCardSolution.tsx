import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEARNING_REASONS: readonly string[] = [
  'Ship real iOS and Android apps from a single TypeScript codebase',
  'Reuse React and modern frontend skills for native mobile products',
  'Leverage Expo SDK 58 and the New Architecture for production quality',
];

const QUOTES: readonly string[] = [
  'Small daily progress compounds into mastery.',
  'Ship early, learn fast, and iterate with care.',
  'Every great mobile engineer started at Day 01.',
];

function formatPlatformName(os: typeof Platform.OS): string {
  switch (os) {
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    default:
      return os.toUpperCase();
  }
}

export function IntroCardSolution() {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const handleToggleCheckIn = (): void => {
    setIsCheckedIn((previous) => !previous);
  };

  const handleNextQuote = (): void => {
    setQuoteIndex((previous) => (previous + 1) % QUOTES.length);
  };

  const currentQuote = QUOTES[quoteIndex] ?? 'Keep building!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.badgeRow}>
          <View style={styles.platformBadge}>
            <Text style={styles.platformBadgeText}>
              Running on {formatPlatformName(Platform.OS)}
            </Text>
          </View>
          <View style={[styles.statusBadge, isCheckedIn && styles.statusBadgeActive]}>
            <Text style={[styles.statusBadgeText, isCheckedIn && styles.statusBadgeTextActive]}>
              {isCheckedIn ? 'Checked In' : 'Not Checked In'}
            </Text>
          </View>
        </View>

        <Text style={styles.heading}>Alex Rivera</Text>
        <Text style={styles.goal}>
          Goal: Build and publish a production React Native app by Day 30
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why I Am Learning React Native</Text>
          {LEARNING_REASONS.map((reason) => (
            <Text key={reason} style={styles.reasonItem}>
              • {reason}
            </Text>
          ))}
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteLabel}>Daily Motivation</Text>
          <Text style={styles.quoteText}>&ldquo;{currentQuote}&rdquo;</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isCheckedIn ? 'Undo Day 01 check-in' : 'Mark Day 01 as checked in'
          }
          onPress={handleToggleCheckIn}
          style={({ pressed }) => [
            styles.primaryButton,
            isCheckedIn && styles.primaryButtonChecked,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isCheckedIn ? 'Checked In — Day 01 Complete!' : 'Check In for Day 01'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cycle to the next motivational quote"
          onPress={handleNextQuote}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.secondaryButtonText}>Next Quote</Text>
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
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  statusBadgeTextActive: {
    color: '#15803D',
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },
  goal: {
    fontSize: 15,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  reasonItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  quoteBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  quoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    color: '#1E3A8A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonChecked: {
    backgroundColor: '#16A34A',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IntroCardSolution;
