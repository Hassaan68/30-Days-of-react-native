import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface ContactItem {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string;
}

export interface MemoizedRowExerciseProps {
  contacts: readonly ContactItem[];
}

interface ContactRowProps {
  contact: ContactItem;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Day 16 Starter Exercise: Spot and fix FlatList re-render bottlenecks.
 *
 * TODO (Exercise 1):
 * - Wrap ContactRow in `React.memo`.
 * - Replace `onPress: () => void` with `onSelect: (id: string) => void` so `renderItem`
 *   does not allocate a new inline closure per item on every render.
 *
 * TODO (Exercise 3):
 * - Render `contact.avatarUrl` using `Image` from `expo-image` with `recyclingKey={contact.id}`
 *   and `cachePolicy="memory-disk"`.
 */
function ContactRow({ contact, isSelected, onPress }: ContactRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      style={[styles.row, isSelected && styles.rowSelected]}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{contact.fullName.charAt(0)}</Text>
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.name}>
          {contact.fullName}
        </Text>
        <Text numberOfLines={1} style={styles.role}>
          {contact.role}
        </Text>
      </View>

      <Text style={styles.badge}>{isSelected ? 'Selected' : 'Select'}</Text>
    </Pressable>
  );
}

export function MemoizedRowExercise({ contacts }: MemoizedRowExerciseProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

  // TODO (Exercise 2): Memoize filteredContacts with `useMemo`.
  const filteredContacts = contacts.filter((contact) =>
    contact.fullName.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // TODO (Exercise 1): Wrap `handleSelect` in `useCallback`.
  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search contacts..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      {/* TODO (Exercise 2): Add stable keyExtractor, getItemLayout, memoized renderItem,
          initialNumToRender, maxToRenderPerBatch, windowSize, and removeClippedSubviews. */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        extraData={selectedIds}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            isSelected={selectedIds.has(item.id)}
            onPress={() => handleSelect(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  input: {
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
  },
  row: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  rowSelected: {
    backgroundColor: '#EFF6FF',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  role: {
    fontSize: 13,
    color: '#64748B',
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
});
