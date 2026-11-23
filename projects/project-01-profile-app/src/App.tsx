import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AboutScreen } from './screens/AboutScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import type { ActiveTab, DeveloperProfile } from './types/profile';

export const SAMPLE_PROFILE: DeveloperProfile = {
  fullName: 'Amina Patel',
  roleTitle: 'React Native & TypeScript Engineer',
  location: 'Toronto, Canada',
  email: 'amina.patel@example.dev',
  avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
  isAvailableForWork: true,
  headline:
    'Building accessible, offline-capable mobile experiences with React Native, Expo SDK 58, and strict TypeScript.',
  bio: 'I specialize in cross-platform mobile engineering with a strong focus on clean UI architecture, predictable state management, and smooth 60fps user interactions. Over the last four years, I have helped startups ship consumer iOS and Android apps from prototype to App Store release.',
  stats: {
    projectsShipped: 12,
    openSourceRepos: 18,
    followers: 1420,
  },
  skills: [
    {
      id: 'rn',
      name: 'React Native',
      category: 'Mobile',
      level: 'Advanced',
      yearsOfExperience: 4,
      summary:
        'Cross-platform iOS & Android apps using the New Architecture, Flexbox layouts, and native device APIs.',
    },
    {
      id: 'expo',
      name: 'Expo SDK 58',
      category: 'Mobile',
      level: 'Advanced',
      yearsOfExperience: 4,
      summary:
        'Managed workflows, Expo Router file-based navigation, EAS Build pipelines, and OTA updates.',
    },
    {
      id: 'ts',
      name: 'TypeScript',
      category: 'Frontend',
      level: 'Advanced',
      yearsOfExperience: 5,
      summary:
        'Strict typing, discriminated unions, generics, and type-safe API contracts with Zod.',
    },
    {
      id: 'react',
      name: 'React 19',
      category: 'Frontend',
      level: 'Advanced',
      yearsOfExperience: 5,
      summary:
        'Composable hooks, memoization strategies, accessible component design systems, and state modeling.',
    },
    {
      id: 'node',
      name: 'Node.js APIs',
      category: 'Backend',
      level: 'Intermediate',
      yearsOfExperience: 3,
      summary:
        'REST and WebSocket services tailored for mobile clients with token rotation and pagination.',
    },
    {
      id: 'jest',
      name: 'Jest & RNTL',
      category: 'Tools',
      level: 'Intermediate',
      yearsOfExperience: 3,
      summary:
        'Unit and component testing for critical user flows, form validation, and offline storage.',
    },
  ],
  socialLinks: [
    {
      id: 'github',
      platform: 'GitHub',
      handle: '@aminapatel-dev',
      url: 'https://github.com',
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      handle: 'in/aminapatel-mobile',
      url: 'https://www.linkedin.com',
    },
    {
      id: 'portfolio',
      platform: 'Portfolio',
      handle: 'aminapatel.dev',
      url: 'https://reactnative.dev',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Mobile Engineer',
      company: 'Northstar Health',
      period: '2024 – Present',
      location: 'Remote',
      highlights: [
        'Led migration to React Native New Architecture, reducing cold start time by 28%.',
        'Built an accessible shared design system consumed across 35+ mobile screens.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Mobile Application Developer',
      company: 'Harbor Commerce',
      period: '2022 – 2024',
      location: 'Toronto, ON',
      highlights: [
        'Shipped offline-first order tracking for field staff on both iOS and Android.',
        'Automated pull-request typechecking, linting, and Jest component tests in CI.',
      ],
    },
  ],
  engineeringValues: [
    'Accessibility and readability come first on every screen size.',
    'Strict TypeScript types prevent runtime crashes before code ever ships.',
    'Small, composable components make apps easier to test and evolve.',
  ],
};

function ProfileAppContent(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Top Navigation Header */}
      <View
        style={[
          styles.header,
          isDarkMode ? styles.headerDark : styles.headerLight,
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            isDarkMode ? styles.textDark : styles.textLight,
          ]}
        >
          Developer Profile
        </Text>
        <View
          style={[
            styles.segmentedControl,
            isDarkMode ? styles.segmentedDark : styles.segmentedLight,
          ]}
        >
          <Pressable
            onPress={() => setActiveTab('profile')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'profile' }}
            style={[
              styles.segmentButton,
              activeTab === 'profile' && styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                isDarkMode ? styles.segmentTextDark : styles.segmentTextLight,
                activeTab === 'profile' && styles.segmentTextActive,
              ]}
            >
              Profile
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('about')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'about' }}
            style={[
              styles.segmentButton,
              activeTab === 'about' && styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                isDarkMode ? styles.segmentTextDark : styles.segmentTextLight,
                activeTab === 'about' && styles.segmentTextActive,
              ]}
            >
              About
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Active Screen */}
      <View style={styles.screenWrapper}>
        {activeTab === 'profile' ? (
          <ProfileScreen
            profile={SAMPLE_PROFILE}
            isDarkMode={isDarkMode}
            onOpenAbout={() => setActiveTab('about')}
          />
        ) : (
          <AboutScreen profile={SAMPLE_PROFILE} isDarkMode={isDarkMode} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ProfileAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F1F5F9',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentedLight: {
    backgroundColor: '#F1F5F9',
  },
  segmentedDark: {
    backgroundColor: '#1E293B',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#2563EB',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextLight: {
    color: '#475569',
  },
  segmentTextDark: {
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  screenWrapper: {
    flex: 1,
  },
});
