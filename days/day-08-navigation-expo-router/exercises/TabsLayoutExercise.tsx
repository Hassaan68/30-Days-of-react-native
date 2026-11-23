import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export interface TabsLayoutProps {
  unreadCount?: number;
}

interface TabIconProps {
  symbol: string;
  color: string;
  focused: boolean;
}

function TabIcon({ symbol, color, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
      <Text style={[styles.iconText, { color }]} accessibilityElementsHidden>
        {symbol}
      </Text>
    </View>
  );
}

/**
 * Challenge Exercise Helper:
 * Build a custom-scheme deep link such as:
 *   "thirtydays://courses/expo-router"
 *   "thirtydays://courses/expo-router?referrer=home"
 */
export function buildCourseDeepLink(courseId: string, referrer?: string): string {
  // TODO (Challenge): Encode `courseId` and optionally append `?referrer=<encoded>`
  const _unusedReferrer = referrer;
  void _unusedReferrer;
  return `thirtydays://courses/${courseId}`;
}

/**
 * Exercise: Configure a 3-tab bottom navigator (`index`, `explore`, `profile`)
 * plus a hidden `settings` route using Expo Router's `<Tabs>`.
 */
export default function TabsLayoutExercise({ unreadCount = 0 }: TabsLayoutProps) {
  // TODO (Intermediate): Use `unreadCount` to show a badge on the `explore` tab when > 0
  const _unusedUnreadCount = unreadCount;
  void _unusedUnreadCount;

  return (
    <Tabs
      screenOptions={{
        // TODO (Beginner): Set tabBarActiveTintColor and tabBarInactiveTintColor
        headerShown: true,
      }}
    >
      {/* TODO (Beginner & Intermediate): Configure `index`, `explore`, and `profile` screens with `TabIcon` */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon symbol="H" color={color} focused={focused} />
          ),
        }}
      />

      {/* TODO (Challenge): Add a hidden `settings` route using `href: null` */}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFocused: {
    backgroundColor: '#DBEAFE',
  },
  iconText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
