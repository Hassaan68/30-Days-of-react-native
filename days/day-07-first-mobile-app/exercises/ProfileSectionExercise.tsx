import { useState } from 'react';
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

function ProfileSectionContent() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isAvailable, setIsAvailable] = useState(true);
  const [bio, setBio] = useState(
    'Learning React Native & Expo SDK 58 by shipping real apps every week.',
  );
  const [draftBio, setDraftBio] = useState(bio);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>([]);

  // TODO (Exercise 2): Build full light/dark color palettes derived from colorScheme.
  const isDark = colorScheme === 'dark';

  // TODO (Exercise 1): Toggle project ID inside starredIds.
  const toggleStar = (projectId: string) => {
    setStarredIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    );
  };

  // TODO (Exercise 3): Open the edit modal with current bio and save non-empty edits.
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

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.heading, isDark && styles.darkText]}>Developer Workspace</Text>

        {/* TODO (Exercise 3): Style this tab switcher cleanly for Overview vs Projects */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('overview')}
            style={styles.tabButton}
            accessibilityRole="tab"
          >
            <Text>Overview</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('projects')}
            style={styles.tabButton}
            accessibilityRole="tab"
          >
            <Text>Projects ({PROJECTS.length})</Text>
          </Pressable>
        </View>

        {activeTab === 'overview' ? (
          <View style={styles.card}>
            {/* TODO (Exercise 2): Display availability status pill and toggle button */}
            <Text style={styles.cardTitle}>
              Status: {isAvailable ? 'Available for Hire' : 'Focused on Building'}
            </Text>
            <Pressable
              onPress={() => setIsAvailable((prev) => !prev)}
              style={styles.button}
              accessibilityRole="button"
            >
              <Text>Toggle Availability</Text>
            </Pressable>

            <Text style={styles.bioText}>{bio}</Text>

            <Pressable onPress={openEditBio} style={styles.button} accessibilityRole="button">
              <Text>Edit Bio</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {/* TODO (Exercise 1): Render polished project cards with platform badge and star toggle */}
            {PROJECTS.map((project) => {
              const isStarred = starredIds.includes(project.id);
              const starCount = project.baseStars + (isStarred ? 1 : 0);
              return (
                <View key={project.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{project.name}</Text>
                  <Text>{project.tagline}</Text>
                  <Pressable
                    onPress={() => toggleStar(project.id)}
                    style={styles.button}
                    accessibilityRole="button"
                  >
                    <Text>
                      {isStarred ? 'Starred' : 'Star'} ({starCount})
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* TODO (Exercise 3): Polish the Edit Bio Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Edit Bio</Text>
            <TextInput
              value={draftBio}
              onChangeText={setDraftBio}
              multiline
              style={styles.textArea}
            />
            <Pressable onPress={handleSaveBio} style={styles.button} accessibilityRole="button">
              <Text>Save Bio</Text>
            </Pressable>
            <Pressable
              onPress={() => setIsEditModalOpen(false)}
              style={styles.button}
              accessibilityRole="button"
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function ProfileSectionExercise() {
  return (
    <SafeAreaProvider>
      <ProfileSectionContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkBackground: {
    backgroundColor: '#0B1120',
  },
  darkText: {
    color: '#F8FAFC',
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  projectsList: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  textArea: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
});
