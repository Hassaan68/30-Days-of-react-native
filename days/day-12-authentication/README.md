# Day 12: Authentication

## Learning Objectives

By the end of Day 12, you will be able to:

- Design complete mobile login, registration, session restoration, and logout flows.
- Store access and refresh tokens securely using `expo-secure-store` (and explain why `AsyncStorage` is unsafe for secrets).
- Manage global authentication state cleanly with React Context (or Zustand).
- Protect private routes in Expo Router using `Stack.Protected` and layout-level redirects.
- Handle expired access tokens with refresh flows and prevent race conditions on startup.
- Clear sensitive credentials and cached server data during logout.
- Explain how OAuth 2.0 with PKCE works in mobile apps using `expo-auth-session`.

## Prerequisites

- Completion of [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md).
- Completion of [Day 09: Forms and Validation](../day-09-forms-and-validation/README.md).
- Completion of [Day 10: State Management](../day-10-state-management/README.md) and [Day 11: API Integration](../day-11-api-integration/README.md).

## Why This Concept Matters

Users trust mobile apps with their accounts, messages, health records, and payment methods—and expect to stay signed in for weeks without typing a password every time they open the app. If tokens are stored in unencrypted storage, left behind after sign-out, or checked too late during startup, your app risks credential theft, flashing private screens, or leaking one user's cached data to another. Mastering secure native storage (`expo-secure-store`), 3-state session restoration, and declarative route protection is essential for every real-world mobile app.

## Introduction

Almost every production mobile app needs to know **who** is using it. Unlike web apps—where HTTP-only cookies automatically ride along on every browser request—React Native apps usually authenticate with **token-based authentication** (most commonly short-lived JWT access tokens paired with longer-lived refresh tokens).

Getting authentication right on mobile involves more than sending a `POST /login` request. You have to store secrets in hardware-backed native storage, restore sessions cleanly before rendering protected screens, refresh expired tokens seamlessly, and wipe every trace of private data when a user signs out. Today you will learn the patterns that make mobile authentication both secure and smooth to use.

## Concepts

> **Web Cookies / `localStorage` vs. Mobile `SecureStore`**
>
> | Mechanism | Where It Lives | How Mobile Apps Differ |
> | --- | --- | --- |
> | **Browser `HttpOnly` Cookies** | Managed automatically by web browsers per origin | Native mobile HTTP stacks do not share a browser cookie jar across system views and API clients cleanly; mobile apps typically send explicit `Authorization: Bearer <token>` headers instead |
> | **Browser `localStorage` / RN `AsyncStorage`** | Plaintext disk storage | **Unsafe for tokens!** Plain `AsyncStorage` stores unencrypted SQLite/JSON files that can be extracted from device backups or rooted/jailbroken devices |
> | **Mobile `expo-secure-store`** | **iOS Keychain** & **Android Keystore** | **Recommended for mobile tokens.** Uses OS-managed, hardware-backed encryption tied to the device lock state |

### 1. The Mobile Authentication Lifecycle

A production auth flow moves through three explicit states rather than a simple boolean `isLoggedIn`:

1. **`loading`** — The app just launched and is checking secure storage for an existing session. You should render a splash screen or loading state here so private screens never flash briefly before redirecting.
2. **`authenticated`** — A valid session exists and the user profile is loaded. Private routes are accessible.
3. **`unauthenticated`** — No valid session exists (or the user signed out). Only public routes such as Sign In, Register, and Forgot Password are accessible.

### 2. Why `expo-secure-store` Instead of `AsyncStorage`?

A very common beginner mistake is storing JWTs in `@react-native-async-storage/async-storage`. **Never store tokens, passwords, or API secrets in `AsyncStorage`.**

| Storage Option | How Data Is Stored | Safe for Tokens? |
| --- | --- | --- |
| `AsyncStorage` | Unencrypted SQLite / JSON files in app storage | **No** — readable on rooted/jailbroken devices or device backups |
| `expo-secure-store` | **iOS Keychain** & **Android Keystore** (encrypted) | **Yes** — OS-managed hardware-backed encryption |
| In-memory state | RAM only (cleared when app process terminates) | **Yes** for active session state, paired with `SecureStore` for persistence |

