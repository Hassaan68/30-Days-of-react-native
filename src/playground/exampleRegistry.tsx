import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { WelcomeScreen } from '../../days/day-01-introduction/examples/WelcomeScreen';
import { CourseList } from '../../days/day-03-react-fundamentals/examples/CourseList';
import { HooksShowcase } from '../../days/day-04-react-hooks/examples/HooksShowcase';
import ResponsiveLayoutScreen from '../../days/day-05-styling-and-layout/examples/ResponsiveLayoutScreen';
import CoreComponentsGallery from '../../days/day-06-core-components/examples/CoreComponentsGallery';
import ProfileAppDemo from '../../days/day-07-first-mobile-app/examples/ProfileAppDemo';
import SignUpForm from '../../days/day-09-forms-and-validation/examples/SignUpForm';
import PostsFeedScreen from '../../days/day-11-api-integration/examples/PostsFeedScreen';
import { DeviceToolkitScreen } from '../../days/day-13-device-features/examples/DeviceToolkitScreen';
import { WeatherScreen } from '../../days/day-14-weather-app/examples/WeatherScreen';
import { AnimatedLikeButton } from '../../days/day-15-animations/examples/AnimatedLikeButton';
import { DraggableCard } from '../../days/day-15-animations/examples/DraggableCard';
import { OptimizedProductList } from '../../days/day-16-lists-and-performance/examples/OptimizedProductList';
import { DeviceInfoBanner } from '../../days/day-19-native-modules-and-platform-differences/examples/DeviceInfoBanner';
import { CounterWidget } from '../../days/day-20-testing/examples/CounterWidget';
import { TaskManagerScreen } from '../../days/day-21-task-manager/examples/TaskManagerScreen';
import { AccessibleSettingsRow } from '../../days/day-22-accessibility/examples/AccessibleSettingsRow';
import { AppStateMonitor } from '../../days/day-25-notifications-and-background-tasks/examples/AppStateMonitor';
import { HabitDashboardScreen } from '../../days/day-29-production-mobile-app/examples/HabitDashboardScreen';
import Project01ProfileApp from '../../projects/project-01-profile-app/src/App';
import { WeatherHomeScreen } from '../../projects/project-02-weather-app/src/screens/WeatherHomeScreen';
import { TasksScreen } from '../../projects/project-03-task-manager/src/screens/TasksScreen';
import { AuthProvider, useAuth } from '../../projects/project-04-authentication-app/src/context/AuthProvider';
import { AccountScreen } from '../../projects/project-04-authentication-app/src/screens/AccountScreen';
import { LoginScreen } from '../../projects/project-04-authentication-app/src/screens/LoginScreen';
import { DashboardScreen as Project05DashboardScreen } from '../../projects/project-05-production-mobile-app/src/screens/DashboardScreen';

export type PlaygroundMilestone =
  | 'Days 1–7: Foundations'
  | 'Days 8–14: Real Mobile Dev'
  | 'Days 15–30: Advanced & Production'
  | 'Featured Projects';

export interface PlaygroundEntry {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly sourcePath: string;
  readonly milestone: PlaygroundMilestone;
  readonly render: () => React.JSX.Element;
}

