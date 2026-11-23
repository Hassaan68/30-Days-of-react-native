import {
  type InfiniteData,
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createPost,
  fetchPostsPage,
  type CreatePostInput,
  type PaginatedPostsResponse,
  type Post,
} from './apiClient';

const PAGE_SIZE = 10;

export const postKeys = {
  all: ['posts'] as const,
  infinite: (limit: number) => [...postKeys.all, 'infinite', limit] as const,
};

interface CreatePostContext {
  previousData: InfiniteData<PaginatedPostsResponse> | undefined;
}

function PostsFeedContent() {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    data,
    error,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: postKeys.infinite(PAGE_SIZE),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchPostsPage(pageParam, PAGE_SIZE, signal),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const createPostMutation = useMutation<Post, Error, CreatePostInput, CreatePostContext>({
    mutationFn: createPost,

    // Optimistically prepend the new post to page 1 so the UI reacts immediately
    onMutate: async (newPostInput) => {
      setStatusMessage(null);
      await queryClient.cancelQueries({ queryKey: postKeys.infinite(PAGE_SIZE) });

      const previousData = queryClient.getQueryData<InfiniteData<PaginatedPostsResponse>>(
        postKeys.infinite(PAGE_SIZE),
      );

      const optimisticPost: Post = {
        id: Date.now(),
        userId: newPostInput.userId,
        title: newPostInput.title,
        body: newPostInput.body,
      };

      queryClient.setQueryData<InfiniteData<PaginatedPostsResponse>>(
        postKeys.infinite(PAGE_SIZE),
        (current) => {
          if (!current) return current;
          const firstPage = current.pages[0];
          if (!firstPage) return current;

          const updatedFirstPage: PaginatedPostsResponse = {
            ...firstPage,
            items: [optimisticPost, ...firstPage.items],
          };

          return {
            ...current,
            pages: [updatedFirstPage, ...current.pages.slice(1)],
          };
        },
      );

      return { previousData };
    },

    onError: (mutationError, _variables, context) => {
      // Roll back the optimistic update if the network request fails
      if (context?.previousData) {
        queryClient.setQueryData(postKeys.infinite(PAGE_SIZE), context.previousData);
      }
      setStatusMessage(`Could not publish post: ${mutationError.message}`);
    },

    onSuccess: () => {
      setStatusMessage('Published new post!');
    },

    onSettled: () => {
      // Re-sync with the server cache after either success or failure
      void queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const posts = useMemo<Post[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const handlePublishDemoPost = () => {
    createPostMutation.mutate({
      userId: 1,
      title: 'Learning TanStack Query v5 in React Native',
      body: 'Optimistic updates, pagination, and automatic request cancellation make mobile feeds feel instant.',
    });
  };

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.helperText}>Loading posts…</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load feed</Text>
        <Text style={styles.helperText}>{error.message}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => void refetch()}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community Feed</Text>
          <Text style={styles.subtitle}>{posts.length} posts cached</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            createPostMutation.isPending && styles.disabled,
            pressed && styles.pressed,
          ]}
          onPress={handlePublishDemoPost}
          disabled={createPostMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Publish sample post"
        >
          <Text style={styles.primaryButtonText}>
            {createPostMutation.isPending ? 'Posting…' : '+ New Post'}
          </Text>
        </Pressable>
      </View>

      {statusMessage ? (
        <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>{statusMessage}</Text>
        </View>
      ) : null}

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor="#2563EB"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={3}>
              {item.body}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.helperText}>No posts yet. Pull down to refresh.</Text>
          </View>
        }
        ListFooterComponent={
          hasNextPage ? (
            <Pressable
              style={({ pressed }) => [styles.loadMoreButton, pressed && styles.pressed]}
              onPress={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              accessibilityRole="button"
            >
              {isFetchingNextPage ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <Text style={styles.loadMoreText}>Load More Posts</Text>
              )}
            </Pressable>
          ) : (
            <Text style={styles.endText}>You have reached the end of the feed.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

/**
 * Self-contained screen wrapping `PostsFeedContent` in a `QueryClientProvider`.
 * In a full app, create a single `QueryClient` in your root `app/_layout.tsx`.
 */
export default function PostsFeedScreen() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PostsFeedContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadMoreButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 4,
  },
  loadMoreText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  endText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    paddingVertical: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B91C1C',
  },
  helperText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
