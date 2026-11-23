# Day 23: Security

## Learning Objectives
By the end of Day 23, you will be able to:
- Choose between hardware-backed encrypted storage (`expo-secure-store`) and general-purpose storage (`AsyncStorage` / `expo-sqlite`) based on data sensitivity.
- Handle authentication tokens safely using short-lived access tokens, refresh token rotation, and server-side authorization.
- Explain why `EXPO_PUBLIC_*` environment variables are bundled into the client binary and NEVER safe for secrets, and move private secrets behind a backend API.
- Prevent sensitive data leakage across console logs, crash reporters, app-switcher snapshots, and persisted Redux/Zustand stores.
- Understand mobile transport security (HTTPS/TLS) and certificate pinning trade-offs.
- Defend against common mobile security mistakes including hardcoded keys, trusting client-side validation, and deep-link injection.

## Prerequisites
- Completion of [Day 10: State Management](../day-10-state-management/README.md), [Day 11: API Integration](../day-11-api-integration/README.md), [Day 12: Authentication](../day-12-authentication/README.md), and [Day 17: Local Storage and Offline](../day-17-local-storage-and-offline/README.md).
- Familiarity with `expo-secure-store`, JWT authentication flows, and deep links.

## Why This Concept Matters
A single leaked API secret, unencrypted auth token, or unvalidated deep link can compromise every user of your app—and unlike a website where you can hotfix a server in 60 seconds, a secret shipped inside an App Store or Play Store binary lives on users' phones forever. Treating security as a day-to-day habit (hardware-backed token storage, redacted logging, strict input/URL allowlists, and server-side secrets) protects your users, your billing account, and your reputation.

## Introduction
A mobile app runs on hardware you do **not** control. Anyone can download your `.ipa` or `.apk` from the store, unzip it in seconds, inspect bundled JavaScript or precompiled Hermes bytecode (`.hbc`) strings, attach a network proxy to watch HTTPS requests on their own device, or read unencrypted files off a rooted/jailbroken phone.

Because the client environment is fundamentally **untrusted**, mobile security is built on two core principles:
1. **Minimize what the client holds:** Never ship private API keys or trust the client to enforce authorization.
2. **Protect what the client must hold:** Keep user session tokens in OS-managed encrypted storage, scrub secrets from logs, validate untrusted inputs (like deep links), and encrypt all network traffic.

## Concepts

### 1. Web vs. Mobile Security Mental Model

> **Web vs. Mobile Security Callout:** Many developers assume compiled mobile apps hide secrets better than browser JavaScript—they do **not**. Both an `.ipa`/`.apk` binary and a browser JS bundle run on the user's own device:
> - **Unpacking mobile binaries is trivial:** Anyone can extract strings from an app bundle (even when JS is precompiled into Hermes `.hbc` bytecode). That means `EXPO_PUBLIC_*` variables are **never secret**, just like `NEXT_PUBLIC_*` or `VITE_*` variables in web bundles.
> - **No `HttpOnly` browser cookies by default:** Web apps often store sessions in `HttpOnly` cookies so JS cannot read them. Native mobile apps typically manage bearer/refresh tokens directly—so you must store tokens in hardware-backed **`expo-secure-store`** (iOS Keychain / Android Keystore), **never** in plaintext `AsyncStorage` (which is just as readable as browser `localStorage`).
> - **Backend owns private keys & authorization:** Just like on the web, third-party secret keys (Stripe secret keys, OpenAI keys, DB passwords) and role/permission checks must live exclusively on your backend server.

| Security Layer | React Web | React Native + Expo SDK 58 |
| --- | --- | --- |
| **Public client env vars** | `VITE_*` / `NEXT_PUBLIC_*` (visible in DevTools) | `EXPO_PUBLIC_*` (inlined into JS/Hermes bundle—visible in `.ipa`/`.apk`) |
| **Plaintext local storage** | `localStorage` / `IndexedDB` | `@react-native-async-storage/async-storage` / unencrypted `expo-sqlite` |
| **Sensitive token storage** | `HttpOnly; Secure; SameSite` cookies | `expo-secure-store` (iOS Keychain / Android Keystore) |
| **Private secrets & authz** | Backend server / API routes | Backend server / Edge Functions |

