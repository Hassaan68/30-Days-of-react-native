import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface ComponentCardItem {
  id: string;
  name: string;
  category: 'Layout' | 'Input' | 'Lists' | 'Feedback';
  summary: string;
  previewImageUrl: string;
}

const CATEGORIES = ['All', 'Layout', 'Input', 'Lists', 'Feedback'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const COMPONENT_ITEMS: readonly ComponentCardItem[] = [
  {
    id: 'view-text',
    name: 'View & Text',
    category: 'Layout',
    summary: 'Fundamental building blocks for Flexbox containers and accessible typography.',
    previewImageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'pressable',
    name: 'Pressable',
    category: 'Input',
    summary: 'Modern touch handler supporting pressed states, hitSlop, and long-press events.',
    previewImageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'text-input',
    name: 'TextInput',
    category: 'Input',
    summary: 'Controlled text entry with keyboard types, return key labels, and secure entry.',
    previewImageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'flatlist',
    name: 'FlatList',
    category: 'Lists',
    summary: 'Virtualized list that renders only visible rows for smooth 60fps scrolling.',
    previewImageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'modal-activity',
    name: 'Modal & ActivityIndicator',
    category: 'Feedback',
    summary: 'Native overlays with animationType and platform-native loading spinners.',
    previewImageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
];

function CoreComponentsGalleryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedItem, setSelectedItem] = useState<ComponentCardItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return COMPONENT_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.summary.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleSimulateSync = () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const renderItem: ListRenderItem<ComponentCardItem> = ({ item }) => (
    <Pressable
      onPress={() => setSelectedItem(item)}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${item.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: item.previewImageUrl }}
        style={styles.thumbnail}
        resizeMode="contain"
        accessibilityLabel={`${item.name} icon`}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.cardSummary} numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleBlock}>
                <Text style={styles.heading}>Core Components</Text>
                <Text style={styles.subtitle}>
                  Tap any card to inspect it inside a native Modal.
                </Text>
              </View>

              <Pressable
                onPress={handleSimulateSync}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Refresh component gallery"
                style={({ pressed }) => [styles.syncButton, pressed && styles.syncButtonPressed]}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync</Text>
                )}
              </Pressable>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search core components..."
              placeholderTextColor="#64748B"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              accessibilityLabel="Search core components"
              style={styles.searchInput}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {CATEGORIES.map((category) => {
                const active = category === selectedCategory;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.filterChip,
                      active && styles.filterChipActive,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching components</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search filter or picking &quot;All&quot;.
            </Text>
          </View>
        }
      />

      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCategory}>{selectedItem?.category}</Text>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalDescription}>{selectedItem?.summary}</Text>

            <Pressable
              onPress={() => setSelectedItem(null)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.syncButtonPressed,
              ]}
            >
              <Text style={styles.closeButtonText}>Close Details</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function CoreComponentsGallery() {
  return (
    <SafeAreaProvider>
      <CoreComponentsGalleryContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleBlock: {
    flex: 1,
    gap: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
  syncButton: {
    minWidth: 72,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonPressed: {
    opacity: 0.8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipPressed: {
    opacity: 0.75,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  cardPressed: {
    backgroundColor: '#F1F5F9',
    transform: [{ scale: 0.99 }],
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cardSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  separator: {
    height: 10,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 10,
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
