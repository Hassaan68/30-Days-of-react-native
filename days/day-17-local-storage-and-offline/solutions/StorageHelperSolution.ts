import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserPreferences {
  theme: ThemePreference;
  compactMode: boolean;
  notificationsEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  compactMode: false,
  notificationsEnabled: true,
};

const PREFERENCES_KEY = 'app:user_preferences:v1';
const AUTH_TOKENS_KEY = 'app_auth_tokens_v1';

export function isUserPreferences(value: unknown): value is UserPreferences {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const validTheme =
    candidate.theme === 'system' || candidate.theme === 'light' || candidate.theme === 'dark';

  return (
    validTheme &&
    typeof candidate.compactMode === 'boolean' &&
    typeof candidate.notificationsEnabled === 'boolean'
  );
}

export function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.expiresAt === 'string'
  );
}

/**
 * Reads and validates JSON from AsyncStorage with zero `any` casts.
 * Automatically falls back to `fallback` if missing, corrupted, or schema-mismatched.
 */
export async function readJson<T>(
  key: string,
  guard: (value: unknown) => value is T,
  fallback: T,
): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Day 17 Solution: Non-sensitive preferences stored in AsyncStorage.
 */
export const preferencesStorage = {
  async save(prefs: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  },

  async load(): Promise<UserPreferences> {
    return readJson(PREFERENCES_KEY, isUserPreferences, DEFAULT_PREFERENCES);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
  },
};

/**
 * Day 17 Solution: Sensitive authentication tokens stored in OS Keychain / Keystore.
 * Note: `expo-secure-store` keys should only contain alphanumeric characters, `.`, `-`, and `_`.
 */
export const secureTokenStorage = {
  async save(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  },

  async load(): Promise<AuthTokens | null> {
    const raw = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);
    if (raw === null) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return isAuthTokens(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
  },
};
