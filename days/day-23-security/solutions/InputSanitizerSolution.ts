export type DeepLinkValidationResult =
  | { ok: true; normalizedUrl: string; pathname: string }
  | { ok: false; reason: string };

export const DEFAULT_SENSITIVE_QUERY_PARAMS: readonly string[] = [
  'token',
  'access_token',
  'refresh_token',
  'code',
  'api_key',
  'apikey',
  'password',
  'secret',
];

/**
 * Removes ASCII control characters (codes 0-31 and 127), trims surrounding
 * whitespace, and enforces a strict maximum character length.
 */
export function sanitizeUserInput(rawText: string, maxLength = 200): string {
  const safeLimit = Math.max(0, Math.floor(maxLength));
  let cleaned = '';

  for (let i = 0; i < rawText.length; i += 1) {
    const code = rawText.charCodeAt(i);
    if (code >= 32 && code !== 127) {
      cleaned += rawText.charAt(i);
    }
  }

  return cleaned.trim().slice(0, safeLimit);
}

/**
 * Validates an incoming deep-link or universal-link URL against explicit
 * scheme and host allowlists to defend against open-redirect and scheme-injection attacks.
 */
export function validateDeepLinkUrl(
  rawUrl: string,
  allowedHosts: readonly string[],
  allowedSchemes: readonly string[] = ['myapp:'],
): DeepLinkValidationResult {
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'URL must not be empty.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'Malformed URL.' };
  }

  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return { ok: false, reason: 'URLs containing embedded credentials are not allowed.' };
  }

  const normalizedSchemes = new Set(allowedSchemes.map((scheme) => scheme.toLowerCase()));
  const protocol = parsed.protocol.toLowerCase();

  if (protocol === 'https:') {
    const normalizedHosts = new Set(allowedHosts.map((host) => host.toLowerCase()));
    const hostname = parsed.hostname.toLowerCase();

    if (!normalizedHosts.has(hostname)) {
      return { ok: false, reason: `Untrusted host "${hostname}".` };
    }

    return {
      ok: true,
      normalizedUrl: parsed.toString(),
      pathname: parsed.pathname,
    };
  }

  if (normalizedSchemes.has(protocol)) {
    return {
      ok: true,
      normalizedUrl: parsed.toString(),
      pathname: parsed.pathname,
    };
  }

  return { ok: false, reason: `Disallowed URL protocol "${protocol}".` };
}

/**
 * Redacts sensitive query parameters from a URL string so tokens or OAuth codes
 * never leak into logs, crash reports, or analytics events.
 */
export function redactSensitiveUrlParams(
  rawUrl: string,
  sensitiveParams: readonly string[] = DEFAULT_SENSITIVE_QUERY_PARAMS,
): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return '[INVALID_URL]';
  }

  const sensitiveSet = new Set(sensitiveParams.map((param) => param.toLowerCase()));
  const keys = Array.from(parsed.searchParams.keys());

  for (const key of keys) {
    if (sensitiveSet.has(key.toLowerCase())) {
      parsed.searchParams.set(key, 'REDACTED');
    }
  }

  return parsed.toString();
}
