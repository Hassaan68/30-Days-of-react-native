export type AuthStatus = 'hydrating' | 'authenticated' | 'unauthenticated';

export type UserRole = 'member' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp in milliseconds when the access token expires. */
  expiresAt: number;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'STORAGE_UNAVAILABLE'
  | 'NETWORK_ERROR';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Returns true if the access token has expired or is within the refresh buffer window.
 */
export function isAccessTokenExpired(
  tokens: AuthTokens,
  nowMs: number = Date.now(),
  bufferMs: number = 30_000,
): boolean {
  return tokens.expiresAt - bufferMs <= nowMs;
}
