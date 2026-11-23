# Day 18 Exercises: Architecture and Folder Structure

Practice implementing the **Repository pattern** so a feature's business logic stays completely decoupled from its storage or network implementation.

## How to Practise

1. Open the starter file [`BookmarkRepositoryExercise.ts`](./BookmarkRepositoryExercise.ts). It defines the domain types (`Bookmark`, `CreateBookmarkInput`), the `BookmarkRepository` interface, a typed `DuplicateBookmarkError`, and a compilable `InMemoryBookmarkRepository` skeleton.
2. Complete each exercise directly in `BookmarkRepositoryExercise.ts` without modifying the exported interfaces.
3. Validate your TypeScript types and code style after each step:
   ```bash
   npm run typecheck
   npm run lint
   ```
4. Optionally write a small Jest test (run with `npm test`) or wire the repository into a feature hook and screen in the shared Expo workspace (`npm start`) to verify behavior interactively.

---

## Exercise 1 (Beginner): Basic CRUD Operations

### Requirements

- Implement `list()` so it returns shallow copies of all stored bookmarks (newest first) rather than exposing the internal `this.items` array directly.
- Implement `getById(id)` to locate a bookmark by `id` and return a copy, or `null` if not found.
- Implement `remove(id)` to delete the matching bookmark and return `true` if one was removed, or `false` if no bookmark had that `id`.

### Acceptance Criteria

- [ ] `list()` returns a new array of cloned `Bookmark` objects (mutating the returned array does not alter `this.items`).
- [ ] `getById(id)` returns the matching `Bookmark` copy when found and `null` otherwise.
- [ ] `remove(id)` deletes only the matching item and accurately returns `true` or `false`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

Calling `remove('missing-id')` returns `false` and leaves stored bookmarks untouched; calling `remove('bm-1')` deletes `'bm-1'`, returns `true`, and subsequent `getById('bm-1')` calls resolve to `null`.

<details>
<summary>Hint</summary>

Compare `this.items.length` before and after filtering in `remove(id)` to determine whether an item was actually removed, and write a tiny module-level `cloneBookmark(bookmark: Bookmark): Bookmark` helper you can reuse across every method.

</details>

---

## Exercise 2 (Intermediate): Validation & Duplicate URL Prevention

### Requirements

- Implement `create(input)` to:
  - Trim `title` and throw an `Error` if the trimmed title is empty.
  - Trim `url` (and strip trailing slashes if desired) and throw an `Error` if it does not start with `http://` or `https://` (case-insensitive).
  - Normalize `tags`: trim whitespace, convert to lowercase, remove empty strings, and remove duplicates while preserving order.
  - Throw `DuplicateBookmarkError` if a bookmark with the same URL (case-insensitive) already exists.
  - Generate a unique sequential ID (`bm-1`, `bm-2`, ...), prepend the new bookmark to `this.items` (newest first), and return a cloned copy.

### Acceptance Criteria

- [ ] Empty or whitespace-only titles throw an `Error`.
- [ ] Non-HTTP(S) URLs (such as `ftp://example.com` or `javascript:alert(1)`) throw an `Error`.
- [ ] Duplicate URLs differing only by casing or trailing slash throw `DuplicateBookmarkError`.
- [ ] Tags like `[' React ', 'react', '', 'EXPO']` are stored as `['react', 'expo']`.
- [ ] Newly created bookmarks appear first when calling `list()`.

### Expected Behavior

Creating `{ title: '  Expo Docs ', url: 'https://docs.expo.dev/', tags: ['Expo', ' expo ', 'RN'] }` stores a clean bookmark with normalized tags `['expo', 'rn']`; attempting to add `'HTTPS://DOCS.EXPO.DEV'` a second time rejects with `DuplicateBookmarkError`.

<details>
<summary>Hint</summary>

Use an incrementing private `sequence = 1` field instead of `this.items.length + 1` for IDs — otherwise deleting an item and creating a new one can produce duplicate IDs! For URL validation, `/^https?:\/\/.+/i.test(url)` cleanly enforces `http://` or `https://`.

</details>

---

## Exercise 3 (Challenge): Tag Search & Pure Immutability

### Requirements

- Implement `findByTag(tag)` so it trims and lowercases `tag`, returns `[]` if blank, and returns cloned bookmarks containing a case-insensitive tag match.
- Guarantee deep immutability across **every** method (`constructor`, `list`, `getById`, `findByTag`, `create`) by cloning the `tags` array (`tags: [...bookmark.tags]`) whenever bookmarks enter or leave the repository.

### Acceptance Criteria

- [ ] `findByTag('  REACT  ')` matches bookmarks tagged `'react'` and returns `[]` for empty/whitespace queries.
- [ ] Mutating a returned object's `tags` array (e.g., `(returned.tags as string[]).push('hack')`) never modifies internal repository state on subsequent `list()` or `getById()` calls.
- [ ] `npm run typecheck` and `npm run lint` pass with zero warnings or errors.

### Expected Behavior

External UI code or tests can freely sort, filter, or accidentally mutate returned arrays without ever corrupting the repository's stored records.

<details>
<summary>Hint</summary>

Centralize cloning in one helper:

```ts
function cloneBookmark(bookmark: Bookmark): Bookmark {
  return {
    ...bookmark,
    tags: [...bookmark.tags],
  };
}
```

Then pass every bookmark entering `constructor` or leaving `list`, `getById`, `findByTag`, and `create` through `cloneBookmark`.

</details>

---

## Reference Solution

<details>
<summary>Click to view solution link (only after trying!)</summary>

Compare your implementation with [`../solutions/BookmarkRepositorySolution.ts`](../solutions/BookmarkRepositorySolution.ts).

</details>
