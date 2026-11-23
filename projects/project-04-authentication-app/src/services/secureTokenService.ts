import * as SecureStore from 'expo-secure-store';

import type { AuthSession, AuthTokens, AuthUser, LoginCredentials } from '../types/auth';

/**
 * expo-secure-store keys may only contain alphanumeric characters, ".", "-", and "_".
 */
const TOKEN_STORAGE_KEY = 'auth_app.tokens.v1';
const USER_STORAGE_KEY = 'auth_app.user.v1';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthTokens(value: unknown): value is AuthTokens {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.accessToken === 'string' &&
    typeof value.refreshToken === 'string' &&
    typeof value.expiresAt === 'number' &&
    Number.isFinite(value.expiresAt)
  );
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    (value.role === 'member' || value.role === 'admin') &&
    typeof value.createdAt === 'string'
  );
}

function parseJsonSafely<T>(raw: string | null, guard: (value: unknown) => value is T): T | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function isSecureStorageAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(
      TOKEN_STORAGE_KEY,
      JSON.stringify(session.tokens),
      SECURE_STORE_OPTIONS,
    ),
    SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(session.user), SECURE_STORE_OPTIONS),
  ]);
}

export async function updateTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(tokens), SECURE_STORE_OPTIONS);
}

export async function loadSession(): Promise<AuthSession | null> {
  const [rawTokens, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(USER_STORAGE_KEY),
  ]);

  const tokens = parseJsonSafely(rawTokens, isAuthTokens);
  const user = parseJsonSafely(rawUser, isAuthUser);

  if (!tokens || !user) {
    // Clean up partially written or corrupted entries so hydration stays predictable.
    if (rawTokens !== null || rawUser !== null) {
      await clearSession();
    }
    return null;
  }

  return { tokens, user };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(USER_STORAGE_KEY),
  ]);
}

/**
 * Masks sensitive tokens before rendering diagnostic previews in UI or logs.
 */
export function maskTokenPreview(token: string): string {
  if (token.length <= 10) {
    return '••••••••';
  }
  return `${token.slice(0, 6)}••••${token.slice(-4)}`;
}

/**
 * Demo authentication adapter for local curriculum exploration.
 * Replace this function with a real HTTPS fetch/axios call to your backend API.
 */
export async function authenticateWithDemoApi(credentials: LoginCredentials): Promise<AuthSession> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 450);
  });

  const normalizedEmail = credentials.email.trim().toLowerCase();
  const isDemoAccount =
    normalizedEmail === 'alex@example.com' && credentials.password === 'SecurePass123';

  if (!isDemoAccount) {
    throw new Error('Invalid email or password. Try alex@example.com / SecurePass123.');
  }

  const now = Date.now();
  return {
    user: {
      id: 'usr_demo_001',
      name: 'Alex Rivera',
      email: normalizedEmail,
      role: 'member',
      createdAt: '2026-01-15T09:00:00.000Z',
    },
    tokens: {
      accessToken: `demo_access_${now.toString(36)}_9f4a`,
      refreshToken: `demo_refresh_${now.toString(36)}_c21e`,
      expiresAt: now + ACCESS_TOKEN_TTL_MS,
    },
  };
}

/**
 * Demo token refresh adapter simulating silent access token rotation.
 * Replace with a POST /auth/refresh call to your backend.
 */
export async function refreshTokensWithDemoApi(refreshToken: string): Promise<AuthTokens> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 300);
  });

  if (!refreshToken.startsWith('demo_refresh_')) {
    throw new Error('Refresh token is invalid or revoked.');
  }

  const now = Date.now();
  return {
    accessToken: `demo_access_${now.toString(36)}_rot8`,
    refreshToken: `demo_refresh_${now.toString(36)}_next`,
    expiresAt: now + ACCESS_TOKEN_TTL_MS,
  };
}
