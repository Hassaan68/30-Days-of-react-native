import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearTokens,
  getTokens,
  isTokenExpired,
  saveTokens,
  type AuthTokens,
} from './tokenStorage';

export type UserRole = 'member' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Simulated backend client so learners can run and test the flow offline.
 * Replace these functions with real fetch/axios calls to your authentication API.
 */
const demoAuthApi = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    await new Promise<void>((resolve) => setTimeout(resolve, 350));

    const normalizedEmail = credentials.email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || credentials.password.length < 8) {
      throw new Error('Invalid email or password. Passwords must be at least 8 characters.');
    }

    const role: UserRole = normalizedEmail.startsWith('admin@') ? 'admin' : 'member';
    return {
      user: {
        id: 'usr_101',
        email: normalizedEmail,
        name: role === 'admin' ? 'Admin User' : 'Mobile Learner',
        role,
      },
      tokens: {
        accessToken: `access_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      },
    };
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    await new Promise<void>((resolve) => setTimeout(resolve, 400));

    if (input.name.trim().length < 2) {
      throw new Error('Please enter your full name.');
    }
    if (!input.email.includes('@') || input.password.length < 8) {
      throw new Error('Enter a valid email and a password of at least 8 characters.');
    }

    return {
      user: {
        id: `usr_${Date.now()}`,
        email: input.email.trim().toLowerCase(),
        name: input.name.trim(),
        role: 'member',
      },
      tokens: {
        accessToken: `access_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresAt: Date.now() + 15 * 60 * 1000,
      },
    };
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    await new Promise<void>((resolve) => setTimeout(resolve, 250));

    if (!refreshToken.startsWith('refresh_')) {
      throw new Error('Refresh token is invalid or revoked.');
    }

    return {
      user: {
        id: 'usr_101',
        email: 'learner@example.com',
        name: 'Mobile Learner',
        role: 'member',
      },
      tokens: {
        accessToken: `access_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresAt: Date.now() + 15 * 60 * 1000,
      },
    };
  },

  async fetchProfile(_accessToken: string): Promise<AuthUser> {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    return {
      id: 'usr_101',
      email: 'learner@example.com',
      name: 'Mobile Learner',
      role: 'member',
    };
  },
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected authentication error occurred.';
}

export interface AuthProviderProps {
  children: ReactNode;
  /** Optional hook invoked after logout (for example, queryClient.clear()). */
  onSignOut?: () => void;
}

export function AuthProvider({ children, onSignOut }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = await getTokens();
      if (!storedTokens) {
        setUser(null);
        setStatus('unauthenticated');
        return false;
      }

      if (isTokenExpired(storedTokens)) {
        const refreshed = await demoAuthApi.refresh(storedTokens.refreshToken);
        await saveTokens(refreshed.tokens);
        setUser(refreshed.user);
        setStatus('authenticated');
        return true;
      }

      const profile = await demoAuthApi.fetchProfile(storedTokens.accessToken);
      setUser(profile);
      setStatus('authenticated');
      return true;
    } catch {
      await clearTokens();
      setUser(null);
      setStatus('unauthenticated');
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const storedTokens = await getTokens();
      if (!active) {
        return;
      }

      if (!storedTokens) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      try {
        if (isTokenExpired(storedTokens)) {
          const refreshed = await demoAuthApi.refresh(storedTokens.refreshToken);
          await saveTokens(refreshed.tokens);
          if (!active) {
            return;
          }
          setUser(refreshed.user);
          setStatus('authenticated');
          return;
        }

        const profile = await demoAuthApi.fetchProfile(storedTokens.accessToken);
        if (!active) {
          return;
        }
        setUser(profile);
        setStatus('authenticated');
      } catch {
        await clearTokens();
        if (!active) {
          return;
        }
        setUser(null);
        setStatus('unauthenticated');
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setError(null);
    try {
      const response = await demoAuthApi.signIn(credentials);
      await saveTokens(response.tokens);
      setUser(response.user);
      setStatus('authenticated');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      setStatus('unauthenticated');
      throw err;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setError(null);
    try {
      const response = await demoAuthApi.register(input);
      await saveTokens(response.tokens);
      setUser(response.user);
      setStatus('authenticated');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      setStatus('unauthenticated');
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setUser(null);
    setError(null);
    setStatus('unauthenticated');
    onSignOut?.();
  }, [onSignOut]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      error,
      signIn,
      register,
      signOut,
      refreshSession: restoreSession,
      clearError,
    }),
    [user, status, error, signIn, register, signOut, restoreSession, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return context;
}
