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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string;
}

const ROW_HEIGHT = 92;

const SAMPLE_PRODUCTS: readonly ProductItem[] = Array.from({ length: 200 }, (_, index) => {
  const categories = ['Audio', 'Keyboards', 'Monitors', 'Accessories'] as const;
  const category = categories[index % categories.length] ?? 'Accessories';

  return {
    id: `prod-${index + 1}`,
    name: `${category} Pro Model #${index + 1}`,
    category,
    priceCents: 2900 + (index % 20) * 1500,
    imageUrl: `https://picsum.photos/seed/rn-product-${index + 1}/160/160`,
  };
});

interface ProductRowProps {
  item: ProductItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

/**
 * Memoized row component.
 * Because `item`, `isFavorite` (primitive boolean), and `onToggleFavorite` (stable via useCallback)
 * keep stable identities, toggling one row's favorite status only re-renders THAT single row.
 */
const ProductRow = memo(function ProductRow({
  item,
  isFavorite,
  onToggleFavorite,
}: ProductRowProps) {
  const formattedPrice = `$${(item.priceCents / 100).toFixed(2)}`;

  const handlePress = () => {
    onToggleFavorite(item.id);
  };

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.thumbnail}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={item.id}
        transition={150}
        accessibilityLabel={`${item.name} product photo`}
      />

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
      </View>

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        accessibilityLabel={
          isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`
        }
        style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
      >
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </Pressable>
    </View>
  );
});

const keyExtractor = (item: ProductItem): string => item.id;

const getItemLayout = (
  _data: ArrayLike<ProductItem> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});

export interface OptimizedProductListProps {
  products?: readonly ProductItem[];
}

/**
 * Demonstrates production-ready FlatList virtualization and render optimization:
 * - Fixed-height `getItemLayout` (skips dynamic measurement on scroll)
 * - Memoized rows with primitive props (`isFavorite`)
 * - Stable `useCallback` handlers and `useMemo` filtering
 * - `expo-image` disk/memory caching and `recyclingKey` for smooth scrolling
 */
export function OptimizedProductList({
  products = SAMPLE_PRODUCTS,
}: OptimizedProductListProps) {
  const [query, setQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(() => new Set());

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderItem: ListRenderItem<ProductItem> = useCallback(
    ({ item }) => (
      <ProductRow
        item={item}
        isFavorite={favoriteIds.has(item.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [favoriteIds, handleToggleFavorite],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Catalog ({filteredProducts.length})</Text>
        <Text style={styles.favoriteSummary}>Favorites: {favoriteIds.size}</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Filter by product or category..."
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Filter products"
        style={styles.searchInput}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        extraData={favoriteIds}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matching products found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  favoriteSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
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
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  category: {
    fontSize: 12,
    color: '#64748B',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  favoriteButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#64748B',
  },
  favoriteIconActive: {
    color: '#D97706',
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
