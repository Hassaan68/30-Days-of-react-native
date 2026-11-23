import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root navigation layout (`app/_layout.tsx`) demonstrating:
 * - Global SafeAreaProvider wrapping the navigation tree
 * - Shared Stack header styling via `screenOptions`
 * - Route groups like `(tabs)` and `(auth)`
 * - Dynamic detail routes (`courses/[id]`) and modal presentation
 */
export default function RootStackLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#0F172A',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#F8FAFC',
          },
        }}
      >
        {/* Main bottom-tab navigator hides the outer Stack header so each tab controls its own */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Unauthenticated flow grouped under app/(auth)/ */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />

        {/* Dynamic route: matches /courses/rn-101, /courses/expo-router, etc. */}
        <Stack.Screen
          name="courses/[id]"
          options={{
            title: 'Course Details',
            headerBackTitle: 'Back',
          }}
        />

        {/* Modal route: slides up over the active stack on iOS/Android */}
        <Stack.Screen
          name="filter-modal"
          options={{
            title: 'Filter Courses',
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
