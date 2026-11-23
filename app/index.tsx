import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type SectionListData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PLAYGROUND_ENTRIES,
  type PlaygroundEntry,
  type PlaygroundMilestone,
} from '../src/playground/exampleRegistry';

const MILESTONE_ORDER: readonly PlaygroundMilestone[] = [
  'Days 1–7: Foundations',
  'Days 8–14: Real Mobile Dev',
  'Days 15–30: Advanced & Production',
  'Featured Projects',
];

interface PlaygroundSection {
  title: PlaygroundMilestone;
  data: PlaygroundEntry[];
}

export default function PlaygroundLauncherScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo<SectionListData<PlaygroundEntry, PlaygroundSection>[]>(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const filtered =
      normalized.length === 0
        ? PLAYGROUND_ENTRIES
        : PLAYGROUND_ENTRIES.filter(
            (entry) =>
              entry.title.toLowerCase().includes(normalized) ||
              entry.badge.toLowerCase().includes(normalized) ||
              entry.subtitle.toLowerCase().includes(normalized),
          );

    return MILESTONE_ORDER.map((milestone) => ({
      title: milestone,
      data: filtered.filter((entry) => entry.milestone === milestone),
    })).filter((section) => section.data.length > 0);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.lead}>
          Interactive learning workspace — tap any lesson example or featured project to run it live.
        </Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter by day, topic, or project..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Filter lessons and projects"
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/preview/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.badge}: ${item.title}`}
            accessibilityHint="Opens an interactive live preview of this example"
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.chevron}>→</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.sourcePath} numberOfLines={1}>
              {item.sourcePath}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching examples</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for a day number (e.g. &ldquo;Day 09&rdquo;) or topic (e.g. &ldquo;Weather&rdquo;).
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#2563EB',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardPressed: {
    opacity: 0.85,
    borderColor: '#2563EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  chevron: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  sourcePath: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
