import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Course {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  summary: string;
  nextCourseId?: string;
}

const COURSE_CATALOG: Readonly<Record<string, Course>> = {
  'rn-101': {
    id: 'rn-101',
    title: 'React Native Core Components',
    level: 'Beginner',
    durationMinutes: 45,
    summary: 'Master View, Text, Pressable, FlatList, and Flexbox layouts on iOS and Android.',
    nextCourseId: 'expo-router',
  },
  'expo-router': {
    id: 'expo-router',
    title: 'File-Based Routing with Expo Router',
    level: 'Intermediate',
    durationMinutes: 60,
    summary: 'Build nested stacks, native tabs, dynamic routes, and universal deep links.',
    nextCourseId: 'rn-state',
  },
  'rn-state': {
    id: 'rn-state',
    title: 'Scalable State Architecture',
    level: 'Advanced',
    durationMinutes: 55,
    summary: 'Combine React Context, Zustand v5, and TanStack Query without unnecessary re-renders.',
  },
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Dynamic screen (`app/courses/[id].tsx`) demonstrating:
 * - Reading dynamic segment and query params with `useLocalSearchParams`
 * - Updating the screen header dynamically with `<Stack.Screen options={...} />`
 * - Declarative navigation via `<Link>` and imperative navigation via `useRouter`
 */
export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = getFirstParam(params.id);
  const referrer = getFirstParam(params.referrer);
  const course = courseId ? COURSE_CATALOG[courseId] : undefined;

  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Course Not Found' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Course Not Found</Text>
          <Text style={styles.emptyBody}>
            We could not find a course with ID &ldquo;{courseId ?? 'unknown'}&rdquo;.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back to courses"
          >
            <Text style={styles.primaryButtonText}>Return to Courses</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Dynamically override the Stack header title based on the loaded course */}
      <Stack.Screen options={{ title: course.title }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.level}</Text>
          </View>
          <Text style={styles.duration}>{course.durationMinutes} min</Text>
        </View>

        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.summary}>{course.summary}</Text>

        {referrer ? (
          <View style={styles.referrerBox}>
            <Text style={styles.referrerText}>Opened from: {referrer}</Text>
          </View>
        ) : null}

        {/* Declarative navigation using <Link> with asChild for custom Pressable styling */}
        {course.nextCourseId ? (
          <Link
            href={{
              pathname: '/courses/[id]',
              params: { id: course.nextCourseId, referrer: course.id },
            }}
            asChild
          >
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              accessibilityRole="link"
            >
              <Text style={styles.primaryButtonText}>Continue to Next Course</Text>
            </Pressable>
          </Link>
        ) : null}

        {/* Imperative navigation using useRouter() */}
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/filter-modal')}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Open Filter Modal</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          accessibilityRole="button"
        >
          <Text style={styles.ghostButtonText}>Go Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  duration: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  referrerBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
  },
  referrerText: {
    color: '#475569',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyBody: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
  },
});
