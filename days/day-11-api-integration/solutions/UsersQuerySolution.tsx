import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  companyName: string;
}

export const userKeys = {
  all: ['users'] as const,
};

const USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * Typed `fetch` call supporting TanStack Query's automatic AbortSignal cancellation.
 */
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await fetch(USERS_API_URL, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users (HTTP ${response.status})`);
  }

  return (await response.json()) as User[];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await fetch(USERS_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      company: { name: input.companyName },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user (HTTP ${response.status})`);
  }

  const created = (await response.json()) as Partial<User>;
  return {
    id: created.id ?? Date.now(),
    name: created.name ?? input.name,
    email: created.email ?? input.email,
    company: { name: created.company?.name ?? input.companyName },
  };
}

interface AddUserMutationContext {
  previousUsers: User[] | undefined;
}

function UsersDirectoryContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, error, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => fetchUsers(signal),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const addUserMutation = useMutation<User, Error, CreateUserInput, AddUserMutationContext>({
    mutationFn: createUser,

    onMutate: async (input) => {
      setFeedback(null);
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      const previousUsers = queryClient.getQueryData<User[]>(userKeys.all);
      const optimisticUser: User = {
        id: Date.now(),
        name: input.name,
        email: input.email,
        company: { name: input.companyName },
      };

      queryClient.setQueryData<User[]>(userKeys.all, (current) => [
        optimisticUser,
        ...(current ?? []),
      ]);

      return { previousUsers };
    },

    onError: (mutationError, _input, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.all, context.previousUsers);
      }
      setFeedback(`Could not add teammate: ${mutationError.message}`);
    },

    onSuccess: (createdUser) => {
      setFeedback(`Added ${createdUser.name} to the directory.`);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  const filteredUsers = useMemo(() => {
    const users = data ?? [];
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return users;
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [data, searchQuery]);

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.helperText}>Loading team directory…</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load users</Text>
        <Text style={styles.helperText}>{error.message}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => void refetch()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading users"
        >
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.heading}>Team Directory</Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            addUserMutation.isPending && styles.disabled,
            pressed && styles.pressed,
          ]}
          disabled={addUserMutation.isPending}
          onPress={() =>
            addUserMutation.mutate({
              name: 'Jordan Patel',
              email: 'jordan.patel@example.com',
              companyName: 'Expo Builders',
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Add sample teammate"
        >
          <Text style={styles.primaryButtonText}>
            {addUserMutation.isPending ? 'Adding…' : '+ Add User'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter by name or email…"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search team directory"
        />
      </View>

      {feedback ? (
        <View style={styles.feedbackBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor="#2563EB"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.company}>{item.company.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {searchQuery.trim().length > 0
                ? `No users match "${searchQuery.trim()}".`
                : 'No users available. Pull down to refresh.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/**
 * Complete solution for Day 11:
 * Typed `fetch` + `AbortSignal`, TanStack Query v5 caching, full UI states,
 * pull-to-refresh, local cache filtering, and optimistic mutations with rollback.
 */
export default function UsersQuerySolution() {
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
      <UsersDirectoryContent />
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  feedbackBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  feedbackText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 14,
    color: '#475569',
  },
  company: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
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
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
