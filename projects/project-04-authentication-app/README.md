# Project 04: Secure Authentication App

> **Curriculum Alignment:** [Day 12: Authentication Flows](../../days/day-12-authentication/README.md) & [Day 23: Mobile Security](../../days/day-23-security/README.md)

## Project Overview

The **Secure Authentication App** demonstrates how to design and build a modern, production-informed authentication flow in React Native with Expo SDK 58 and Expo Router. Rather than storing credentials or raw tokens in insecure `AsyncStorage`, this project persists session tokens in hardware-backed native storage (`expo-secure-store`), validates user input with `react-hook-form` + `zod` v4, hydrates sessions cleanly on startup, and protects private routes automatically.

Use this project as a clean reference architecture when wiring authentication into any real Expo Router application.

## Features

- **Schema-Driven Form Validation:** Email and password validation powered by `react-hook-form` and `zod` v4 (`loginSchema`, `signUpSchema`, and `evaluatePasswordStrength`).
- **Hardware-Backed Token Persistence:** Stores access and refresh tokens in iOS Keychain / Android Keystore via `expo-secure-store` with `AFTER_FIRST_UNLOCK` accessibility.
- **Automatic Session Hydration & Silent Refresh:** Restores persisted sessions on app launch, checks access token expiration with a safety buffer, and automatically rotates expired tokens before falling back to sign-in.
- **Corrupted Storage Self-Healing:** Runtime type guards validate deserialized JSON from secure storage and automatically clear malformed entries instead of crashing.
- **Protected Route Synchronization:** `useProtectedRoute()` coordinates `AuthProvider` status with Expo Router's `(auth)` and `(app)` route groups.
- **Accessible Auth UI:** Screen-reader-friendly labels, error live regions, keyboard focus chaining, password visibility toggles, and masked token previews (never exposing raw secrets in UI).

## Technologies

| Layer | Technology | Purpose |
| --- | --- | --- |
| Framework | Expo SDK ~58.0.0 & React Native 0.88.0 | Cross-platform native runtime with New Architecture |
| Routing | Expo Router ~58.0.0 | File-based `(auth)` / `(app)` protected route groups |
| Language | TypeScript ~5.8.3 (`strict`, `noUncheckedIndexedAccess`) | End-to-end compile-time safety |
| Forms & Validation | `react-hook-form` 7.x, `zod` 4.x, `@hookform/resolvers` | Controlled mobile inputs with schema validation |
| Secure Storage | `expo-secure-store` ~58.0.0 | Native Keychain / Keystore token persistence |
| Layout & Safe Areas | `react-native-safe-area-context` 5.x | Proper notch and gesture-bar insets |
| Testing | Jest + `jest-expo` ~58.0.0 | Automated validation schema unit tests |

## Screens

1. **Login Screen (`LoginScreen.tsx`):**
   - Email and password inputs validated via `loginSchema`.
   - Password visibility toggle, keyboard focus transition (`next` → `done`), inline error messages, server error alert banner, loading state, and a one-tap **Fill Demo Credentials** helper (`alex@example.com` / `SecurePass123`).
2. **Account & Session Screen (`AccountScreen.tsx`):**
   - Displays the authenticated user's initials avatar, name, email, and role badge.
   - Summarizes session security: storage backend (`expo-secure-store`), masked access token preview, and remaining token lifetime.
   - Allows testing live token rotation (`Rotate Access Token`) and confirmed sign-out (`Sign Out`).

## Folder Structure

```text
projects/project-04-authentication-app/
├── README.md
└── src/
    ├── context/
    │   └── AuthProvider.tsx          # Session state, hydration, refresh, and useProtectedRoute()
    ├── screens/
    │   ├── AccountScreen.tsx         # Protected account & token inspection screen
    │   └── LoginScreen.tsx           # Validated login screen using react-hook-form + zod
    ├── services/
    │   └── secureTokenService.ts     # expo-secure-store persistence + demo auth API adapter
    ├── types/
    │   └── auth.ts                   # AuthStatus, AuthUser, AuthTokens, AuthSession, expiry helper
    └── validation/
        ├── authSchemas.ts            # loginSchema, signUpSchema, evaluatePasswordStrength
        └── authSchemas.test.ts       # Jest unit tests for validation schemas
```

Browse the source files directly:

