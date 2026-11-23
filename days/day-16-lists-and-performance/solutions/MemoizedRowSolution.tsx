import { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';

export interface ContactItem {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string;
}

export interface MemoizedRowSolutionProps {
  contacts: readonly ContactItem[];
}

const ROW_HEIGHT = 76;

interface ContactRowProps {
  contact: ContactItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ContactRow = memo(function ContactRow({ contact, isSelected, onSelect }: ContactRowProps) {
  const handlePress = () => {
    onSelect(contact.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      style={[styles.row, isSelected && styles.rowSelected]}
    >
      <Image
        source={{ uri: contact.avatarUrl }}
        style={styles.avatar}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={contact.id}
        transition={150}
        accessibilityLabel={`${contact.fullName} avatar`}
      />

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.name}>
          {contact.fullName}
        </Text>
        <Text numberOfLines={1} style={styles.role}>
          {contact.role}
        </Text>
      </View>

      <Text style={[styles.badge, isSelected && styles.badgeSelected]}>
        {isSelected ? 'Selected' : 'Select'}
      </Text>
    </Pressable>
  );
});

const keyExtractor = (item: ContactItem): string => item.id;

const getItemLayout = (
  _data: ArrayLike<ContactItem> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});

/**
 * Day 16 Solution: Fully optimized Contact FlatList.
 * Eliminates inline closures, memoizes rows and filtered data,
 * provides exact fixed-height `getItemLayout`, and uses `expo-image` with recycling.
 */
export function MemoizedRowSolution({ contacts }: MemoizedRowSolutionProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

  const filteredContacts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(normalized) ||
        contact.role.toLowerCase().includes(normalized),
    );
  }, [contacts, search]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderItem: ListRenderItem<ContactItem> = useCallback(
    ({ item }) => (
      <ContactRow
        contact={item}
        isSelected={selectedIds.has(item.id)}
        onSelect={handleSelect}
      />
    ),
    [selectedIds, handleSelect],
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search contacts..."
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Search contacts"
        style={styles.input}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        extraData={selectedIds}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
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
    height: ROW_HEIGHT,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
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
    color: '#64748B',
  },
  badgeSelected: {
    color: '#2563EB',
  },
});
