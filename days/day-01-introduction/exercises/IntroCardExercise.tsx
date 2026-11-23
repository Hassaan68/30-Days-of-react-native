import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEARNING_REASONS: readonly string[] = [
  'Build iOS and Android apps from one TypeScript codebase',
  'TODO: Add your second reason here',
  'TODO: Add your third reason here',
];

const QUOTES: readonly string[] = [
  'Small daily progress compounds into mastery.',
  'Ship early, learn fast, and iterate with care.',
  'Every great mobile engineer started at Day 01.',
];

export function IntroCardExercise() {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // TODO (Intermediate): Toggle `isCheckedIn` when the user taps the check-in button.
  const handleToggleCheckIn = (): void => {
    setIsCheckedIn((prev) => !prev);
  };

  // TODO (Challenge): Advance `quoteIndex` and wrap around when reaching the end of `QUOTES`.
  const handleNextQuote = (): void => {
    setQuoteIndex((prev) => prev);
  };

  const currentQuote = QUOTES[quoteIndex] ?? 'Keep building!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TODO (Challenge): Style this platform indicator as a pill badge */}
        <Text style={styles.platformText}>Platform: {Platform.OS}</Text>

        {/* TODO (Beginner): Replace with your own name and learning goal */}
        <Text style={styles.heading}>Your Name Here</Text>
        <Text style={styles.goal}>Goal: Build production-ready mobile apps in 30 days</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why I Am Learning React Native</Text>
          {LEARNING_REASONS.map((reason) => (
            <Text key={reason} style={styles.reasonItem}>
              • {reason}
            </Text>
          ))}
        </View>

        <Text style={styles.quote}>&ldquo;{currentQuote}&rdquo;</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Day 01 check-in status"
          onPress={handleToggleCheckIn}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {isCheckedIn ? 'Checked In' : 'Check In for Day 01'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show next motivational quote"
          onPress={handleNextQuote}
          style={styles.secondaryButton}
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
    gap: 12,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  goal: {
    fontSize: 15,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  reasonItem: {
    fontSize: 14,
    color: '#334155',
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#475569',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IntroCardExercise;
