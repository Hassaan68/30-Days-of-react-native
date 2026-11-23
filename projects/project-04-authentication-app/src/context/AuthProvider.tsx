import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, useSegments } from 'expo-router';

import {
  authenticateWithDemoApi,
  clearSession,
  loadSession,
  refreshTokensWithDemoApi,
  saveSession,
  updateTokens,
} from '../services/secureTokenService';
import {
  isAccessTokenExpired,
  type AuthSession,
  type AuthStatus,
  type AuthUser,
  type LoginCredentials,
} from '../types/auth';

export interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  user: AuthUser | null;
  error: string | null;
  isSubmitting: boolean;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('hydrating');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession(): Promise<void> {
      try {
        const storedSession = await loadSession();
        if (!storedSession) {
          if (isMounted) {
            setSession(null);
            setStatus('unauthenticated');
          }
          return;
        }

        if (isAccessTokenExpired(storedSession.tokens)) {
          try {
            const refreshedTokens = await refreshTokensWithDemoApi(
              storedSession.tokens.refreshToken,
            );
            const refreshedSession: AuthSession = {
              user: storedSession.user,
              tokens: refreshedTokens,
            };
            await updateTokens(refreshedTokens);
            if (isMounted) {
              setSession(refreshedSession);
              setStatus('authenticated');
            }
            return;
          } catch {
            await clearSession();
            if (isMounted) {
              setSession(null);
              setStatus('unauthenticated');
            }
            return;
          }
        }

        if (isMounted) {
          setSession(storedSession);
          setStatus('authenticated');
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setStatus('unauthenticated');
        }
      }
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const nextSession = await authenticateWithDemoApi(credentials);
      await saveSession(nextSession);
      setSession(nextSession);
      setStatus('authenticated');
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in right now. Please try again.';
      setError(message);
      setStatus('unauthenticated');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session) {
      return false;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const nextTokens = await refreshTokensWithDemoApi(session.tokens.refreshToken);
      const nextSession: AuthSession = {
        user: session.user,
        tokens: nextTokens,
      };
      await updateTokens(nextTokens);
      setSession(nextSession);
      return true;
    } catch (err: unknown) {
      await clearSession();
      setSession(null);
      setStatus('unauthenticated');
      setError(err instanceof Error ? err.message : 'Session expired. Please sign in again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);

  const signOut = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await clearSession();
    } finally {
      setSession(null);
      setError(null);
      setStatus('unauthenticated');
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      error,
      isSubmitting,
      signIn,
      refreshSession,
      signOut,
      clearError,
    }),
    [status, session, error, isSubmitting, signIn, refreshSession, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}

/**
 * Keeps Expo Router navigation in sync with the current auth status.
 * Call this once inside your root layout below <AuthProvider>.
 */
export function useProtectedRoute(): void {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'hydrating') {
      return;
    }

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(app)/account');
    }
  }, [status, segments, router]);
}
