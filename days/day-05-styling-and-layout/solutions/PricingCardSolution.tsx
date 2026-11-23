import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
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

interface ThemePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
}

const LIGHT_THEME: ThemePalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#E2E8F0',
  border: '#CBD5E1',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  badgeBg: '#DBEAFE',
  badgeText: '#1D4ED8',
};

const DARK_THEME: ThemePalette = {
  background: '#0B1120',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  border: '#334155',
  primary: '#60A5FA',
  primaryText: '#0B1120',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  badgeBg: '#1E3A8A',
  badgeText: '#BFDBFE',
};

function getCardElevation(isDark: boolean): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.35 : 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: isDark ? 6 : 3,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    }) ?? {}
  );
}

function PricingCardsContent() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');

  const isDark = colorScheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const isWideLayout = width >= 700;
  const cardElevation = getCardElevation(isDark);

  const formatPrice = (monthlyPrice: number): string => {
    if (monthlyPrice === 0) {
      return '$0';
    }
    const finalPrice = billingCycle === 'annual' ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `$${finalPrice}/mo`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Choose Your Plan</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Save 20% when billed annually. Layout adapts automatically for phones and tablets.
          </Text>
        </View>

        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
          ]}
        >
          {(['monthly', 'annual'] as const).map((cycle) => {
            const isActive = billingCycle === cycle;
            return (
              <Pressable
                key={cycle}
                onPress={() => setBillingCycle(cycle)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [
                  styles.toggleOption,
                  isActive && { backgroundColor: theme.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    { color: isActive ? theme.textPrimary : theme.textSecondary },
                  ]}
                >
                  {cycle === 'monthly' ? 'Monthly' : 'Annual (Save 20%)'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={isWideLayout ? styles.wideGrid : styles.stackedGrid}>
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const highlightBorder = plan.isRecommended || isSelected;

            return (
              <View
                key={plan.id}
                style={[
                  styles.card,
                  cardElevation,
                  {
                    backgroundColor: theme.surface,
                    borderColor: highlightBorder ? theme.primary : theme.border,
                    borderWidth: highlightBorder ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.planName, { color: theme.textPrimary }]}>{plan.name}</Text>
                  {plan.isRecommended ? (
                    <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: theme.badgeText }]}>
                        Most Popular
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.price, { color: theme.textPrimary }]}>
                  {formatPrice(plan.monthlyPrice)}
                </Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {plan.description}
                </Text>

                <View style={styles.featureList}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                      <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => setSelectedPlanId(plan.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.selectButton,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      { color: isSelected ? theme.primaryText : theme.textPrimary },
                    ]}
                  >
                    {isSelected ? 'Selected Plan' : 'Select Plan'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PricingCardSolution() {
  return (
    <SafeAreaProvider>
      <PricingCardsContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 20,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: 6,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  toggleOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  stackedGrid: {
    gap: 16,
  },
  wideGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    gap: 8,
    marginTop: 4,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
