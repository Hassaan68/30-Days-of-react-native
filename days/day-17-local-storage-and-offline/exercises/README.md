# Day 17 Exercises: Local Storage and Offline Apps

Practice choosing the right storage backend for each type of data and handling JSON serialization safely without `any`.

## How to Practise

1. Open the starter file [`StorageHelperExercise.ts`](./StorageHelperExercise.ts). It defines the TypeScript interfaces, runtime type guards (`isUserPreferences`, `isAuthTokens`), storage keys, and skeletons for `readJson`, `preferencesStorage`, and `secureTokenStorage`.
2. Implement the `TODO` methods directly in `StorageHelperExercise.ts`.
3. Validate your work after each step:
   ```bash
   npm run typecheck
   npm run lint
   ```
4. Optionally wire `preferencesStorage` and `secureTokenStorage` into a test screen in the shared Expo workspace (`npm start`) or write a quick Jest unit test with mocked AsyncStorage/SecureStore to verify corrupted-JSON recovery.

---

## Exercise 1 (Beginner): Safe JSON Preferences Helper

### Requirements

- Implement `preferencesStorage.save(prefs)` using `AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))`.
- Implement `preferencesStorage.load()` to read and validate persisted preferences using `isUserPreferences` (and `readJson` once completed in Exercise 3), falling back to `DEFAULT_PREFERENCES`.
- Implement `preferencesStorage.clear()` using `AsyncStorage.removeItem(PREFERENCES_KEY)`.

### Acceptance Criteria

- [ ] Non-sensitive user preferences are stored in `@react-native-async-storage/async-storage` under `PREFERENCES_KEY`.
- [ ] `load()` returns `DEFAULT_PREFERENCES` when the key does not exist, contains malformed JSON, or fails `isUserPreferences`.
- [ ] `clear()` removes the stored preference key cleanly.
- [ ] Zero `any` or unsafe `as UserPreferences` casts are used.

### Expected Behavior

Saving `{ theme: 'dark', compactMode: true, notificationsEnabled: false }` and calling `load()` returns that exact object. After `clear()` (or if disk data is corrupted to `"{broken"`), `load()` safely resolves to `DEFAULT_PREFERENCES` without throwing.

<details>
<summary>Hint</summary>

If you tackle Exercise 1 before Exercise 3, you can parse inside `load()` with `const parsed: unknown = JSON.parse(raw)` inside a `try / catch`, check `isUserPreferences(parsed)`, and then refactor `load()` to a one-liner calling `readJson(PREFERENCES_KEY, isUserPreferences, DEFAULT_PREFERENCES)` in Exercise 3.

</details>

---

## Exercise 2 (Intermediate): Encrypted Token Storage

### Requirements

- Implement `secureTokenStorage.save(tokens)` using `SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens))` — never AsyncStorage!
- Implement `secureTokenStorage.load()` using `SecureStore.getItemAsync(AUTH_TOKENS_KEY)`, safely parsing into `unknown` inside a `try / catch` and validating with `isAuthTokens`. Return `null` when missing, unparseable, or invalid.
- Implement `secureTokenStorage.clear()` using `SecureStore.deleteItemAsync(AUTH_TOKENS_KEY)`.

### Acceptance Criteria

- [ ] Sensitive tokens are persisted exclusively via `expo-secure-store` under the SecureStore-safe key `AUTH_TOKENS_KEY` (`app_auth_tokens_v1` — no colons!).
- [ ] `load()` returns `AuthTokens` only when `isAuthTokens(parsed)` returns `true`, and `null` otherwise.
- [ ] `clear()` deletes the key from Keychain/Keystore via `SecureStore.deleteItemAsync`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

Valid auth tokens persist encrypted across app restarts, corrupted entries gracefully resolve to `null` (forcing a clean re-login instead of crashing), and signing out via `clear()` wipes the credentials.

<details>
<summary>Hint</summary>

Notice why `AUTH_TOKENS_KEY` uses underscores (`app_auth_tokens_v1`) while `PREFERENCES_KEY` uses colons (`app:user_preferences:v1`): `expo-secure-store` restricts keys to alphanumeric characters, `.`, `-`, and `_`. Always guard `if (raw === null) return null;` before calling `JSON.parse(raw)`.

</details>

---

## Exercise 3 (Challenge): Generic Type-Safe `readJson<T>` Helper

### Requirements

- Implement `readJson<T>(key, guard, fallback)` backed by `AsyncStorage.getItem(key)`.
- Return `fallback` if `raw === null`, if `JSON.parse(raw)` throws a `SyntaxError`, or if `guard(parsed)` returns `false`.
- Refactor `preferencesStorage.load()` to delegate to `readJson`.

### Acceptance Criteria

- [ ] `readJson<T>` compiles cleanly under TypeScript strict mode with zero `any` and zero unsafe type assertions.
- [ ] Passing any custom type guard `(value: unknown) => value is T` infers the return type `Promise<T>` automatically.
- [ ] `preferencesStorage.load()` calls `readJson(PREFERENCES_KEY, isUserPreferences, DEFAULT_PREFERENCES)`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero warnings or errors.

### Expected Behavior

Any non-sensitive feature module (recent searches, feature flags, draft filters) can call `readJson(key, isMyType, defaultValue)` and be guaranteed either a schema-valid `T` or the safe `fallback` without ever crashing on stale app data.

<details>
<summary>Hint</summary>

Annotate `const parsed: unknown = JSON.parse(raw);` so ESLint and TypeScript treat the JSON result as untrusted until `guard(parsed)` narrows it to `T`:

```ts
return guard(parsed) ? parsed : fallback;
```

</details>

---

## Reference Solution

<details>
<summary>Click to view solution link (only after trying!)</summary>

Compare your implementation with [`../solutions/StorageHelperSolution.ts`](../solutions/StorageHelperSolution.ts).

</details>
