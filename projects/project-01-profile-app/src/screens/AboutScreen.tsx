import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { DeveloperProfile } from '../types/profile';

export interface AboutScreenProps {
  readonly profile: DeveloperProfile;
  readonly isDarkMode: boolean;
}

export function AboutScreen({
  profile,
  isDarkMode,
}: AboutScreenProps): React.JSX.Element {
  const surfaceStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const headingStyle = isDarkMode ? styles.textPrimaryDark : styles.textPrimaryLight;
  const secondaryTextStyle = isDarkMode
    ? styles.textSecondaryDark
    : styles.textSecondaryLight;

  const handleSendEmail = async (): Promise<void> => {
    const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
      'Hello from your React Native Profile App',
    )}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert('Email Unavailable', `Reach me directly at ${profile.email}`);
        return;
      }
      await Linking.openURL(mailtoUrl);
    } catch {
      Alert.alert('Email Error', `Please email ${profile.email} manually.`);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Bio Card */}
      <View style={[styles.card, surfaceStyle]}>
        <Text style={[styles.sectionTitle, headingStyle]}>About Me</Text>
        <Text style={[styles.bodyText, secondaryTextStyle]}>{profile.bio}</Text>
      </View>

      {/* Experience Timeline */}
      <View style={[styles.card, surfaceStyle]}>
        <Text style={[styles.sectionTitle, headingStyle]}>Experience</Text>
        <View style={styles.timeline}>
          {profile.experience.map((item) => (
            <View
              key={item.id}
              style={[
                styles.timelineItem,
                isDarkMode ? styles.timelineItemDark : styles.timelineItemLight,
              ]}
            >
              <View style={styles.timelineHeader}>
                <Text style={[styles.roleTitle, headingStyle]}>{item.role}</Text>
                <Text style={styles.periodBadge}>{item.period}</Text>
              </View>
              <Text style={[styles.companyText, secondaryTextStyle]}>
                {item.company} · {item.location}
              </Text>
              <View style={styles.highlightsList}>
                {item.highlights.map((highlight) => (
                  <Text
                    key={highlight}
                    style={[styles.highlightItem, secondaryTextStyle]}
                  >
                    • {highlight}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Engineering Values */}
      <View style={[styles.card, surfaceStyle]}>
        <Text style={[styles.sectionTitle, headingStyle]}>
          Engineering Principles
        </Text>
        <View style={styles.valuesList}>
          {profile.engineeringValues.map((value, index) => (
            <View
              key={value}
              style={[
                styles.valueRow,
                isDarkMode ? styles.valueRowDark : styles.valueRowLight,
              ]}
            >
              <Text style={styles.valueIndex}>0{index + 1}</Text>
              <Text style={[styles.valueText, headingStyle]}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact CTA */}
      <View style={[styles.card, surfaceStyle]}>
        <Text style={[styles.sectionTitle, headingStyle]}>Get in Touch</Text>
        <Text style={[styles.bodyText, secondaryTextStyle]}>
          Interested in collaborating on a React Native or Expo project? Send a quick
          note directly from your device.
        </Text>
        <Pressable
          onPress={() => {
            void handleSendEmail();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Send email to ${profile.email}`}
          style={({ pressed }) => [
            styles.emailButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.emailButtonText}>Email {profile.email}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  timeline: {
    gap: 14,
  },
  timelineItem: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    gap: 4,
  },
  timelineItemLight: {
    backgroundColor: '#F8FAFC',
  },
  timelineItemDark: {
    backgroundColor: '#1E293B',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  companyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  highlightsList: {
    marginTop: 6,
    gap: 4,
  },
  highlightItem: {
    fontSize: 13,
    lineHeight: 19,
  },
  valuesList: {
    gap: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  valueRowLight: {
    backgroundColor: '#F8FAFC',
  },
  valueRowDark: {
    backgroundColor: '#1E293B',
  },
  valueIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  emailButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  textPrimaryLight: {
    color: '#0F172A',
  },
  textPrimaryDark: {
    color: '#F8FAFC',
  },
  textSecondaryLight: {
    color: '#475569',
  },
  textSecondaryDark: {
    color: '#94A3B8',
  },
});
