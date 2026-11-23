# Day 17: Local Storage and Offline Apps

## Learning Objectives

By the end of Day 17, you will be able to:
- Choose the right local storage engine for every data type: `@react-native-async-storage/async-storage`, `expo-secure-store`, or `expo-sqlite`.
- Read and write structured relational data using the modern `expo-sqlite` async API in Expo SDK 58 (`openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`, `withTransactionAsync`).
- Store sensitive credentials securely in the OS Keychain (iOS) / Keystore (Android) with `expo-secure-store`.
- Design an **offline-first** workflow featuring optimistic UI updates, a durable FIFO mutation queue, idempotency keys, and conflict resolution strategies.
- Safely validate deserialized local JSON using TypeScript type guards instead of unsafe `as` casts.

## Prerequisites

- Completed [Day 16: Lists and Performance](../day-16-lists-and-performance/README.md).
- Familiar with async/await, Promises, REST APIs (Day 11), and authentication tokens (Day 12).

## Introduction

Mobile users do not live on gigabit fiber. They use your app in elevators, on subways, on flights, and across flaky cellular handoffs. If your app shows a blank spinner or loses a user's draft whenever the network blips, people will uninstall it.

**Offline-first** engineering flips the default mindset: the device's local database is the immediate source of truth for the UI, and the network is a synchronization channel. Today you will learn how to pick the right storage layer on iOS and Android, write clean SQLite migrations, and queue offline edits so they sync reliably when connectivity returns.

## Concepts

### 1. Comparing Mobile Storage Choices

Choosing the wrong storage tool causes security vulnerabilities or performance bottlenecks:

| Storage Library | Under the Hood | Best Used For | Avoid Using For |
| --- | --- | --- | --- |
| `@react-native-async-storage/async-storage` | Unencrypted key-value store (RocksDB/SQLite) | UI preferences, theme, onboarding flags, small caches, offline mutation queues | Passwords, JWTs, refresh tokens, large queryable datasets |
| `expo-secure-store` | iOS Keychain / Android EncryptedSharedPreferences (Keystore) | Access/refresh tokens, encryption keys, PIN hashes, small secrets (< 2 KB per value) | Large blobs, lists of notes, high-frequency writes |
| `expo-sqlite` | Embedded relational SQLite database | Notes, tasks, messages, search/filtering, joins, offline caches of hundreds or thousands of records | Unencrypted secrets (unless encrypted at column/app layer) |

### 2. Modern `expo-sqlite` API in Expo SDK 58

Modern `expo-sqlite` provides a clean, Promise-based async API (as well as synchronous counterparts like `openDatabaseSync` and `getAllSync` when needed):

- `SQLite.openDatabaseAsync('offline_notes.db')` opens or creates the local database file.
- `db.execAsync('PRAGMA journal_mode = WAL;')` enables Write-Ahead Logging for better concurrent read/write throughput.
- `PRAGMA user_version` tracks schema versions cleanly so you can run idempotent migrations inside `db.withTransactionAsync(...)`.
- Always use **parameterized placeholders (`?`)** with `runAsync`, `getAllAsync`, and `getFirstAsync` to prevent SQL injection and escaping bugs.

> **Expo SDK 58 Note:** Earlier SDK versions included an experimental libSQL remote sync method (`syncLibSQL()`). That libSQL integration was **removed in Expo SDK 58**. For remote synchronization in SDK 58+, pair standard local `expo-sqlite` with your own REST/GraphQL sync queue (like the pattern built today) or a dedicated sync engine.

### 3. Safe Local Deserialization with Type Guards

Local storage persists across app upgrades. A user upgrading from v1.0 to v2.0 might still have an older JSON shape saved on disk, or corrupted data after an unexpected crash.

Never blindly cast `JSON.parse(raw) as UserPreferences`. Instead, parse into `unknown` and run a lightweight TypeScript **type guard** (`value is UserPreferences`), returning a safe fallback when validation fails.

### 4. Offline-First Architecture Patterns

A resilient offline-first flow combines four building blocks:

1. **Optimistic UI**: Write the user's action to local storage and update React state immediately so the app feels instantaneous.
2. **Durable Mutation Queue**: Persist pending `CREATE` / `UPDATE` / `DELETE` operations in local storage (FIFO order) so they survive app restarts.
3. **Idempotency Keys**: Attach a unique `idempotencyKey` to every queued mutation. If a response is lost mid-flight and the client retries, the server recognizes the key and avoids creating duplicate records.
4. **Network Awareness & Conflict Resolution**:
   - Flush the queue on app launch, foreground resume, and when network reachability recovers.
   - Choose an explicit conflict strategy when both client and server modified the same record:
     - **Last-Write-Wins (LWW)**: Compare timestamps (`updatedAt`) — simple and effective for personal notes/preferences.
     - **Server-Wins**: Authoritative for inventory, billing, or shared permissions.
     - **Client-Wins / Field-Level Merge**: Useful for collaborative drafts or explicit user overrides.

## Code Examples

### Example 1: SQLite Notes Database with Migrations

See [`examples/notesDatabase.ts`](./examples/notesDatabase.ts) for the complete implementation.

```ts
const db = await SQLite.openDatabaseAsync('offline_notes.db');
await db.execAsync('PRAGMA journal_mode = WAL;');

const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
if ((versionRow?.user_version ?? 0) < 1) {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
    `);
    await db.execAsync('PRAGMA user_version = 1;');
  });
}
```

### Example 2: Durable Offline Mutation Queue & Conflict Resolver

See [`examples/offlineQueue.ts`](./examples/offlineQueue.ts) for the full queue + conflict resolver.

```ts
const queue = new OfflineMutationQueue();

