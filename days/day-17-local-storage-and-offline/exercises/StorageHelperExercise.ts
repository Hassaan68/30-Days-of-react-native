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
 * Day 17 Starter Exercise (Challenge):
 * Implement a generic, type-safe JSON reader backed by AsyncStorage.
 */
export async function readJson<T>(
  key: string,
  guard: (value: unknown) => value is T,
  fallback: T,
): Promise<T> {
  // TODO (Exercise 3): Read `key` from AsyncStorage, parse JSON safely in try/catch,
  // validate with `guard(parsed)`, and return `fallback` on null or invalid data.
  void AsyncStorage;
  void key;
  void guard;
  return fallback;
}

/**
 * Day 17 Starter Exercise (Beginner): Non-sensitive preferences in AsyncStorage.
 */
export const preferencesStorage = {
  async save(_prefs: UserPreferences): Promise<void> {
    // TODO (Exercise 1): Persist `_prefs` under PREFERENCES_KEY using AsyncStorage.setItem.
    void PREFERENCES_KEY;
  },

  async load(): Promise<UserPreferences> {
    // TODO (Exercise 1): Load and validate preferences using `readJson`.
    return DEFAULT_PREFERENCES;
  },

  async clear(): Promise<void> {
    // TODO (Exercise 1): Remove PREFERENCES_KEY from AsyncStorage.
  },
};

/**
 * Day 17 Starter Exercise (Intermediate): Sensitive auth tokens in expo-secure-store.
 */
export const secureTokenStorage = {
  async save(_tokens: AuthTokens): Promise<void> {
    // TODO (Exercise 2): Persist `_tokens` under AUTH_TOKENS_KEY using SecureStore.setItemAsync.
    void SecureStore;
    void AUTH_TOKENS_KEY;
  },

  async load(): Promise<AuthTokens | null> {
    // TODO (Exercise 2): Read from SecureStore.getItemAsync, parse safely, and validate via isAuthTokens.
    return null;
  },

  async clear(): Promise<void> {
    // TODO (Exercise 2): Delete AUTH_TOKENS_KEY using SecureStore.deleteItemAsync.
  },
};
