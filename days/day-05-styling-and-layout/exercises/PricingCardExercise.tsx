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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: readonly string[];
  isRecommended?: boolean;
}

export const PLANS: readonly PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    description: 'Everything you need to follow the 30-day React Native track.',
    features: ['All 30 daily lessons', 'Starter exercises', 'Community discussions'],
  },
  {
    id: 'pro',
    name: 'Pro Builder',
    monthlyPrice: 19,
    description: 'Extra code reviews, CI templates, and production checklists.',
    features: [
      'Everything in Starter',
      'EAS Build & Submit templates',
      'Automated test suites',
      'Priority Q&A support',
    ],
    isRecommended: true,
  },
];

type BillingCycle = 'monthly' | 'annual';

function PricingCardsContent() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');

  // TODO (Exercise 2): Derive light and dark palette tokens from colorScheme.
  const isDark = colorScheme === 'dark';

  // TODO (Exercise 3): Use `width >= 700` to switch between stacked and side-by-side layout.
  const isWideLayout = width >= 700;

  // TODO (Exercise 3): Apply a 20% discount when billingCycle === 'annual'.
  const formatPrice = (monthlyPrice: number): string => {
    if (monthlyPrice === 0) {
      return '$0';
    }
    const effectivePrice = billingCycle === 'annual' ? monthlyPrice : monthlyPrice;
    return `$${effectivePrice}/mo`;
  };

  // TODO (Exercise 2): Replace with Platform.select shadow (iOS) / elevation (Android).
  const _platformName = Platform.OS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Choose Your Plan ({isDark ? 'Dark' : 'Light'})</Text>

        {/* TODO (Exercise 3): Build a polished Monthly / Annual toggle control */}
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setBillingCycle('monthly')}
            style={styles.toggleButton}
            accessibilityRole="button"
          >
            <Text>Monthly</Text>
          </Pressable>
          <Pressable
            onPress={() => setBillingCycle('annual')}
            style={styles.toggleButton}
            accessibilityRole="button"
          >
            <Text>Annual</Text>
          </Pressable>
        </View>

        {/* TODO (Exercises 1, 2, 3): Render each plan card with theme colors, shadows,
            a "Most Popular" badge for isRecommended, feature rows, and responsive width */}
        <View style={isWideLayout ? styles.wideGrid : styles.stackedGrid}>
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <View key={plan.id} style={styles.card}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.price}>{formatPrice(plan.monthlyPrice)}</Text>
                <Text>{plan.description}</Text>

                <Pressable
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={styles.selectButton}
                  accessibilityRole="button"
                >
                  <Text>{isSelected ? 'Selected' : 'Select Plan'}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PricingCardExercise() {
  return (
    <SafeAreaProvider>
      <PricingCardsContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stackedGrid: {
    gap: 16,
  },
  wideGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
  },
  selectButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
});