await queue.enqueue({
  entity: 'note',
  operation: 'CREATE',
  payload: { localId: 1, title: 'Offline Draft', body: 'Written on airplane mode' },
});

const report = await queue.flush(
  async (mutation) => {
    await sendToBackend(mutation);
  },
  () => isDeviceOnline,
);
```

## Step-by-Step Explanation

1. **Lazy singleton database initialization**: `NotesDatabase` caches `this.dbPromise` so concurrent callers share a single initialized connection without running migrations twice.
2. **Row-to-domain mapping**: SQLite stores booleans as `0`/`1` integers (`synced: number`). `mapRowToNote` converts snake_case SQL rows into clean camelCase `NoteRecord` objects.
3. **Transactional batch updates**: `markNotesSynced` wraps multiple `UPDATE` statements inside `withTransactionAsync`, ensuring either all synced IDs commit together or none do.
4. **Resilient FIFO queue flushing**: `OfflineMutationQueue.flush` checks `isOnline()` before every item. If connectivity drops halfway through, remaining items stay safely persisted without burning retry attempts.
5. **Bounded retries**: Failed items increment `attempts` and record `lastError`, preventing a permanently broken payload from looping forever.

## Common Mistakes

- **Importing `AsyncStorage` from `react-native`**: It was removed from React Native core years ago. Always import from `@react-native-async-storage/async-storage`.
- **Storing JWTs or passwords in AsyncStorage**: AsyncStorage is unencrypted plaintext on disk. Always use `expo-secure-store` for secrets.
- **Using invalid characters in `expo-secure-store` keys**: Keys with colons (`app:token`) fail on some platforms; stick to alphanumeric characters, `.`, `-`, and `_` (e.g., `app_auth_tokens_v1`).
- **String-interpolating user input into SQL**: Writing `` `WHERE title LIKE '%${query}%'` `` causes SQL injection bugs and crashes on quotes (`O'Brien`). Always pass bind parameters (`[pattern]`).
- **Forgetting idempotency keys on retries**: Without idempotency keys, retrying a timed-out `POST /orders` request can charge or duplicate a user's action.

## Best Practices

- Enable `PRAGMA journal_mode = WAL;` on SQLite databases for faster writes and fewer lock errors.
- Version your storage keys (`app:user_preferences:v1`) and SQLite schemas (`PRAGMA user_version`) from day one.
- Keep `expo-secure-store` values small (tokens/secrets only); store larger user data in SQLite or AsyncStorage.
- Validate all data loaded from disk with runtime type guards or Zod schemas before trusting it in UI state.
- Surface clear sync status indicators in your UI ("Saved offline · Syncing…") so users trust that their work is safe.

## Exercises

Head to [`exercises/README.md`](./exercises/README.md) and open [`exercises/StorageHelperExercise.ts`](./exercises/StorageHelperExercise.ts):

1. **Beginner**: Implement `preferencesStorage` (`save`, `load`, `clear`) backed by `@react-native-async-storage/async-storage`.
2. **Intermediate**: Implement `secureTokenStorage` (`save`, `load`, `clear`) backed by `expo-secure-store` with safe JSON parsing and validation.
3. **Challenge**: Implement a generic `readJson<T>(key, guard, fallback)` helper with zero `any` casts and automatic fallback recovery.

## Solutions

Compare your work against the complete reference solution:

- [`solutions/StorageHelperSolution.ts`](./solutions/StorageHelperSolution.ts): Demonstrates clean separation between unencrypted AsyncStorage preferences and Keychain/Keystore-backed SecureStore tokens, complete with runtime type guards.

## Mini Project

Build an **Offline-Capable Field Notes Screen**:
- Persist notes in `NotesDatabase` (`expo-sqlite`) so they load instantly on cold launch.
- Show an "Unsynced" badge next to notes where `synced === false`.
- Enqueue `CREATE`/`UPDATE`/`DELETE` edits into `OfflineMutationQueue` and add a "Sync Now" button that simulates an API call (with an optional "Simulate Offline" toggle to test retry behavior).

## Key Takeaways

- Match each data category to the right storage engine: **AsyncStorage** for preferences, **SecureStore** for secrets, **SQLite** for structured/queryable offline data.
- Modern `expo-sqlite` (SDK 58+) offers clean async transactions and parameterized queries; remember `syncLibSQL()` is no longer part of Expo SDK 58.
- Never trust raw `JSON.parse` output from persistent storage without validating its shape.
- Offline-first apps combine optimistic local writes, a durable FIFO queue, idempotency keys, and an explicit conflict resolution strategy.

## Further Reading

- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Expo Local-First Architecture Guide](https://docs.expo.dev/guides/local-first/)

## Progress Checklist

- [ ] Compared AsyncStorage, SecureStore, and SQLite use cases
- [ ] Built a parameterized, migration-aware SQLite helper with `expo-sqlite`
- [ ] Implemented an offline FIFO mutation queue with idempotency keys and conflict resolution
- [ ] Completed `StorageHelperExercise.ts` with type guards and zero `any`
- [ ] Verified zero `tsc` and ESLint issues

## Next Day

Continue to [Day 18: Architecture and Folder Structure](../day-18-architecture-and-folder-structure/README.md) to organize growing React Native apps with feature-based folders, thin route files, and the Repository pattern.