function CenteredPreview({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

function AccessibilityDemoWrapper() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(false);

  return (
    <View style={styles.paddedStack}>
      <AccessibleSettingsRow
        title="Push Notifications"
        description="Receive daily learning streak reminders."
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        hint="Toggles daily learning reminder notifications"
      />
      <AccessibleSettingsRow
        title="Haptic Feedback"
        description="Subtle vibration on task completion."
        value={hapticsEnabled}
        onValueChange={setHapticsEnabled}
        hint="Toggles tactile feedback when completing exercises"
      />
    </View>
  );
}

function Project04AuthInner() {
  const { user } = useAuth();
  return user ? <AccountScreen /> : <LoginScreen />;
}

function Project04AuthDemo() {
  return (
    <AuthProvider>
      <Project04AuthInner />
    </AuthProvider>
  );
}

export const PLAYGROUND_ENTRIES: readonly PlaygroundEntry[] = [
  // Days 1–7: Foundations
  {
    id: 'day-01-welcome',
    badge: 'Day 01',
    title: 'Welcome Screen',
    subtitle: 'First screen with SafeAreaView, Pressable, Platform, and StatusBar',
    sourcePath: 'days/day-01-introduction/examples/WelcomeScreen.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <WelcomeScreen />,
  },
  {
    id: 'day-03-course-list',
    badge: 'Day 03',
    title: 'Course List & Props',
    subtitle: 'Components, props, state, conditional rendering, and list keys',
    sourcePath: 'days/day-03-react-fundamentals/examples/CourseList.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <CourseList />,
  },
  {
    id: 'day-04-hooks',
    badge: 'Day 04',
    title: 'React Hooks Showcase',
    subtitle: 'useDebounce, useRef TextInputInstance focus, useMemo & useCallback',
    sourcePath: 'days/day-04-react-hooks/examples/HooksShowcase.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <HooksShowcase />,
  },
  {
    id: 'day-05-layout',
    badge: 'Day 05',
    title: 'Responsive Layout & Theme',
    subtitle: 'Flexbox, useWindowDimensions, light/dark themes, safe areas',
    sourcePath: 'days/day-05-styling-and-layout/examples/ResponsiveLayoutScreen.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <ResponsiveLayoutScreen />,
  },
  {
    id: 'day-06-core-components',
    badge: 'Day 06',
    title: 'Core Components Gallery',
    subtitle: 'View, Text, Image, Pressable, TextInput, FlatList & Modal',
    sourcePath: 'days/day-06-core-components/examples/CoreComponentsGallery.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <CoreComponentsGallery />,
  },
  {
    id: 'day-07-profile-demo',
    badge: 'Day 07',
    title: 'Week 1 Profile App Demo',
    subtitle: 'Reusable components, theme switching, and screen flow',
    sourcePath: 'days/day-07-first-mobile-app/examples/ProfileAppDemo.tsx',
    milestone: 'Days 1–7: Foundations',
    render: () => <ProfileAppDemo />,
  },

  // Days 8–14: Real Mobile Development
  {
    id: 'day-09-signup-form',
    badge: 'Day 09',
    title: 'Sign-Up Form (RHF + Zod)',
    subtitle: 'Validated mobile form with keyboard chaining and accessible errors',
    sourcePath: 'days/day-09-forms-and-validation/examples/SignUpForm.tsx',
    milestone: 'Days 8–14: Real Mobile Dev',
    render: () => <SignUpForm />,
  },
  {
    id: 'day-11-posts-feed',
    badge: 'Day 11',
    title: 'API Posts Feed (TanStack Query)',
    subtitle: 'Caching, pull-to-refresh, pagination, and mutations',
    sourcePath: 'days/day-11-api-integration/examples/PostsFeedScreen.tsx',
    milestone: 'Days 8–14: Real Mobile Dev',
    render: () => <PostsFeedScreen />,
  },
  {
    id: 'day-13-device-toolkit',
    badge: 'Day 13',
    title: 'Device Features Toolkit',
    subtitle: 'Haptics, clipboard, sharing, permissions, and device utilities',
    sourcePath: 'days/day-13-device-features/examples/DeviceToolkitScreen.tsx',
    milestone: 'Days 8–14: Real Mobile Dev',
    render: () => <DeviceToolkitScreen />,
  },
  {
    id: 'day-14-weather',
    badge: 'Day 14',
    title: 'Live Weather Screen',
    subtitle: 'Open-Meteo API, city search, geolocation, and pull-to-refresh',
    sourcePath: 'days/day-14-weather-app/examples/WeatherScreen.tsx',
    milestone: 'Days 8–14: Real Mobile Dev',
    render: () => <WeatherScreen />,
  },

  // Days 15–30: Advanced & Production
  {
    id: 'day-15-like-button',
    badge: 'Day 15',
    title: 'Animated Like Button',
    subtitle: 'Built-in Animated API with native driver & Reduce Motion support',
    sourcePath: 'days/day-15-animations/examples/AnimatedLikeButton.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => (
      <CenteredPreview>
        <AnimatedLikeButton initialCount={42} />
      </CenteredPreview>
    ),
  },
  {
    id: 'day-15-draggable-card',
    badge: 'Day 15',
    title: 'Draggable Card (Reanimated)',
    subtitle: 'UI-thread Pan + Double-Tap gestures with spring physics',
    sourcePath: 'days/day-15-animations/examples/DraggableCard.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <DraggableCard />,
  },
  {
    id: 'day-16-optimized-list',
    badge: 'Day 16',
    title: 'Optimized 200-Item FlatList',
    subtitle: 'Memoized rows, getItemLayout, and virtualization tuning',
    sourcePath: 'days/day-16-lists-and-performance/examples/OptimizedProductList.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <OptimizedProductList />,
  },
  {
    id: 'day-19-platform-banner',
    badge: 'Day 19',
    title: 'Platform & Device Info Banner',
    subtitle: 'Platform.select, iOS vs Android ergonomics, and native runtime info',
    sourcePath: 'days/day-19-native-modules-and-platform-differences/examples/DeviceInfoBanner.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => (
      <CenteredPreview>
        <DeviceInfoBanner />
      </CenteredPreview>
    ),
  },
  {
    id: 'day-20-counter-widget',
    badge: 'Day 20',
    title: 'Testable Counter Widget',
    subtitle: 'Accessible component backed by Jest & RNTL unit tests',
    sourcePath: 'days/day-20-testing/examples/CounterWidget.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => (
      <CenteredPreview>
        <CounterWidget initialValue={3} min={0} max={10} />
      </CenteredPreview>
    ),
  },
  {
    id: 'day-21-task-manager',
    badge: 'Day 21',
    title: 'Task Manager Demo',
    subtitle: 'Zustand store, CRUD, filtering, and sorting',
    sourcePath: 'days/day-21-task-manager/examples/TaskManagerScreen.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <TaskManagerScreen />,
  },
  {
    id: 'day-22-accessibility',
    badge: 'Day 22',
    title: 'Accessible Settings Rows',
    subtitle: 'Single-focus-stop VoiceOver & TalkBack switch controls',
    sourcePath: 'days/day-22-accessibility/examples/AccessibleSettingsRow.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <AccessibilityDemoWrapper />,
  },
  {
    id: 'day-25-app-state',
    badge: 'Day 25',
    title: 'AppState Lifecycle Monitor',
    subtitle: 'Foreground/background transitions and away-time tracking',
    sourcePath: 'days/day-25-notifications-and-background-tasks/examples/AppStateMonitor.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <AppStateMonitor />,
  },
  {
    id: 'day-29-habit-dashboard',
    badge: 'Day 29',
    title: 'PulseTrack Habit Dashboard',
    subtitle: 'Production-style capstone dashboard preview',
    sourcePath: 'days/day-29-production-mobile-app/examples/HabitDashboardScreen.tsx',
    milestone: 'Days 15–30: Advanced & Production',
    render: () => <HabitDashboardScreen />,
  },

  // Featured Projects
  {
    id: 'project-01-profile',
    badge: 'Project 01',
    title: 'Developer Profile App',
    subtitle: 'Complete Profile & About app with light/dark theme support',
    sourcePath: 'projects/project-01-profile-app/src/App.tsx',
    milestone: 'Featured Projects',
    render: () => <Project01ProfileApp />,
  },
  {
    id: 'project-02-weather',
    badge: 'Project 02',
    title: 'Live Weather App',
    subtitle: 'Open-Meteo forecasts, city search, and GPS weather',
    sourcePath: 'projects/project-02-weather-app/src/screens/WeatherHomeScreen.tsx',
    milestone: 'Featured Projects',
    render: () => <WeatherHomeScreen />,
  },
  {
    id: 'project-03-tasks',
    badge: 'Project 03',
    title: 'Offline-First Task Manager',
    subtitle: 'Persisted Zustand tasks with priority badges, search & sorting',
    sourcePath: 'projects/project-03-task-manager/src/screens/TasksScreen.tsx',
    milestone: 'Featured Projects',
    render: () => <TasksScreen />,
  },
  {
    id: 'project-04-auth',
    badge: 'Project 04',
    title: 'Secure Authentication App',
    subtitle: 'Zod login validation + SecureStore session management',
    sourcePath: 'projects/project-04-authentication-app/src/screens/LoginScreen.tsx',
    milestone: 'Featured Projects',
    render: () => <Project04AuthDemo />,
  },
  {
    id: 'project-05-pulsetrack',
    badge: 'Project 05',
    title: 'PulseTrack Production App',
    subtitle: 'Feature-based habit tracker with analytics, persistence & haptics',
    sourcePath: 'projects/project-05-production-mobile-app/src/screens/DashboardScreen.tsx',
    milestone: 'Featured Projects',
    render: () => <Project05DashboardScreen />,
  },
];

export function findPlaygroundEntry(id: string | undefined): PlaygroundEntry | undefined {
  if (!id) {
    return undefined;
  }
  return PLAYGROUND_ENTRIES.find((entry) => entry.id === id);
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  paddedStack: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
});
