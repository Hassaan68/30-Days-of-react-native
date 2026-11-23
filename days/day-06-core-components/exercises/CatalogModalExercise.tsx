import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export interface CatalogItem {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  summary: string;
  imageUrl: string;
}

export const CATALOG_ITEMS: readonly CatalogItem[] = [
  {
    id: 'rn-flexbox',
    title: 'Flexbox Layout Workshop',
    level: 'Beginner',
    durationMinutes: 25,
    summary: 'Master column-first layouts, alignment, spacing, and adaptive grids in React Native.',
    imageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'rn-lists',
    title: 'Virtualized Lists Deep Dive',
    level: 'Intermediate',
    durationMinutes: 35,
    summary: 'Choose cleanly between ScrollView, FlatList, and SectionList for smooth scrolling.',
    imageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'rn-modals',
    title: 'Accessible Sheets & Modals',
    level: 'Intermediate',
    durationMinutes: 20,
    summary: 'Build native overlays with proper Android back-button handling and focus order.',
    imageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 'rn-images',
    title: 'High-Performance Media & Caching',
    level: 'Advanced',
    durationMinutes: 30,
    summary: 'Optimize remote images with proper resize modes and expo-image disk caching.',
    imageUrl: 'https://reactnative.dev/img/tiny_logo.png',
  },
];

function CatalogModalContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TODO (Exercises 1 & 3): Filter CATALOG_ITEMS by searchQuery and showBookmarksOnly.
  const visibleItems = useMemo(() => {
    const _normalized = searchQuery.trim().toLowerCase();
    const _bookmarksActive = showBookmarksOnly;
    return [...CATALOG_ITEMS];
  }, [searchQuery, showBookmarksOnly]);

  // TODO (Exercise 3): Toggle bookmark ID inside bookmarkedIds state.
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  // TODO (Exercise 3): Trigger a 600ms simulated reload using ActivityIndicator.
  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const renderItem: ListRenderItem<CatalogItem> = ({ item }) => {
    const isBookmarked = bookmarkedIds.includes(item.id);
    return (
      // TODO (Exercise 2): Add pressed state styling and hitSlop={6}
      <Pressable onPress={() => setSelectedItem(item)} style={styles.card} accessibilityRole="button">
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {item.level} • {item.durationMinutes} min {isBookmarked ? '• Saved' : ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.heading}>Lesson Catalog</Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search lessons..."
          style={styles.input}
        />

        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => setShowBookmarksOnly((prev) => !prev)}
            style={styles.controlButton}
            accessibilityRole="button"
          >
            <Text>{showBookmarksOnly ? 'Showing Saved' : 'Bookmarks Only'}</Text>
          </Pressable>

          <Pressable
            onPress={handleReload}
            style={styles.controlButton}
            accessibilityRole="button"
          >
            {isLoading ? <ActivityIndicator size="small" /> : <Text>Reload</Text>}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        // TODO (Exercise 1): Add a helpful ListEmptyComponent
      />

      {/* TODO (Exercise 2): Complete the Modal UI with summary, Bookmark toggle, and Close button */}
      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.cardTitle}>{selectedItem?.title}</Text>
            <Text>{selectedItem?.summary}</Text>
            {selectedItem ? (
              <Pressable
                onPress={() => toggleBookmark(selectedItem.id)}
                style={styles.controlButton}
                accessibilityRole="button"
              >
                <Text>
                  {bookmarkedIds.includes(selectedItem.id) ? 'Remove Bookmark' : 'Bookmark'}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setSelectedItem(null)}
              style={styles.controlButton}
              accessibilityRole="button"
            >
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function CatalogModalExercise() {
  return (
    <SafeAreaProvider>
      <CatalogModalContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnail: {
    width: 40,
    height: 40,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
});
