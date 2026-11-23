import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDebounce, useToggle } from './useDebounce';

interface Topic {
  readonly id: string;
  readonly name: string;
  readonly category: 'Core' | 'UI' | 'Architecture';
}

function buildInitialTopics(): Topic[] {
  return [
    { id: 't-1', name: 'useState & Functional Updates', category: 'Core' },
    { id: 't-2', name: 'useEffect & Cleanups', category: 'Core' },
    { id: 't-3', name: 'useRef & TextInput Focus', category: 'UI' },
    { id: 't-4', name: 'useMemo & useCallback', category: 'Architecture' },
    { id: 't-5', name: 'Custom Hooks (useDebounce)', category: 'Architecture' },
    { id: 't-6', name: 'Avoiding Unnecessary Effects', category: 'Core' },
  ];
}

interface TopicRowProps {
  topic: Topic;
  isSelected: boolean;
  compact: boolean;
  onSelect: (id: string) => void;
}

const TopicRow = memo(function TopicRow({
  topic,
  isSelected,
  compact,
  onSelect,
}: TopicRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select topic ${topic.name}`}
      onPress={() => onSelect(topic.id)}
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        isSelected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.rowTitle}>{topic.name}</Text>
      {!compact && <Text style={styles.rowCategory}>{topic.category}</Text>}
    </Pressable>
  );
});

export function HooksShowcase() {
  // Lazy initializer runs `buildInitialTopics` once on initial mount.
  const [topics] = useState<Topic[]>(() => buildInitialTopics());
  const [query, setQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput | null>(null);
  const debouncedQuery = useDebounce(query, 250);
  const compactMode = useToggle(false);

  const filteredTopics = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (normalized.length === 0) {
      return topics;
    }
    return topics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(normalized) ||
        topic.category.toLowerCase().includes(normalized),
    );
  }, [topics, debouncedQuery]);

  const handleSelectTopic = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleClearAndFocus = (): void => {
    setQuery('');
    searchInputRef.current?.focus();
  };

  // Derived value — no `useEffect` required.
  const selectedTopic = topics.find((topic) => topic.id === selectedId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>React Hooks Showcase</Text>

        <View style={styles.searchRow}>
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search hooks (debounced 250ms)..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search input and focus"
            onPress={handleClearAndFocus}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.metaText}>
            Showing {filteredTopics.length} of {topics.length}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle compact list layout"
            onPress={compactMode.toggle}
            style={styles.toggleChip}
          >
            <Text style={styles.toggleChipText}>
              {compactMode.value ? 'Compact: ON' : 'Compact: OFF'}
            </Text>
          </Pressable>
        </View>

        {selectedTopic !== undefined && (
          <View style={styles.selectionBanner}>
            <Text style={styles.selectionText}>Selected: {selectedTopic.name}</Text>
          </View>
        )}

        <View style={styles.list}>
          {filteredTopics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              isSelected={topic.id === selectedId}
              compact={compactMode.value}
              onSelect={handleSelectTopic}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  clearButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  toggleChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  selectionBanner: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
  },
  selectionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  list: {
    gap: 8,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  rowCompact: {
    paddingVertical: 8,
  },
  rowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  pressed: {
    opacity: 0.85,
  },
});

export default HooksShowcase;
