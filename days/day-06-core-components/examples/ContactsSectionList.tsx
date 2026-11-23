import { useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type SectionListData,
  type SectionListRenderItem,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  role: string;
  team: 'Engineering' | 'Design' | 'Product';
}

interface ContactSection {
  title: Contact['team'];
  data: Contact[];
}

const CONTACTS: readonly Contact[] = [
  { id: 'c1', name: 'Aisha Khan', role: 'Staff Mobile Engineer', team: 'Engineering' },
  { id: 'c2', name: 'Devon Brooks', role: 'React Native Developer', team: 'Engineering' },
  { id: 'c3', name: 'Mateo Silva', role: 'Design Systems Lead', team: 'Design' },
  { id: 'c4', name: 'Priya Patel', role: 'Mobile UX Researcher', team: 'Design' },
  { id: 'c5', name: 'Hannah Cho', role: 'Group Product Manager', team: 'Product' },
  { id: 'c6', name: 'Lucas Weber', role: 'Technical Program Manager', team: 'Product' },
];

const TEAM_ORDER: readonly Contact['team'][] = ['Engineering', 'Design', 'Product'];

function ContactsSectionListContent() {
  const [query, setQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const sections: ContactSection[] = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TEAM_ORDER.map((team) => {
      const members = CONTACTS.filter((contact) => {
        if (contact.team !== team) {
          return false;
        }
        if (normalized.length === 0) {
          return true;
        }
        return (
          contact.name.toLowerCase().includes(normalized) ||
          contact.role.toLowerCase().includes(normalized)
        );
      });
      return { title: team, data: members };
    }).filter((section) => section.data.length > 0);
  }, [query]);

  const renderItem: SectionListRenderItem<Contact, ContactSection> = ({ item }) => {
    const isSelected = item.id === selectedContactId;
    return (
      <Pressable
        onPress={() => setSelectedContactId(isSelected ? null : item.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={({ pressed }) => [
          styles.row,
          isSelected && styles.rowSelected,
          pressed && styles.rowPressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
        <Text style={styles.status}>{isSelected ? 'Selected' : 'View'}</Text>
      </Pressable>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<Contact, ContactSection>;
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Team Directory</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Filter by name or role..."
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No teammates match &quot;{query}&quot;.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default function ContactsSectionList() {
  return (
    <SafeAreaProvider>
      <ContactsSectionListContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    padding: 16,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  rowSelected: {
    backgroundColor: '#EFF6FF',
  },
  rowPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  role: {
    fontSize: 13,
    color: '#64748B',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 68,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
  },
});
