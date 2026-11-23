# Day 11 Exercises: API Integration

Practice typed data fetching, request cancellation, caching, and optimistic mutations with `fetch` and **TanStack Query v5**.

## Starter File

Open [UsersQueryExercise.tsx](./UsersQueryExercise.tsx) and complete all `TODO` items.

## Tasks

1. **Beginner — Typed `fetchUsers` & `useQuery`**:
   - Complete `fetchUsers(signal?: AbortSignal)` to request `https://jsonplaceholder.typicode.com/users`, pass `{ signal }`, throw a descriptive `Error` when `!response.ok`, and return `User[]`.
   - Configure `useQuery` with `queryKey: userKeys.all`, `staleTime: 30_000`, and `gcTime: 5 * 60_000`.

2. **Intermediate — Complete UI States & Pull-to-Refresh**:
   - Render dedicated **loading** (`isPending`), **error** (`isError` with a Retry `Pressable` calling `refetch()`), and **empty** states.
   - Add a `RefreshControl` to the `FlatList` bound to `isRefetching` and `refetch()`.

3. **Challenge — Client Search Filter & Optimistic Mutation**:
   - Add a search `TextInput` that filters the cached users by `name` or `email` without firing redundant network calls.
   - Implement a `useMutation` to add a new user optimistically into `userKeys.all` (`onMutate` snapshot + cache update, `onError` rollback, `onSettled` invalidation).

## Checking Your Work

Compare your completed component with [UsersQuerySolution.tsx](../solutions/UsersQuerySolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```
