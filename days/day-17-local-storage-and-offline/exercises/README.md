# Day 17 Exercises: Local Storage and Offline Apps

Practice choosing the right storage backend for each type of data and handling JSON serialization safely without `any`.

## Setup

Open [`StorageHelperExercise.ts`](./StorageHelperExercise.ts). It defines the interfaces and typed skeleton for two helpers:
- `preferencesStorage`: Stores non-sensitive user preferences in `@react-native-async-storage/async-storage`.
- `secureTokenStorage`: Stores sensitive authentication tokens in `expo-secure-store`.

## Tasks

### Exercise 1 (Beginner): Safe JSON Preferences Helper
- Implement `savePreferences(prefs)` using `AsyncStorage.setItem` with `JSON.stringify`.
- Implement `loadPreferences()` using `AsyncStorage.getItem`, `JSON.parse`, and the provided `isUserPreferences` type guard.
- Return `DEFAULT_PREFERENCES` if the key does not exist, contains invalid JSON, or fails validation.
- Implement `clearPreferences()` using `AsyncStorage.removeItem`.

### Exercise 2 (Intermediate): Encrypted Token Storage
- Implement `saveAuthTokens(tokens)` using `SecureStore.setItemAsync` (never AsyncStorage!).
- Implement `loadAuthTokens()` using `SecureStore.getItemAsync` and the `isAuthTokens` type guard. Return `null` when missing or corrupted.
- Implement `clearAuthTokens()` using `SecureStore.deleteItemAsync`.

### Exercise 3 (Challenge): Generic Type-Safe `readJson<T>` Helper
- Implement `readJson<T>(key, guard, fallback)` so any non-sensitive feature module can read and validate typed JSON from AsyncStorage with zero `any` casts and automatic fallback recovery.

## Verification

Compare your implementation with [`../solutions/StorageHelperSolution.ts`](../solutions/StorageHelperSolution.ts) and run:

```bash
npm run typecheck
npm run lint
```