### 2. Secure Storage (`expo-secure-store`) vs. `AsyncStorage`
Not all local storage is created equal:

| Storage | Underlying Mechanism | Encrypted? | What Belongs Here |
| --- | --- | --- | --- |
| `expo-secure-store` | **iOS Keychain** / **Android Keystore** | Yes (OS hardware-backed) | Access tokens, refresh tokens, PIN hashes, encryption keys (small items ≤ 2 KB) |
| `@react-native-async-storage/async-storage` | Unencrypted SQLite / plist files | **No (plaintext)** | Theme preference, onboarding flag, non-sensitive UI settings |
| `expo-sqlite` | Local SQLite database | **No** (unless encrypted with SQLCipher) | Offline caches of non-sensitive data (articles, public catalog) |

Key `expo-secure-store` best practices:
- Always specify `keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` (or `WHEN_UNLOCKED_THIS_DEVICE_ONLY` for banking/high-security apps) so secrets are not migrated to another device via iCloud backups.
- Respect the ~**2048-byte limit** per value — store compact tokens or a single encryption key, never large user profiles.
- Validate keys against `/^[A-Za-z0-9._-]+$/` and check `SecureStore.isAvailableAsync()` rather than silently falling back to plaintext `AsyncStorage`.

### 3. API Security & Handling Authentication Tokens Safely
- **Enforce HTTPS/TLS everywhere:** Never ship `http://` API endpoints in production. iOS App Transport Security (ATS) and Android Network Security Config block cleartext traffic by default — do not disable them globally.
- **Short-lived access tokens + refresh token rotation:** Keep JWT access tokens short-lived (e.g., 5–15 minutes). Store the refresh token in `expo-secure-store` and have your backend **rotate** the refresh token on every renewal (invalidating the previous token immediately so replay attacks can be detected).
- **Clear tokens completely on sign-out and `401` refresh failure:** Remove them from both in-memory state and `expo-secure-store`, and clear cached React Query data (`queryClient.clear()`).
- **Server-side authorization is non-negotiable:** Hiding an "Admin" button in React Native only improves UX; it is **not** security. Every API endpoint must verify the caller's identity and permissions on the server.

### 4. Environment Variables in Expo (`EXPO_PUBLIC_*`)
In Expo, any variable prefixed with `EXPO_PUBLIC_` (such as `EXPO_PUBLIC_API_URL`) is **inlined as plain text into your JavaScript bundle** at build time.

> **Critical Rule:** `EXPO_PUBLIC_*` is for **public configuration only** (API base URLs, Sentry DSNs, public analytics keys, Stripe *publishable* keys). **NEVER** put database passwords, Stripe *secret* keys, OpenAI API keys, Firebase Admin credentials, or JWT signing secrets in `EXPO_PUBLIC_*` or anywhere in your React Native codebase!

If your mobile app needs to call a third-party service that requires a private API key (such as OpenAI, Twilio, or Stripe):
1. Call **your own backend** (a REST API, Edge Function, or Backend-for-Frontend) authenticated with the user's session token.
2. Keep the third-party secret exclusively in your **server's** environment variables.
3. Have your backend validate rate limits, verify permissions, call the third-party API, and return only the needed response to the app.

### 5. Preventing Sensitive Data Leakage
Secrets rarely leak through exotic cryptography bugs — they leak through everyday developer habits:
- **Console & crash logs:** Logging full Axios request configs (`console.log(error.config)`) prints `Authorization: Bearer eyJ...` into Xcode Console, Android `logcat`, and third-party crash tools! Wrap logging in a redacting helper (see `examples/safeLogger.ts`) and disable verbose logs in production.
- **Zustand / Redux persistence:** If you use Zustand's `persist` middleware backed by `AsyncStorage`, **whitelist only non-sensitive UI slices** with `partialize`. Never persist `accessToken`, `password`, or personal financial details into `AsyncStorage`.
- **App-switcher screenshots & screen capture:** Both iOS and Android take a snapshot of your active screen when the app moves to the background (for the multitasking switcher). For banking, health, or vault screens, mask sensitive views when `AppState` transitions to `inactive`/`background`, or use a dedicated screen-capture prevention library (`expo-screen-capture`).
- **Clipboard exposure:** Avoid copying secrets automatically to the system clipboard, which other apps or universal clipboard sync can inspect.

