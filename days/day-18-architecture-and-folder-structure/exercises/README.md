# Day 18 Exercises: Architecture and Folder Structure

Practice implementing the **Repository pattern** so a feature's business logic stays completely decoupled from its storage or network implementation.

## Setup

Open [`BookmarkRepositoryExercise.ts`](./BookmarkRepositoryExercise.ts). It defines the domain types (`Bookmark`, `CreateBookmarkInput`), the `BookmarkRepository` interface, a typed `DuplicateBookmarkError`, and a compilable `InMemoryBookmarkRepository` skeleton.

## Tasks

### Exercise 1 (Beginner): Basic CRUD Operations
- Implement `list()` returning shallow copies of stored bookmarks (newest first) so external callers cannot mutate internal repository state.
- Implement `getById(id)` returning a shallow copy of the matching bookmark or `null`.
- Implement `remove(id)` returning `true` if a bookmark was deleted and `false` if not found.

### Exercise 2 (Intermediate): Validation & Duplicate URL Prevention
- Implement `create(input)`:
  - Trim `title` and `url`, and normalize tags (lowercase, trimmed, deduplicated, empty strings removed).
  - Throw an `Error` if `title` is empty or `url` does not start with `http://` or `https://`.
  - Throw `DuplicateBookmarkError` if a bookmark with the same normalized URL (case-insensitive) already exists.

### Exercise 3 (Challenge): Tag Search & Pure Immutability
- Implement `findByTag(tag)` performing a case-insensitive tag match and returning immutable copies.
- Ensure every returned `Bookmark` clones its `tags` array (`[...bookmark.tags]`) so mutating `result.tags.push('hack')` never corrupts the repository's internal data.

## Verification

Compare your implementation with [`../solutions/BookmarkRepositorySolution.ts`](../solutions/BookmarkRepositorySolution.ts) and run:

```bash
npm run typecheck
npm run lint
```
