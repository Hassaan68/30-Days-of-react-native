import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth, type UserRole } from '../examples/AuthContext';

export interface AuthGuardProps {
  children: ReactNode;
  /** Optional role required to view the protected content. */
  requiredRole?: UserRole;
  /** Custom UI rendered when the user is not signed in. */
  fallback?: ReactNode;
  /** Optional callback triggered when an unauthenticated user reaches this guard. */
  onUnauthenticated?: () => void;
}

/**
 * Exercise Starter: Implement a reusable authentication and role guard.
 *
 * TODOs:
 * 1. Read `status`, `isAuthenticated`, `user`, `signOut`, and `refreshSession` from `useAuth()`.
 * 2. Render a loading indicator while `status === 'loading'`.
 * 3. Call `onUnauthenticated` inside a `useEffect` when `status === 'unauthenticated'`.
 * 4. Render `fallback` (or a default sign-in required card with a Retry Session button)
 *    when the user is not authenticated.
 * 5. If `requiredRole` is provided and `user?.role !== requiredRole`, render an
 *    "Access Denied" view with a "Switch Account" button that calls `signOut()`.
 * 6. Otherwise, render `children`.
 */
export function AuthGuardExercise({
  children,
  requiredRole: _requiredRole,
  fallback: _fallback,
  onUnauthenticated: _onUnauthenticated,
}: AuthGuardProps) {
  const { status } = useAuth();

  // TODO: Replace this placeholder with the full loading, unauthenticated, and role checks.
  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  message: {
    fontSize: 16,
    color: '#334155',
  },
});
