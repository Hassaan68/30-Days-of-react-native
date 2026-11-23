import { useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export interface ShowcaseProject {
  id: string;
  name: string;
  tagline: string;
  platform: 'iOS & Android' | 'Expo Universal';
  baseStars: number;
}

export const PROJECTS: readonly ShowcaseProject[] = [
  {
    id: 'pulse-weather',
    name: 'Pulse Weather',
    tagline: 'Minimal forecast app with adaptive themes and smooth hourly charts.',
    platform: 'iOS & Android',
    baseStars: 142,
  },
  {
    id: 'focus-tasks',
    name: 'Focus Tasks',
    tagline: 'Offline-first task manager built with TypeScript and Expo.',
    platform: 'Expo Universal',
    baseStars: 218,
  },
];

type ProfileTab = 'overview' | 'projects';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  successBg: string;
  successText: string;
  amberBg: string;
  amberText: string;
}

const LIGHT_COLORS: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  successBg: '#DCFCE7',
  successText: '#15803D',
  amberBg: '#FEF3C7',
  amberText: '#B45309',
};

const DARK_COLORS: ThemeColors = {
  background: '#0B1120',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  primary: '#60A5FA',
  primaryText: '#0B1120',
  successBg: '#14532D',
  successText: '#86EFAC',
  amberBg: '#451A03',
  amberText: '#FCD34D',
};

interface SectionCardProps {
  title: string;
  colors: ThemeColors;
  children: ReactNode;
}

function SectionCard({ title, colors, children }: SectionCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

function ProfileSectionContent() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isAvailable, setIsAvailable] = useState(true);
  const [bio, setBio] = useState(
    'Learning React Native & Expo SDK 58 by shipping real apps every week.',
  );
  const [draftBio, setDraftBio] = useState(bio);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>(['focus-tasks']);

  const toggleStar = (projectId: string) => {
    setStarredIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    );
  };

  const openEditBio = () => {
    setDraftBio(bio);
    setIsEditModalOpen(true);
  };

  const handleSaveBio = () => {
    const trimmed = draftBio.trim();
    if (trimmed.length > 0) {
      setBio(trimmed);
    }
    setIsEditModalOpen(false);
  };

  const totalStars = PROJECTS.reduce(
    (sum, project) => sum + project.baseStars + (starredIds.includes(project.id) ? 1 : 0),
    0,
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Developer Workspace</Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isAvailable ? colors.successBg : colors.amberBg },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: isAvailable ? colors.successText : colors.amberText },
              ]}
            >
              {isAvailable ? 'Available for Hire' : 'Focused on Building'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tabBar,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
          ]}
        >
          {(['overview', 'projects'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [
                  styles.tabButton,
                  isActive && { backgroundColor: colors.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  {tab === 'overview' ? 'Overview' : `Projects (${PROJECTS.length})`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'overview' ? (
          <>
            <SectionCard title="About Me" colors={colors}>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{bio}</Text>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={openEditBio}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
                    Edit Bio
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsAvailable((prev) => !prev)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                    Switch Status
                  </Text>
                </Pressable>
              </View>
            </SectionCard>

            <SectionCard title="Portfolio Summary" colors={colors}>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                Showcasing {PROJECTS.length} featured React Native apps with {totalStars} total
                community stars.
              </Text>
            </SectionCard>
          </>
        ) : (
          <View style={styles.projectsList}>
            {PROJECTS.map((project) => {
              const isStarred = starredIds.includes(project.id);
              const starCount = project.baseStars + (isStarred ? 1 : 0);

              return (
                <SectionCard key={project.id} title={project.name} colors={colors}>
                  <View style={[styles.platformBadge, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.platformBadgeText, { color: colors.primary }]}>
                      {project.platform}
                    </Text>
                  </View>

                  <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                    {project.tagline}
                  </Text>

                  <Pressable
                    onPress={() => toggleStar(project.id)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isStarred }}
                    style={({ pressed }) => [
                      styles.starButton,
                      {
                        backgroundColor: isStarred ? colors.primary : colors.surfaceMuted,
                        borderColor: isStarred ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.starButtonText,
                        { color: isStarred ? colors.primaryText : colors.textPrimary },
                      ]}
                    >
                      {isStarred ? '★ Starred' : '☆ Star Project'} • {starCount}
                    </Text>
                  </Pressable>
                </SectionCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Edit Bio</Text>
            <TextInput
              value={draftBio}
              onChangeText={setDraftBio}
              multiline
              maxLength={200}
              placeholder="Write a short bio..."
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => setIsEditModalOpen(false)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveBio}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
                  Save Bio
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function ProfileSectionSolution() {
  return (
    <SafeAreaProvider>
      <ProfileSectionContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  projectsList: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  platformBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  starButton: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  starButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    padding: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    gap: 14,
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
});
