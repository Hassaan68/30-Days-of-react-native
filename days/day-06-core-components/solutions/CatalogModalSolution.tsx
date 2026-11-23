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
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['rn-lists']);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const visibleItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return CATALOG_ITEMS.filter((item) => {
      const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(item.id);
      const matchesQuery =
        normalized.length === 0 ||
        item.title.toLowerCase().includes(normalized) ||
        item.level.toLowerCase().includes(normalized);
      return matchesBookmark && matchesQuery;
    });
  }, [searchQuery, showBookmarksOnly, bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const handleReload = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const renderItem: ListRenderItem<CatalogItem> = ({ item }) => {
    const isBookmarked = bookmarkedIds.includes(item.id);
    return (
      <Pressable
        onPress={() => setSelectedItem(item)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title}`}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          resizeMode="contain"
          accessibilityLabel={`${item.title} thumbnail`}
        />
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {isBookmarked ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>Saved</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{item.level}</Text>
            </View>
            <Text style={styles.durationText}>{item.durationMinutes} min</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const isSelectedBookmarked = selectedItem ? bookmarkedIds.includes(selectedItem.id) : false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Lesson Catalog</Text>
        <Text style={styles.subtitle}>
          {visibleItems.length} of {CATALOG_ITEMS.length} lessons shown
        </Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title or level..."
          placeholderTextColor="#64748B"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search lessons"
          style={styles.input}
        />

        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => setShowBookmarksOnly((prev) => !prev)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityState={{ selected: showBookmarksOnly }}
            style={({ pressed }) => [
              styles.controlButton,
              showBookmarksOnly && styles.controlButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.controlButtonText,
                showBookmarksOnly && styles.controlButtonTextActive,
              ]}
            >
              Bookmarks Only ({bookmarkedIds.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={handleReload}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Reload lesson catalog"
            style={({ pressed }) => [styles.reloadButton, pressed && styles.pressed]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.reloadButtonText}>Reload Catalog</Text>
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No lessons found</Text>
            <Text style={styles.emptyText}>
              {showBookmarksOnly
                ? 'You have no bookmarked lessons matching this search.'
                : 'Try searching for a different keyword like "Flexbox" or "Beginner".'}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedItem ? (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{selectedItem.level}</Text>
                  </View>
                  <Text style={styles.durationText}>{selectedItem.durationMinutes} min</Text>
                </View>

                <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                <Text style={styles.modalSummary}>{selectedItem.summary}</Text>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => toggleBookmark(selectedItem.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelectedBookmarked }}
                    style={({ pressed }) => [
                      styles.secondaryAction,
                      isSelectedBookmarked && styles.secondaryActionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.secondaryActionText,
                        isSelectedBookmarked && styles.secondaryActionTextActive,
                      ]}
                    >
                      {isSelectedBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedItem(null)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryActionText}>Close</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function CatalogModalSolution() {
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  controlButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  controlButtonTextActive: {
    color: '#FFFFFF',
  },
  reloadButton: {
    minWidth: 128,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  savedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  durationText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyBox: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  modalActions: {
    gap: 10,
    marginTop: 6,
  },
  secondaryAction: {
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  secondaryActionActive: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  secondaryActionTextActive: {
    color: '#15803D',
  },
  primaryAction: {
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },
});