### 6. Network Security & Certificate Pinning Concepts
Standard HTTPS verifies that the server presents a certificate signed by any trusted Certificate Authority (CA) installed on the device. **Certificate (or public-key) pinning** goes a step further: the mobile app embeds a cryptographic hash (SPKI pin) of your server's expected public key and refuses connections if the certificate doesn't match — blocking even rogue CAs or user-installed proxy certificates (MITM interception).

**Trade-offs to know before pinning:**
- Pinning is essential for high-value apps (banking, healthcare, fintech), but **misconfigured pins can brick your app** when your TLS certificate rotates!
- Always pin the **public key (SPKI) or intermediate CA** rather than a single leaf certificate, and always include at least **one backup pin** so certificate rotation never locks out users on older app versions.
- Certificate pinning requires native networking configuration (Android `network_security_config.xml` / iOS TrustKit or native config plugins) via an Expo development build.

### 7. Common Mobile Security Mistakes
1. **Hardcoding secrets in source code or `.env` files committed to Git:** Even deleting a secret in a later commit leaves it in Git history — always rotate compromised keys immediately.
2. **Trusting client-side validation:** Zod and React Hook Form give great UX, but an attacker can call your API directly with `curl`. Always re-validate every payload on the server.
3. **Deep-link injection & open redirects:** Any website or SMS can invoke `myapp://checkout?redirect=https://evil.example` or pass malicious query values. Always validate schemes, host allowlists, and parameters before navigating or opening URLs with `Linking.openURL`.
4. **Blindly trusting `JSON.parse()` from storage or APIs:** Validate shapes with TypeScript type guards or Zod schemas before using persisted data.

## Code Examples

> **How to use & test today's examples:**
> - Both files below are **reusable security helper/service modules** (not standalone screens).
> - Import them into any authentication screen (such as Day 12's auth flow or your Expo app launched via `npm start` in this repo's shared Expo workspace) or test them directly with Jest unit tests (`npm test`).

### Example 1: Hardware-Backed Token Vault (`expo-secure-store`)
- **Type:** Reusable security service module (`setSecret`, `getSecret`, `deleteSecret`, `saveAuthTokens`, `getAuthTokens`, `clearAuthTokens`, `isAccessTokenExpired`)
- **File:** [`examples/secureVault.ts`](./examples/secureVault.ts)
- **Where to place in an Expo project:** `src/services/security/secureVault.ts`
- **What it demonstrates:** Key format validation, UTF-8 byte-limit checks (≤ 2048 bytes), `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`, no silent plaintext fallback, runtime token validation with automatic corruption cleanup, and expiration buffer checking.

### Example 2: Redacting Production-Safe Logger
- **Type:** Reusable utility module (`redactValue`, `createSafeLogger`, `safeLogger`)
- **File:** [`examples/safeLogger.ts`](./examples/safeLogger.ts)
- **Where to place in an Expo project:** `src/utils/safeLogger.ts`
- **What it demonstrates:** Recursive redaction of sensitive keys (`password`, `token`, `authorization`, `apiKey`, `cvv`, etc.), inline `Bearer` token and JWT scrubbing inside strings, circular-reference safety via `WeakSet`, and silencing `debug`/`info` logs in production builds.

