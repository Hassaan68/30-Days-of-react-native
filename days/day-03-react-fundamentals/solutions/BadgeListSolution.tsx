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

const FILTERS: readonly BadgeFilter[] = ['all', 'earned', 'locked'];

interface PanelProps {
  title: string;
}

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

function BadgePill({ label, earned, onPress }: BadgePillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} badge, ${earned ? 'earned' : 'locked'}. Tap to toggle.`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        earned ? styles.pillEarned : styles.pillLocked,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.pillText, earned && styles.pillTextEarned]}>
        {earned ? '★ ' : '○ '}
        {label}
      </Text>
    </Pressable>
  );
}

export function BadgeListSolution() {
  const [badges, setBadges] = useState<Badge[]>([...INITIAL_BADGES]);
  const [filter, setFilter] = useState<BadgeFilter>('all');

  const handleToggleBadge = (badgeId: string): void => {
    setBadges((previous) =>
      previous.map((badge) =>
        badge.id === badgeId ? { ...badge, earned: !badge.earned } : badge,
      ),
    );
  };

  const earnedCount = badges.filter((badge) => badge.earned).length;
  const allEarned = badges.length > 0 && earnedCount === badges.length;

  const visibleBadges = badges.filter((badge) => {
    if (filter === 'earned') {
      return badge.earned;
    }
    if (filter === 'locked') {
      return !badge.earned;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Panel title="Achievement Badges">
        <Text style={styles.summary}>
          {earnedCount} of {badges.length} badges earned
        </Text>

        {allEarned && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>All badges unlocked — great job!</Text>
          </View>
        )}

        <View style={styles.filterRow}>
          {FILTERS.map((option) => {
            const isSelected = filter === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Show ${option} badges`}
                onPress={() => setFilter(option)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {visibleBadges.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {filter} badges to display.</Text>
          </View>
        ) : (
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
        )}
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
    padding: 18,
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
    fontWeight: '600',
    color: '#475569',
  },
  banner: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillEarned: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  pillLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  pressed: {
    opacity: 0.85,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextEarned: {
    color: '#92400E',
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default BadgeListSolution;
