import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Skill, SkillCategory } from '../types/profile';

export interface SkillBadgeProps {
  readonly skill: Skill;
  readonly isSelected: boolean;
  readonly isDarkMode: boolean;
  readonly onPress: (skill: Skill) => void;
}

const CATEGORY_ACCENT: Record<SkillCategory, string> = {
  Mobile: '#2563EB',
  Frontend: '#7C3AED',
  Backend: '#059669',
  Tools: '#D97706',
};

export function SkillBadge({
  skill,
  isSelected,
  isDarkMode,
  onPress,
}: SkillBadgeProps): React.JSX.Element {
  const accentColor = CATEGORY_ACCENT[skill.category];

  return (
    <Pressable
      onPress={() => onPress(skill)}
      accessibilityRole="button"
      accessibilityLabel={`${skill.name}, ${skill.level} level in ${skill.category}`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.badge,
        isDarkMode ? styles.badgeDark : styles.badgeLight,
        isSelected && {
          backgroundColor: accentColor,
          borderColor: accentColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isSelected ? '#FFFFFF' : accentColor },
        ]}
      />
      <Text
        style={[
          styles.label,
          isDarkMode ? styles.labelDark : styles.labelLight,
          isSelected && styles.labelSelected,
        ]}
      >
        {skill.name}
      </Text>
      <Text
        style={[
          styles.level,
          isDarkMode ? styles.levelDark : styles.levelLight,
          isSelected && styles.levelSelected,
        ]}
      >
        {skill.level}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  badgeDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelLight: {
    color: '#0F172A',
  },
  labelDark: {
    color: '#F8FAFC',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  level: {
    fontSize: 11,
    fontWeight: '500',
  },
  levelLight: {
    color: '#64748B',
  },
  levelDark: {
    color: '#94A3B8',
  },
  levelSelected: {
    color: '#E0F2FE',
  },
});
