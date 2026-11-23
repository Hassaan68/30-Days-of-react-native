import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Habit, HabitCategory } from '../features/habits/types';

export interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  currentStreak: number;
  onToggle: (habitId: string) => void;
  onArchive?: (habitId: string) => void;
}

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  focus: 'Focus',
  health: 'Health',
  learning: 'Learning',
  mindfulness: 'Mindfulness',
};

const CATEGORY_ACCENTS: Record<HabitCategory, { bg: string; text: string }> = {
  focus: { bg: '#DBEAFE', text: '#1D4ED8' },
  health: { bg: '#DCFCE7', text: '#15803D' },
  learning: { bg: '#FEF3C7', text: '#B45309' },
  mindfulness: { bg: '#F3E8FF', text: '#7E22CE' },
};

function HabitCardComponent({
  habit,
  isCompletedToday,
  currentStreak,
  onToggle,
  onArchive,
}: HabitCardProps) {
  const accent = CATEGORY_ACCENTS[habit.category];
  const streakLabel = currentStreak === 1 ? '1 day streak' : `${currentStreak} day streak`;

  return (
    <View style={[styles.card, isCompletedToday ? styles.cardCompleted : undefined]}>
      <View style={styles.topRow}>
        <Pressable
          testID={`habit-toggle-${habit.id}`}
          onPress={() => onToggle(habit.id)}
          style={({ pressed }) => [
            styles.checkbox,
            isCompletedToday ? styles.checkboxChecked : undefined,
            pressed ? styles.checkboxPressed : undefined,
          ]}
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark ${habit.title} as ${isCompletedToday ? 'incomplete' : 'complete'}`}
          accessibilityState={{ checked: isCompletedToday }}
          hitSlop={8}
        >
          <Text style={[styles.checkmark, isCompletedToday ? styles.checkmarkChecked : undefined]}>
            {isCompletedToday ? '✓' : ''}
          </Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: accent.bg }]}>
              <Text style={[styles.categoryText, { color: accent.text }]}>
                {CATEGORY_LABELS[habit.category]}
              </Text>
            </View>
            <Text style={styles.durationText}>{habit.targetMinutes} min</Text>
          </View>

          <Text style={[styles.title, isCompletedToday ? styles.titleCompleted : undefined]}>
            {habit.title}
          </Text>

          {habit.notes.length > 0 ? (
            <Text style={styles.notes} numberOfLines={2}>
              {habit.notes}
            </Text>
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.streakText}>{streakLabel}</Text>
            {onArchive ? (
              <Pressable
                testID={`habit-archive-${habit.id}`}
                onPress={() => onArchive(habit.id)}
                style={({ pressed }) => [
                  styles.archiveButton,
                  pressed ? styles.archiveButtonPressed : undefined,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Archive ${habit.title}`}
                hitSlop={8}
              >
                <Text style={styles.archiveText}>Archive</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

export const HabitCard = memo(HabitCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardCompleted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  checkboxPressed: {
    opacity: 0.8,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: 'transparent',
  },
  checkmarkChecked: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#166534',
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  archiveButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  archiveButtonPressed: {
    backgroundColor: '#E2E8F0',
  },
  archiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
