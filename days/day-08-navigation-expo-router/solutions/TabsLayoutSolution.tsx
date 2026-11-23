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
 * Builds a properly encoded custom-scheme deep link for a course detail route.
 */
export function buildCourseDeepLink(courseId: string, referrer?: string): string {
  const encodedId = encodeURIComponent(courseId.trim());
  const baseUrl = `thirtydays://courses/${encodedId}`;

  if (referrer && referrer.trim().length > 0) {
    const encodedReferrer = encodeURIComponent(referrer.trim());
    return `${baseUrl}?referrer=${encodedReferrer}`;
  }

  return baseUrl;
}

/**
 * Complete solution for Day 08:
 * - Three visible bottom tabs (`index`, `explore`, `profile`)
 * - Active/inactive styling and custom icons
 * - Conditional notification badge on `explore`
 * - Hidden `settings` route navigable imperatively without cluttering the tab bar
 */
export default function TabsLayoutSolution({ unreadCount = 0 }: TabsLayoutProps) {
  const exploreBadge = unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#0F172A',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon symbol="H" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarAccessibilityLabel:
            unreadCount > 0 ? `Explore tab, ${unreadCount} unread updates` : 'Explore tab',
          tabBarBadge: exploreBadge,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon symbol="E" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon symbol="P" color={color} focused={focused} />
          ),
        }}
      />

      {/* Accessible via router.push('/settings') while staying hidden from the bottom tab bar */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: null,
        }}
      />
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