- [src/types/auth.ts](./src/types/auth.ts)
- [src/validation/authSchemas.ts](./src/validation/authSchemas.ts)
- [src/validation/authSchemas.test.ts](./src/validation/authSchemas.test.ts)
- [src/services/secureTokenService.ts](./src/services/secureTokenService.ts)
- [src/context/AuthProvider.tsx](./src/context/AuthProvider.tsx)
- [src/screens/LoginScreen.tsx](./src/screens/LoginScreen.tsx)
- [src/screens/AccountScreen.tsx](./src/screens/AccountScreen.tsx)

## Implementation Steps

Follow these steps to wire the project into an Expo Router `app/` directory:

1. **Model Session Types (`src/types/auth.ts`):**
   Define explicit `AuthStatus` (`'hydrating' | 'authenticated' | 'unauthenticated'`), `AuthUser`, `AuthTokens`, and `isAccessTokenExpired()` with a 30-second refresh buffer so requests do not race token expiry.
2. **Create Zod Schemas (`src/validation/authSchemas.ts`):**
   Keep input and output types identical (avoid `.default()` or `.coerce` inside form schemas) so `zodResolver` integrates cleanly with `useForm<LoginFormValues>`.
3. **Build the Secure Token Service (`src/services/secureTokenService.ts`):**
   Wrap `expo-secure-store` behind small, well-typed functions (`saveSession`, `loadSession`, `updateTokens`, `clearSession`). Always validate parsed JSON with type guards before trusting stored data.
4. **Implement `AuthProvider` & Route Protection (`src/context/AuthProvider.tsx`):**
   Hydrate persisted tokens once on mount. In your root Expo Router layout (`app/_layout.tsx`), wrap your navigator with `SafeAreaProvider` and `AuthProvider`, then call `useProtectedRoute()`:

   ```tsx
   import { Slot } from 'expo-router';
   import { SafeAreaProvider } from 'react-native-safe-area-context';
   import { AuthProvider, useProtectedRoute } from '../projects/project-04-authentication-app/src/context/AuthProvider';

   function RootNavigator() {
     useProtectedRoute();
     return <Slot />;
   }

   export default function RootLayout() {
     return (
       <SafeAreaProvider>
         <AuthProvider>
           <RootNavigator />
         </AuthProvider>
       </SafeAreaProvider>
     );
   }
   ```

5. **Connect Route Files in `app/`:**
   - `app/(auth)/login.tsx` → renders `<LoginScreen />`
   - `app/(app)/account.tsx` → renders `<AccountScreen />`
6. **Swap the Demo Adapter for Your Backend:**
   Replace `authenticateWithDemoApi` and `refreshTokensWithDemoApi` in `src/services/secureTokenService.ts` with HTTPS calls to your production identity provider or backend API.

## Testing Instructions

Run the repository checks from the root directory:

```bash
# Run the authentication schema unit tests
npx jest projects/project-04-authentication-app/src/validation/authSchemas.test.ts

# Run all Jest tests across the repository
npm test

# Verify strict TypeScript compilation and ESLint rules
npm run typecheck
npm run lint
```

Manual verification checklist on a simulator or physical device:

1. Submit an empty login form and confirm inline Zod validation errors appear.
2. Submit wrong credentials and confirm the error banner announces the failure without crashing.
3. Tap **Fill Demo Credentials**, sign in, and verify navigation to **Account & Session**.
4. Force-close and reopen the app to confirm the session hydrates from `expo-secure-store`.
5. Tap **Rotate Access Token** to verify masked token rotation, then tap **Sign Out** and confirm tokens are cleared.

## Future Improvements

- **Sign-Up & Password Reset Screens:** Wire `signUpSchema` and `evaluatePasswordStrength` into a full registration screen with a visual password strength meter.
- **Biometric Unlock:** Pair `expo-local-authentication` with `expo-secure-store`'s `requireAuthentication: true` option for Face ID / Touch ID session unlock.
- **OAuth 2.0 / PKCE:** Add social sign-in (Apple / Google / GitHub) using `expo-auth-session` with PKCE instead of embedded webviews.
- **API Client Interceptor:** Attach `Authorization: Bearer <token>` headers and single-flight refresh locking inside an Axios or `fetch` client.
- **Session Revocation:** Call a backend `POST /auth/logout` endpoint to invalidate the server-side refresh token before clearing local storage.

---

**Related Lessons:** [Day 08: Navigation with Expo Router](../../days/day-08-navigation-expo-router/README.md) · [Day 09: Forms & Validation](../../days/day-09-forms-and-validation/README.md) · [Day 12: Authentication](../../days/day-12-authentication/README.md) · [Day 23: Security](../../days/day-23-security/README.md) · [Back to Curriculum Home](../../README.md)
