import * as SecureStore from 'expo-secure-store';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp in milliseconds when the access token expires. */
  expiresAt: number;
}

const VALID_KEY_PATTERN = /^[A-Za-z0-9._-]+$/;
const MAX_SECURE_STORE_BYTES = 2048;
const AUTH_TOKENS_KEY = 'app.auth.tokens';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  // Keeps secrets encrypted when the device is locked before first unlock and
  // prevents unencrypted migration to another device via iCloud backups.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function assertValidKey(key: string): void {
  if (!key || !VALID_KEY_PATTERN.test(key)) {
    throw new Error(
      `Invalid SecureStore key "${key}". Keys may only contain letters, numbers, ".", "-", and "_".`,
    );
  }
}

function getUtf8ByteLength(value: string): number {
  let bytes = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // Surrogate pair represents a 4-byte UTF-8 code point.
      bytes += 4;
      i += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === 'string' &&
    candidate.accessToken.length > 0 &&
    typeof candidate.refreshToken === 'string' &&
    candidate.refreshToken.length > 0 &&
    typeof candidate.expiresAt === 'number' &&
    Number.isFinite(candidate.expiresAt)
  );
}

/**
 * Stores a sensitive string inside the OS hardware-backed keystore
 * (iOS Keychain / Android Keystore). Rejects oversized payloads explicitly.
 */
export async function setSecret(key: string, value: string): Promise<void> {
  assertValidKey(key);

  const available = await SecureStore.isAvailableAsync();
  if (!available) {
    throw new Error(
      'SecureStore is unavailable on this platform. Never fall back to plaintext AsyncStorage for secrets.',
    );
  }

  const byteLength = getUtf8ByteLength(value);
  if (byteLength > MAX_SECURE_STORE_BYTES) {
    throw new Error(
      `Payload for "${key}" is ${byteLength} bytes, exceeding SecureStore's ${MAX_SECURE_STORE_BYTES}-byte limit.`,
    );
  }

  await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
}

export async function getSecret(key: string): Promise<string | null> {
  assertValidKey(key);

  const available = await SecureStore.isAvailableAsync();
  if (!available) {
    return null;
  }

  return SecureStore.getItemAsync(key, SECURE_OPTIONS);
}

export async function deleteSecret(key: string): Promise<void> {
  assertValidKey(key);

  const available = await SecureStore.isAvailableAsync();
  if (!available) {
    return;
  }

  await SecureStore.deleteItemAsync(key, SECURE_OPTIONS);
}

/**
 * Persists short-lived access and refresh tokens securely.
 */
export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  const serialized = JSON.stringify(tokens);
  await setSecret(AUTH_TOKENS_KEY, serialized);
}

/**
 * Loads and runtime-validates stored auth tokens.
 * Clears corrupted entries automatically rather than throwing on malformed JSON.
 */
export async function getAuthTokens(): Promise<AuthTokens | null> {
  const raw = await getSecret(AUTH_TOKENS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isAuthTokens(parsed)) {
      await clearAuthTokens();
      return null;
    }
    return parsed;
  } catch {
    await clearAuthTokens();
    return null;
  }
}

export async function clearAuthTokens(): Promise<void> {
  await deleteSecret(AUTH_TOKENS_KEY);
}

/**
 * Returns true if the access token is already expired or within the refresh buffer.
 */
export function isAccessTokenExpired(
  tokens: Pick<AuthTokens, 'expiresAt'>,
  bufferMs = 30_000,
): boolean {
  return Date.now() + bufferMs >= tokens.expiresAt;
}
