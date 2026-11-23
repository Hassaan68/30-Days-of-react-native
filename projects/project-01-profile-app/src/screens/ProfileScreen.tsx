import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SkillBadge } from '../components/SkillBadge';
import type { DeveloperProfile, Skill, SkillCategory } from '../types/profile';

export interface ProfileScreenProps {
  readonly profile: DeveloperProfile;
  readonly isDarkMode: boolean;
  readonly onOpenAbout: () => void;
}

type CategoryFilter = 'All' | SkillCategory;

const CATEGORIES: readonly CategoryFilter[] = [
  'All',
  'Mobile',
  'Frontend',
  'Backend',
  'Tools',
];

export function ProfileScreen({
  profile,
  isDarkMode,
  onOpenAbout,
}: ProfileScreenProps): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(
    profile.skills[0] ?? null,
  );
  const [isFollowing, setIsFollowing] = useState(false);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') {
      return profile.skills;
    }
    return profile.skills.filter((skill) => skill.category === selectedCategory);
  }, [profile.skills, selectedCategory]);

  const displayedFollowers = profile.stats.followers + (isFollowing ? 1 : 0);

  const handleOpenExternalUrl = async (url: string, label: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot Open Link', `Unable to open ${label} on this device.`);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Link Error', `Something went wrong while opening ${label}.`);
    }
  };

  const handleCategoryChange = (category: CategoryFilter): void => {
    setSelectedCategory(category);
    const nextSkills =
      category === 'All'
        ? profile.skills
        : profile.skills.filter((skill) => skill.category === category);
    setSelectedSkill(nextSkills[0] ?? null);
  };

  const surfaceStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const headingStyle = isDarkMode ? styles.textPrimaryDark : styles.textPrimaryLight;
  const secondaryTextStyle = isDarkMode
    ? styles.textSecondaryDark
    : styles.textSecondaryLight;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Profile Card */}
      <View style={[styles.heroCard, surfaceStyle]}>
        <View style={styles.heroHeader}>
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
            accessibilityLabel={`${profile.fullName} profile photo`}
          />
          <View style={styles.heroMeta}>
            {profile.isAvailableForWork && (
              <View style={styles.availabilityPill}>
                <View style={styles.availabilityDot} />
                <Text style={styles.availabilityText}>Open to opportunities</Text>
              </View>
            )}
            <Text style={[styles.name, headingStyle]}>{profile.fullName}</Text>
            <Text style={[styles.roleTitle, secondaryTextStyle]}>
              {profile.roleTitle}
            </Text>
            <Text style={[styles.location, secondaryTextStyle]}>
              {profile.location}
            </Text>
          </View>
        </View>

        <Text style={[styles.headline, secondaryTextStyle]}>{profile.headline}</Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => setIsFollowing((prev) => !prev)}
            accessibilityRole="button"
            accessibilityState={{ selected: isFollowing }}
            style={({ pressed }) => [
              styles.primaryButton,
              isFollowing && styles.followingButton,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenAbout}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryButton,
              isDarkMode ? styles.secondaryButtonDark : styles.secondaryButtonLight,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, headingStyle]}>
              View Experience
            </Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View
          style={[
            styles.statsRow,
            isDarkMode ? styles.statsRowDark : styles.statsRowLight,
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, headingStyle]}>
              {profile.stats.projectsShipped}
            </Text>
            <Text style={[styles.statLabel, secondaryTextStyle]}>Apps Shipped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, headingStyle]}>
              {profile.stats.openSourceRepos}
            </Text>
            <Text style={[styles.statLabel, secondaryTextStyle]}>Open Source</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, headingStyle]}>
              {displayedFollowers.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, secondaryTextStyle]}>Followers</Text>
          </View>
        </View>
      </View>

      {/* Skills Section */}
      <View style={[styles.sectionCard, surfaceStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, headingStyle]}>Core Skills</Text>
          <Text style={[styles.sectionCount, secondaryTextStyle]}>
            {filteredSkills.length} shown
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => handleCategoryChange(category)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[
                  styles.filterChip,
                  isDarkMode ? styles.filterChipDark : styles.filterChipLight,
                  active && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    secondaryTextStyle,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.skillsGrid}>
          {filteredSkills.map((skill) => (
            <SkillBadge
              key={skill.id}
              skill={skill}
              isSelected={selectedSkill?.id === skill.id}
              isDarkMode={isDarkMode}
              onPress={setSelectedSkill}
            />
          ))}
        </View>

        {selectedSkill !== null && (
          <View
            style={[
              styles.skillDetailBox,
              isDarkMode ? styles.skillDetailDark : styles.skillDetailLight,
            ]}
          >
            <Text style={[styles.skillDetailTitle, headingStyle]}>
              {selectedSkill.name} · {selectedSkill.yearsOfExperience}{' '}
              {selectedSkill.yearsOfExperience === 1 ? 'year' : 'years'}
            </Text>
            <Text style={[styles.skillDetailSummary, secondaryTextStyle]}>
              {selectedSkill.summary}
            </Text>
          </View>
        )}
      </View>

      {/* Social Links Section */}
      <View style={[styles.sectionCard, surfaceStyle]}>
        <Text style={[styles.sectionTitle, headingStyle]}>Connect</Text>
        <View style={styles.linksList}>
          {profile.socialLinks.map((link) => (
            <Pressable
              key={link.id}
              onPress={() => {
                void handleOpenExternalUrl(link.url, link.platform);
              }}
              accessibilityRole="link"
              accessibilityLabel={`Open ${link.platform} profile ${link.handle}`}
              style={({ pressed }) => [
                styles.linkRow,
                isDarkMode ? styles.linkRowDark : styles.linkRowLight,
                pressed && styles.pressed,
              ]}
            >
              <View>
                <Text style={[styles.linkPlatform, headingStyle]}>
                  {link.platform}
                </Text>
                <Text style={[styles.linkHandle, secondaryTextStyle]}>
                  {link.handle}
                </Text>
              </View>
              <Text style={styles.linkChevron}>Open →</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#CBD5E1',
  },
  heroMeta: {
    flex: 1,
    gap: 4,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    marginBottom: 2,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
  },
  headline: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#DBEAFE',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#1D4ED8',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  secondaryButtonDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  statsRowLight: {
    borderTopColor: '#E2E8F0',
  },
  statsRowDark: {
    borderTopColor: '#1E293B',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  filterChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillDetailBox: {
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  skillDetailLight: {
    backgroundColor: '#F1F5F9',
  },
  skillDetailDark: {
    backgroundColor: '#1E293B',
  },
  skillDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  skillDetailSummary: {
    fontSize: 13,
    lineHeight: 19,
  },
  linksList: {
    gap: 10,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  linkRowLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  linkRowDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  linkPlatform: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkHandle: {
    fontSize: 12,
    marginTop: 2,
  },
  linkChevron: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  textPrimaryLight: {
    color: '#0F172A',
  },
  textPrimaryDark: {
    color: '#F8FAFC',
  },
  textSecondaryLight: {
    color: '#475569',
  },
  textSecondaryDark: {
    color: '#94A3B8',
  },
});
