import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

export const userKeys = {
  all: ['users'] as const,
};

/**
 * TODO (Beginner):
 * Fetch users from `https://jsonplaceholder.typicode.com/users` with `signal`,
 * validate `response.ok`, and return the parsed `User[]`.
 */
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  void signal;
  return [];
}

function UsersDirectoryContent() {
  // TODO (Beginner): Configure `staleTime: 30_000` and `gcTime: 5 * 60_000`
  const { data, isPending } = useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => fetchUsers(signal),
  });

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  // TODO (Intermediate): Render an error state with a Retry button and add RefreshControl to FlatList
  // TODO (Challenge): Add a search TextInput filter and an optimistic `useMutation` to add a new user

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>Team Directory</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users loaded yet.</Text>}
      />
    </SafeAreaView>
  );
}

export default function UsersQueryExercise() {
  const [queryClient] = useState(() => new QueryClient());

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
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    padding: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 32,
  },
});