> **Important rules for `expo-secure-store`:**
> - Keys may only contain alphanumeric characters, `.`, `-`, and `_` (for example, `auth.access_token`).
> - Individual values should stay under ~2 KB. Store only compact tokens—keep large user profiles or cached lists in memory or a query cache.
> - Set `keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY` on iOS so tokens are not migrated insecurely in unencrypted backups.

### 3. Access Tokens vs. Refresh Tokens

- **Access Token**: Short-lived (typically 5–15 minutes). Sent in the `Authorization: Bearer <token>` header on API requests. If stolen, the blast radius is limited by its short expiration.
- **Refresh Token**: Longer-lived (days or weeks). Stored in `expo-secure-store` and sent *only* to your auth server's `/auth/refresh` endpoint to mint a fresh access token (ideally rotating the refresh token at the same time).

When multiple API requests fail with `401 Unauthorized` simultaneously, queue them behind a **single** in-flight refresh promise so your app does not fire five refresh calls at once and trigger token-reuse revocation on the backend.

```ts
let refreshPromise: Promise<string> | null = null;

async function getFreshAccessToken(refreshFn: () => Promise<string>): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
```

### 4. Protected Routes in Expo Router

Modern Expo Router (SDK 53–58) provides **`Stack.Protected`**, a declarative way to gate entire route groups based on auth state without manual `useEffect` navigation loops:

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNavigator() {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return null; // Keep splash screen visible until session check completes
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
```

Notice how clean this is: as soon as `signIn()` flips `isAuthenticated` to `true`, Expo Router automatically transitions from `(auth)` to `(app)` and clears the auth history so the Android back button cannot return the user to the login screen!

If you are protecting a single nested layout or building a custom role-based screen guard, you can also combine `useAuth()` with `<Redirect href="/sign-in" />` or a reusable `<AuthGuard>` wrapper component.

### 5. Secure Logout (Clearing Everything)

Logging out is more than setting `user` to `null`. A thorough logout sequence:

1. Notifies the backend (best-effort) to revoke the refresh token.
2. Deletes tokens from `expo-secure-store` (`clearTokens()`).
3. Resets in-memory auth state (`user = null`, `status = 'unauthenticated'`).
4. Clears cached private server data (e.g., `queryClient.clear()` in TanStack Query and any user-scoped Zustand stores) so the next person who signs in on a shared device never sees the previous user's cached screens.

### 6. OAuth 2.0 & PKCE on Mobile (`expo-auth-session`)

When integrating "Sign in with Google", GitHub, Auth0, or Cognito, mobile apps are **public clients**—you cannot safely embed a client secret inside an app binary because anyone can decompile an IPA/APK.

Instead, mobile apps use **OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange)**:

1. Your app generates a random `code_verifier` and its SHA-256 hash (`code_challenge`).
2. Your app opens the provider's login page in the system browser (`ASWebAuthenticationSession` on iOS / Chrome Custom Tabs on Android via `expo-auth-session`), never an embedded `WebView`.
3. After the user approves, the provider redirects back to your app's custom URL scheme (e.g., `thirtydaysrn://auth/callback?code=...`).
4. Your app exchanges the short-lived authorization `code` + original `code_verifier` for tokens. Without the original `code_verifier`, an intercepted code is useless.

## Code Examples

Both files below are strictly typed reusable modules designed to power any Expo Router app (and you can preview interactive auth screens built with these patterns right away via `npm start` in this repository's shared Expo launcher):

### 1. Secure Token Storage (`examples/tokenStorage.ts`)

- **Type**: **Reusable helper/module** (place in `src/auth/tokenStorage.ts` or `lib/tokenStorage.ts` in your Expo project).
- Read the full strictly typed implementation in [`./examples/tokenStorage.ts`](./examples/tokenStorage.ts). It encapsulates `expo-secure-store`, validates key formats, checks expiration with a 60-second safety buffer, and provides an in-memory fallback when running on web previews (never falling back to `AsyncStorage`).

### 2. Auth Context with Session Restoration (`examples/AuthContext.tsx`)

- **Type**: **Reusable provider/context module** (place in `src/context/AuthContext.tsx` and wrap your root `app/_layout.tsx` in `<AuthProvider>`).
- Read [`./examples/AuthContext.tsx`](./examples/AuthContext.tsx) to see how `AuthProvider` and `useAuth()` coordinate:
  - Initial session restoration on app mount (with cancellation protection via an `active` flag).
  - Automatic refresh when a stored access token is expired.
  - `signIn`, `register`, `signOut`, and `refreshSession` actions (backed by an offline-friendly `demoAuthApi` so you can test immediately).
  - An `onSignOut` callback prop so you can wire in `queryClient.clear()` cleanly without coupling your auth provider to a specific data-fetching library.

## Step-by-Step Explanation

1. **Bootstrap (`useEffect` in `AuthProvider`)**: When the app starts, `status` begins as `'loading'`. `bootstrap()` reads tokens via `getTokens()`.
2. **Validate or Refresh**:
   - If no tokens exist, `status` transitions to `'unauthenticated'`.
   - If tokens exist and `isTokenExpired(storedTokens)` is `true`, we call `refresh()` and save the newly minted tokens before marking the user `'authenticated'`.
   - If refresh fails (expired or revoked refresh token), we call `clearTokens()` and transition to `'unauthenticated'`.
3. **Sign In & Register**: Both actions clear previous errors, call the auth endpoint, persist tokens in `expo-secure-store` *before* updating state, and then set `user` and `status = 'authenticated'`.
4. **Sign Out**: Deletes tokens from `expo-secure-store`, resets React state, and triggers `onSignOut?.()` to flush cached data.

## Expected Output

When you wrap your screens in `AuthProvider` and guard a screen with `AuthGuardSolution` (or `Stack.Protected`):

1. **App launch (`status === 'loading'`)**: A centered spinner with `"Restoring your session..."` renders while `expo-secure-store` is checked—no private content flashes.
2. **Signed out (`status === 'unauthenticated'`)**: The user sees either your Sign In screen or the default guard card with a **`Retry Session`** button:

```text
+--------------------------------------+
|  Sign In Required                    |
|  You need an active session to view  |
|  this screen.                        |
|        [   Retry Session   ]         |
+--------------------------------------+
```

3. **Signed in (`status === 'authenticated'`)**: Signing in with `learner@example.com` (password ≥ 8 chars) stores tokens in Keychain/Keystore and unlocks protected screens immediately—and reopening the app restores the session automatically.
4. **Role mismatch (`requiredRole="admin"`)**: A standard member (`learner@example.com`) sees an **"Access Denied — Insufficient Permissions"** card with a red **`Switch Account`** button, whereas signing in as `admin@example.com` unlocks the admin screen.

## Common Mistakes

1. **Storing tokens in `AsyncStorage`**: Leaves sensitive credentials unencrypted on disk. Always use `expo-secure-store`.
2. **Flashing protected screens on startup**: Using a boolean `isLoggedIn = false` initially causes the login screen to flash for a split second before the saved token loads. Always model an explicit `'loading'` status.
3. **Navigating inside render**: Calling `router.replace('/login')` directly inside the render body triggers React warnings and race conditions. Use `Stack.Protected`, `<Redirect />`, or trigger imperative redirects inside `useEffect`.
4. **Forgetting to clear caches on logout**: Leaving TanStack Query or Zustand populated leaks User A's private data when User B signs in.
5. **Embedding OAuth client secrets in mobile bundles**: Anything shipped in JavaScript or `EXPO_PUBLIC_*` environment variables is public. Use OAuth 2.0 + PKCE instead.
6. **Using an embedded `WebView` for OAuth**: Major providers (like Google) block `WebView` logins for security reasons and users lose access to their password manager and SSO sessions. Use `expo-auth-session`.

## Best Practices

- Keep access tokens short-lived and refresh them proactively using a clock-skew buffer (e.g., 60 seconds before expiry).
- Deduplicate concurrent refresh requests with a single shared promise.
- Combine `Stack.Protected` with `expo-splash-screen` (`SplashScreen.preventAutoHideAsync()`) so users transition straight from the native splash screen to either the Login screen or the Home screen with zero flicker.
- Never log raw access tokens, refresh tokens, or passwords to `console.log` or crash reporters (Sentry, Bugsnag).
- Pair form screens with Day 09's `react-hook-form` + `zod` schemas for clear inline validation and accessible error messages.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/AuthGuardExercise.tsx`](./exercises/AuthGuardExercise.tsx):

- **Beginner**: Render a loading spinner while `status === 'loading'` and a fallback UI when unauthenticated.
- **Intermediate**: Invoke `onUnauthenticated` safely inside `useEffect` and enforce the optional `requiredRole` prop with an "Access Denied" state.
- **Challenge**: Add a "Switch Account" action (`signOut()`) to the Access Denied screen and a "Retry Session" action (`refreshSession()`) to the default unauthenticated screen.

## Solutions

Try implementing `AuthGuardExercise.tsx` on your own first before expanding the solution walkthrough below.

<details>
<summary>Click to view solution notes & links</summary>

- [`./solutions/AuthGuardSolution.tsx`](./solutions/AuthGuardSolution.tsx) — Complete, strictly typed route and role guard demonstrating:
  - `SafeAreaView` from `react-native-safe-area-context` across loading, unauthenticated, and Access Denied states.
  - Safe invocation of `onUnauthenticated()` inside `useEffect` (never during render).
  - Role enforcement (`requiredRole && user.role !== requiredRole`) with a red **Switch Account** `Pressable` calling `void signOut()`.
  - A **Retry Session** button with local `isRetrying` loading feedback calling `await refreshSession()`.

</details>

## Mini Project

Build a two-screen **Auth Playground** inside your Expo app:

1. Wrap the root layout in `AuthProvider` from `./examples/AuthContext.tsx`.
2. Create a Sign In screen (`email` + `password` with `react-hook-form` + `zod`) that supports signing in as a standard member (`learner@example.com`) or an admin (`admin@example.com`).
3. Create a Protected Profile screen wrapped in `AuthGuardSolution` showing the user's name, email, role badge, and a **Sign Out** button.
4. Add an Admin Panel tab gated with `requiredRole="admin"` to verify the Access Denied flow.

Ready to build the full standalone authentication project? Explore [Project 04: Authentication App](../../projects/project-04-authentication-app/README.md).

## Key Takeaways

- Model authentication with three states (`loading`, `authenticated`, `unauthenticated`) to prevent launch flicker.
- Always store tokens in `expo-secure-store` (iOS Keychain / Android Keystore)—never browser-style `localStorage` or plain `AsyncStorage`.
- Use Expo Router's `Stack.Protected` for declarative route protection that keeps navigation history clean.
- On logout, clear secure storage, auth state, and all user-scoped caches.
- Use OAuth 2.0 with PKCE (`expo-auth-session`) for third-party logins on mobile.

## Further Reading

- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Router: Authentication & Protected Routes](https://docs.expo.dev/router/advanced/authentication/)
- [Expo AuthSession (OAuth 2.0 + PKCE)](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [OAuth 2.0 for Native Apps (RFC 8252)](https://datatracker.ietf.org/doc/html/rfc8252)

## Progress Checklist

- [ ] Understand why mobile apps use `expo-secure-store` instead of cookies, `localStorage`, or `AsyncStorage`
- [ ] Read `examples/tokenStorage.ts` and `examples/AuthContext.tsx`
- [ ] Understand how `Stack.Protected` guards authenticated vs. unauthenticated routes
- [ ] Complete `exercises/AuthGuardExercise.tsx` and compare with `solutions/AuthGuardSolution.tsx`
- [ ] Build the Auth Playground mini project and verify session restoration across app restarts

## Next Day

Continue to [Day 13: Device Features](../day-13-device-features/README.md) to unlock the camera, photo library, GPS location, notifications, haptics, clipboard, and native sharing.