## Step-by-Step Explanation
Let's trace how `secureVault.ts` and `safeLogger.ts` work together in a real authentication layer:
1. **Strict key and size validation (`secureVault.ts`):** `assertValidKey` enforces `expo-secure-store`'s strict character rules before hitting native code, and `getUtf8ByteLength` prevents silent truncation or native errors if a payload grows beyond 2048 bytes.
2. **No silent insecure fallback:** If `SecureStore.isAvailableAsync()` returns `false`, `setSecret` throws an explicit error instead of falling back to unencrypted `AsyncStorage`.
3. **Runtime type guard on read:** `getAuthTokens()` parses stored JSON as `unknown` and verifies it via `isAuthTokens(...)`. If data is corrupted or tampered with, it clears the entry cleanly instead of crashing the app.
4. **Expiration buffer (`isAccessTokenExpired`):** Adding a 30-second buffer lets your API client proactively refresh an access token right before it expires.
5. **Recursive redaction (`safeLogger.ts`):** `redactValue()` walks nested objects and arrays with a `WeakSet` to avoid infinite recursion on circular objects, redacting both sensitive property names and raw JWT/`Bearer` patterns inside plain strings.

## Expected Output

### 1. Redacted Logging (`safeLogger.ts`)
When you call:

```ts
safeLogger.warn('Request failed with Bearer abc123secret', {
  endpoint: '/v1/profile',
  headers: { Authorization: 'Bearer super-secret-token' },
  user: { email: 'dev@example.com', password: 'hunter2' },
});
```

Console / Metro output (secrets scrubbed automatically):

```text
[WARN] Request failed with Bearer [REDACTED] {
  endpoint: '/v1/profile',
  headers: { Authorization: '[REDACTED]' },
  user: { email: 'dev@example.com', password: '[REDACTED]' }
}
```

In a release build (`__DEV__ === false`), `safeLogger.debug(...)` and `safeLogger.info(...)` emit nothing at all, while `warn` and `error` remain redacted.

### 2. Secure Vault Guards (`secureVault.ts`)
- Calling `saveAuthTokens({ accessToken, refreshToken, expiresAt })` writes encrypted data to iOS Keychain / Android Keystore with `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
- Calling `setSecret('bad key!', 'val')` throws `Invalid SecureStore key "bad key!"...`.
- Calling `setSecret('app.blob', 'x'.repeat(2500))` throws `Payload for "app.blob" is 2500 bytes, exceeding SecureStore's 2048-byte limit.`
- Calling `getAuthTokens()` when stored JSON is malformed or missing required fields automatically deletes the corrupted entry and returns `null`.

## Common Mistakes
- **Storing JWTs in `AsyncStorage`:** Any backup or rooted device tool can read `AsyncStorage` in plain text. **Fix:** Always use `expo-secure-store` (via `secureVault.ts`).
- **Putting private third-party API keys in `EXPO_PUBLIC_*`:** Anything prefixed with `EXPO_PUBLIC_` ships inside your app bundle and can be extracted in under a minute. **Fix:** Move third-party API calls behind your own authenticated backend.
- **Using `console.log(response)` or `console.log(headers)` in API interceptors:** Leaks live `Authorization` headers and user PII into device logs. **Fix:** Log exclusively through `safeLogger`.
- **Persisting the entire Zustand auth store to `AsyncStorage`:** Even if you meant to save only `user.displayName`, persisting the full store dumps tokens into plaintext disk files. **Fix:** Use `partialize` to whitelist strictly non-sensitive UI slices.
- **Passing unvalidated deep-link URLs straight to `Linking.openURL` or `WebView`:** Enables phishing redirects and `javascript:` / `file:` scheme abuse. **Fix:** Validate schemes and hosts against an explicit allowlist before opening or navigating.

## Best Practices
- **Store tokens exclusively in `expo-secure-store`** with `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` (or stricter).
- **Route all private third-party API calls through your backend** — keep client env vars strictly public.
- **Run `npm audit` and keep Expo SDK / native dependencies updated** to receive upstream TLS, Hermes, and OS security patches.
- **Use a redacting logger everywhere** and strip noisy logs in production builds.
- **Validate every external entry point** (deep links, push notification data, QR code strings, API responses) with strict allowlists and schemas.

