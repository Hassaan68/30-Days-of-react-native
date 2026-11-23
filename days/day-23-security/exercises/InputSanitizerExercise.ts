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
 * Day 23 Exercise Starter: Input & Deep-Link Sanitizer
 *
 * Mobile apps frequently receive untrusted data from deep links, push payloads,
 * QR codes, and user inputs. Complete the three security helpers below and
 * compare with `../solutions/InputSanitizerSolution.ts`.
 */

/**
 * TODO (Beginner):
 * 1. Trim leading and trailing whitespace.
 * 2. Strip invisible ASCII control characters (charCode < 32 or === 127),
 *    preserving standard spaces.
 * 3. Enforce `maxLength` by slicing the cleaned string.
 */
export function sanitizeUserInput(rawText: string, _maxLength = 200): string {
  return rawText;
}

/**
 * TODO (Intermediate):
 * Validate an incoming deep-link or redirect URL against an explicit allowlist:
 * 1. Parse `rawUrl` safely using `new URL(rawUrl)` inside a `try/catch`.
 * 2. Allow ONLY `'https:'` or a custom app scheme listed in `allowedSchemes`
 *    (reject `'javascript:'`, `'http:'`, `'data:'`, `'file:'`, etc.).
 * 3. If the protocol is `'https:'`, require `parsed.hostname` (lowercased) to be
 *    present in `allowedHosts`.
 * 4. Reject URLs containing embedded credentials (`parsed.username` or `parsed.password`).
 * 5. Return `{ ok: true, normalizedUrl: parsed.toString(), pathname: parsed.pathname }`.
 */
export function validateDeepLinkUrl(
  _rawUrl: string,
  _allowedHosts: readonly string[],
  _allowedSchemes: readonly string[] = ['myapp:'],
): DeepLinkValidationResult {
  return { ok: false, reason: 'Not implemented yet' };
}

/**
 * TODO (Challenge):
 * Before logging a URL for debugging or analytics, replace the value of any
 * sensitive query parameter (case-insensitive match against `sensitiveParams`)
 * with `'REDACTED'`. Return `'[INVALID_URL]'` if parsing fails.
 */
export function redactSensitiveUrlParams(
  rawUrl: string,
  _sensitiveParams: readonly string[] = DEFAULT_SENSITIVE_QUERY_PARAMS,
): string {
  return rawUrl;
}
