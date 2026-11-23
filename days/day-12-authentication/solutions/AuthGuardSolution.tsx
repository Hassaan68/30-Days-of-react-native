import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, type UserRole } from '../examples/AuthContext';

export interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
  onUnauthenticated?: () => void;
}

export function AuthGuardSolution({
  children,
  requiredRole,
  fallback,
  onUnauthenticated,
}: AuthGuardProps) {
  const { status, isAuthenticated, user, signOut, refreshSession } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [status, onUnauthenticated]);

  const handleRetrySession = async () => {
    setIsRetrying(true);
    try {
      await refreshSession();
    } finally {
      setIsRetrying(false);
    }
  };

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.helperText}>Restoring your session...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign In Required</Text>
          <Text style={styles.body}>
            You need an active session to view this screen. Sign in or try restoring your saved
            session.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isRetrying}
            onPress={() => {
              void handleRetrySession();
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isRetrying && styles.disabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isRetrying ? 'Checking Session...' : 'Retry Session'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.badge}>Access Denied</Text>
          <Text style={styles.title}>Insufficient Permissions</Text>
          <Text style={styles.body}>
            This area requires the <Text style={styles.strong}>{requiredRole}</Text> role, but you
            are signed in as <Text style={styles.strong}>{user.email}</Text> ({user.role}).
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void signOut();
            }}
            style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Switch Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: '#475569',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  strong: {
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButton: {
    marginTop: 4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