## Exercises
Work through the guided exercises in [`./exercises/README.md`](./exercises/README.md) using the starter file [`./exercises/InputSanitizerExercise.ts`](./exercises/InputSanitizerExercise.ts):
- **Beginner:** Implement `sanitizeUserInput` to strip invisible ASCII control characters, trim whitespace, and enforce maximum length limits.
- **Intermediate:** Implement `validateDeepLinkUrl` with strict `https:` host allowlists, custom app-scheme allowlists, and rejection of embedded credentials and dangerous protocols (`javascript:`, `http:`, `file:`).
- **Challenge:** Implement `redactSensitiveUrlParams` to scrub `token`, `code`, `api_key`, and `password` query parameters before logging incoming deep links.

## Solutions
Complete all three defensive utilities in [`./exercises/InputSanitizerExercise.ts`](./exercises/InputSanitizerExercise.ts) and test edge cases before opening the reference solution.

<details>
<summary>Click to view solution notes & links</summary>

Review the complete implementation in [`./solutions/InputSanitizerSolution.ts`](./solutions/InputSanitizerSolution.ts):
- `sanitizeUserInput` filters characters by code point (`code >= 32 && code !== 127`) cleanly without triggering ESLint's `no-control-regex` rule, then trims and slices to a clamped non-negative `maxLength`.
- `validateDeepLinkUrl` returns a strict discriminated union (`DeepLinkValidationResult`) so callers must narrow `result.ok` before navigating; it rejects empty strings, malformed URLs, embedded credentials, non-allowlisted `https:` hosts, and disallowed schemes.
- `redactSensitiveUrlParams` matches parameter names case-insensitively and preserves non-sensitive parameters like `tab` or `page`, returning `'[INVALID_URL]'` for malformed inputs.

</details>

## Mini Project
**Security Hardening Audit for Your Authentication App**
Take the authentication workflow from [Day 12](../day-12-authentication/README.md) (or [`projects/project-04-authentication-app`](../../projects/project-04-authentication-app/README.md)) and harden it:
1. Replace any `AsyncStorage` token persistence with `secureVault.ts` (`saveAuthTokens`, `getAuthTokens`, `clearAuthTokens`).
2. Route all logging in your API client and auth hooks through `safeLogger.ts` and verify that passing `{ headers: { Authorization: 'Bearer secret' } }` outputs `[REDACTED]`.
3. Add a deep-link guard using `validateDeepLinkUrl` before handling any incoming Expo Router or `Linking` redirect parameter.
4. Search the entire project for hardcoded tokens, `http://` URLs, and misused `EXPO_PUBLIC_` secrets, and document your findings in a short `SECURITY_NOTES.md`.

## Key Takeaways
- Treat the mobile client as an untrusted environment: enforce authorization and store private API keys on the server.
- Use `expo-secure-store` for small secrets (tokens/keys) and never silently fall back to plaintext `AsyncStorage`.
- `EXPO_PUBLIC_*` variables are public client configuration — never secrets.
- Redact logs, scrub persisted stores, and validate deep links against strict allowlists.

## Further Reading
- [Expo Security & Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Native Security Guide](https://reactnative.dev/docs/security)
- [OWASP Mobile Application Security (MASVS)](https://mas.owasp.org/)

## Progress Checklist
- [ ] Understood the Web vs. Mobile security mental model and the difference between `expo-secure-store` (Keychain/Keystore) and `AsyncStorage`
- [ ] Verified I have zero secrets in `EXPO_PUBLIC_*` environment variables
- [ ] Reviewed `examples/secureVault.ts` and `examples/safeLogger.ts`
- [ ] Completed Beginner, Intermediate, and Challenge tasks in `./exercises/InputSanitizerExercise.ts`
- [ ] Compared my code with `./solutions/InputSanitizerSolution.ts`

## Next Day
Continue to [Day 24: Debugging and Developer Tools](../day-24-debugging-and-devtools/README.md) to master React Native DevTools, native logs, error boundaries, and performance profiling.
