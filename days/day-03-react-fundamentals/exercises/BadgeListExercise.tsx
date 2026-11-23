import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface Badge {
  readonly id: string;
  label: string;
  earned: boolean;
}

type BadgeFilter = 'all' | 'earned' | 'locked';

const INITIAL_BADGES: readonly Badge[] = [
  { id: 'b-1', label: 'First Expo App', earned: true },
  { id: 'b-2', label: 'TypeScript Strict Pro', earned: false },
  { id: 'b-3', label: 'Component Composer', earned: false },
  { id: 'b-4', label: 'Zero Any Hero', earned: false },
];

interface PanelProps {
  title: string;
}

// TODO (Challenge): Style and use this PropsWithChildren wrapper around the badge list.
function Panel({ title, children }: PropsWithChildren<PanelProps>) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

interface BadgePillProps {
  label: string;
  earned: boolean;
  onPress: () => void;
}

// TODO (Beginner): Style earned vs locked states and wire up accessibility props.
function BadgePill({ label, earned, onPress }: BadgePillProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.pill}>
      <Text style={styles.pillText}>
        {earned ? '★ ' : '○ '}
        {label}
      </Text>
    </Pressable>
  );
}

export function BadgeListExercise() {
  const [badges, setBadges] = useState<Badge[]>([...INITIAL_BADGES]);
  const [filter, setFilter] = useState<BadgeFilter>('all');

  // TODO (Intermediate): Immutably toggle the `earned` boolean for the badge matching `badgeId`.
  const handleToggleBadge = (_badgeId: string): void => {
    setBadges((previous) => previous);
  };

  // TODO (Intermediate): Derive `earnedCount` from `badges` during render.
  const earnedCount = 0;

  // TODO (Challenge): Filter `badges` according to the active `filter` state.
  const visibleBadges = badges;

  return (
    <View style={styles.container}>
      <Panel title="Achievement Badges">
        <Text style={styles.summary}>
          {earnedCount} of {badges.length} badges earned (Filter: {filter})
        </Text>

        {/* TODO (Challenge): Add filter buttons for 'all', 'earned', and 'locked' */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setFilter('all')}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>Show All</Text>
        </Pressable>

        {/* TODO (Challenge): Show a conditional empty state when `visibleBadges.length === 0` */}
        <View style={styles.badgeWrap}>
          {visibleBadges.map((badge) => (
            <BadgePill
              key={badge.id}
              label={badge.label}
              earned={badge.earned}
              onPress={() => handleToggleBadge(badge.id)}
            />
          ))}
        </View>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  summary: {
    fontSize: 14,
    color: '#475569',
  },
  filterButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
});

export default BadgeListExercise;
