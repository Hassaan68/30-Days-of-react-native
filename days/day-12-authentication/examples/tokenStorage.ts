import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp in milliseconds when the access token expires. */
  expiresAt: number;
}

/**
 * expo-secure-store keys may only contain alphanumeric characters, ".", "-", and "_".
 */
const STORAGE_KEYS = {
  accessToken: 'auth.access_token',
  refreshToken: 'auth.refresh_token',
  expiresAt: 'auth.expires_at',
} as const;

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * In-memory fallback used only when SecureStore is unavailable (for example, on web
 * previews or unsupported test environments). Never fall back to AsyncStorage for secrets.
 */
const memoryFallback = new Map<string, string>();

async function isSecureStoreSupported(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  return SecureStore.isAvailableAsync();
}

async function writeValue(key: string, value: string): Promise<void> {
  if (await isSecureStoreSupported()) {
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
    return;
  }
  memoryFallback.set(key, value);
}

async function readValue(key: string): Promise<string | null> {
  if (await isSecureStoreSupported()) {
    return SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
  }
  return memoryFallback.get(key) ?? null;
}

async function deleteValue(key: string): Promise<void> {
  if (await isSecureStoreSupported()) {
    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
    return;
  }
  memoryFallback.delete(key);
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    writeValue(STORAGE_KEYS.accessToken, tokens.accessToken),
    writeValue(STORAGE_KEYS.refreshToken, tokens.refreshToken),
    writeValue(STORAGE_KEYS.expiresAt, String(tokens.expiresAt)),
  ]);
}

export async function getTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken, rawExpiresAt] = await Promise.all([
    readValue(STORAGE_KEYS.accessToken),
    readValue(STORAGE_KEYS.refreshToken),
    readValue(STORAGE_KEYS.expiresAt),
  ]);

  if (!accessToken || !refreshToken || !rawExpiresAt) {
    return null;
  }

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isFinite(expiresAt)) {
    await clearTokens();
    return null;
  }

  return { accessToken, refreshToken, expiresAt };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteValue(STORAGE_KEYS.accessToken),
    deleteValue(STORAGE_KEYS.refreshToken),
    deleteValue(STORAGE_KEYS.expiresAt),
  ]);
}

/**
 * Returns true if the token is already expired or will expire within the buffer window.
 * A 60-second buffer avoids sending requests with tokens that expire mid-flight.
 */
export function isTokenExpired(tokens: AuthTokens, bufferMs = 60_000): boolean {
  return Date.now() + bufferMs >= tokens.expiresAt;
}
