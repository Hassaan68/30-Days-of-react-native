# Day 11 Exercises: API Integration

Practice typed data fetching, request cancellation, caching, and optimistic mutations with `fetch` and **TanStack Query v5**.

## How to Practise

1. Open the starter file [`UsersQueryExercise.tsx`](./UsersQueryExercise.tsx) and work through the `TODO` comments in order (Beginner → Intermediate → Challenge).
2. Preview the screen in your Expo playground app (or via `npm start` in this repository's shared Expo launcher).
3. Run the verification checks from the repository root after each milestone:

```bash
npm run typecheck
npm run lint
```

---

## Beginner — Typed `fetchUsers` & `useQuery`

### Requirements
- Complete `fetchUsers(signal?: AbortSignal)` to request `https://jsonplaceholder.typicode.com/users` using `fetch`.
- Forward `{ signal }` and an `Accept: 'application/json'` header.
- Check `response.ok` and throw a descriptive `Error` (including the HTTP status) when the request fails.
- Configure `useQuery` with `queryKey: userKeys.all`, `queryFn: ({ signal }) => fetchUsers(signal)`, `staleTime: 30_000`, and `gcTime: 5 * 60_000`.

### Acceptance Criteria
- [ ] `fetchUsers` returns `Promise<User[]>` with zero `any` types.
- [ ] Non-2xx HTTP responses throw an `Error` instead of silently returning bad JSON.
- [ ] `useQuery` uses `staleTime: 30_000` and `gcTime: 5 * 60_000` (not the deprecated v4 `cacheTime`).
- [ ] TypeScript (`npm run typecheck`) and ESLint (`npm run lint`) pass cleanly.

### Expected Behavior
On mount, a centered loading spinner appears briefly, then the **Team Directory** `FlatList` renders 10 teammates fetched from JSONPlaceholder showing each user's name and email.

<details>
<summary>Hint</summary>

Remember that `fetch` only rejects on network failures or aborts—not `404` or `500` responses:

```ts
const response = await fetch('https://jsonplaceholder.typicode.com/users', {
  headers: { Accept: 'application/json' },
  signal,
});
if (!response.ok) {
  throw new Error(`Failed to fetch users (HTTP ${response.status})`);
}
return (await response.json()) as User[];
```

</details>

---

## Intermediate — Complete UI States & Pull-to-Refresh

### Requirements
- Destructure `error`, `isError`, `isRefetching`, and `refetch` from `useQuery`.
- Render a dedicated **error state** displaying `error.message` and a **Retry** `Pressable` that triggers `void refetch()`.
- Attach a `RefreshControl` to the `FlatList` bound to `refreshing={isRefetching}` and `onRefresh={() => void refetch()}`.
- Ensure `ListEmptyComponent` renders a helpful message when no users are available.

### Acceptance Criteria
- [ ] Toggling Airplane Mode (or temporarily pointing the URL to an invalid endpoint) displays the error screen with a working **Retry** button.
- [ ] Pulling down on the list shows the native refresh indicator without clearing existing cards.
- [ ] Tapping **Retry** after restoring connectivity loads the directory cleanly.

### Expected Behavior
Users never see a blank screen or silent failure: initial loads show a spinner, errors show a clear retry card, and pulling down refreshes the list in place.

<details>
<summary>Hint</summary>

Pass `refreshControl` directly as a prop on `FlatList`:

```tsx
refreshControl={
  <RefreshControl
    refreshing={isRefetching}
    onRefresh={() => void refetch()}
    tintColor="#2563EB"
  />
}
```

</details>

---

## Challenge — Client Search Filter & Optimistic Mutation

### Requirements
- Add a controlled `TextInput` above the `FlatList` that filters the cached users in memory (using `useMemo`) by case-insensitive `name` or `email` without firing extra network requests.
- Update `ListEmptyComponent` to distinguish between `"No users match ..."` and an empty directory.
- Add a `createUser` helper (`POST` to `https://jsonplaceholder.typicode.com/users`) and a `useMutation` hook triggered by a `+ Add User` button:
  - **`onMutate`**: Cancel in-flight queries for `userKeys.all`, snapshot `previousUsers`, prepend an optimistic `User`, and return `{ previousUsers }`.
  - **`onError`**: Restore `context.previousUsers` and display an error message banner.
  - **`onSuccess`**: Display a confirmation banner.
  - **`onSettled`**: Call `void queryClient.invalidateQueries({ queryKey: userKeys.all })`.

### Acceptance Criteria
- [ ] Typing in the search bar filters the list instantaneously with zero additional API calls.
- [ ] Tapping **`+ Add User`** prepends the new teammate immediately (0ms perceived latency) and disables the button while pending.
- [ ] Simulating a failed `POST` rolls back the optimistic entry and shows a feedback banner.
- [ ] `npm run typecheck` and `npm run lint` pass with zero warnings or errors.

### Expected Behavior
Searching filters cached cards smoothly as you type, and adding a teammate updates the list immediately with graceful rollback if the request fails.

<details>
<summary>Hint</summary>

Define a typed mutation context so `onError` knows the exact type of `previousUsers`:

```ts
interface AddUserMutationContext {
  previousUsers: User[] | undefined;
}

const addUserMutation = useMutation<User, Error, CreateUserInput, AddUserMutationContext>({
  mutationFn: createUser,
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: userKeys.all });
    const previousUsers = queryClient.getQueryData<User[]>(userKeys.all);
    queryClient.setQueryData<User[]>(userKeys.all, (current) => [optimisticUser, ...(current ?? [])]);
    return { previousUsers };
  },
  onError: (_err, _vars, context) => {
    if (context?.previousUsers) {
      queryClient.setQueryData(userKeys.all, context.previousUsers);
    }
  },
  onSettled: () => {
    void queryClient.invalidateQueries({ queryKey: userKeys.all });
  },
});
```

</details>

---

## Reference Solution

<details>
<summary>Only after trying — view reference solution</summary>

Compare your completed component against [`../solutions/UsersQuerySolution.tsx`](../solutions/UsersQuerySolution.tsx), then run:

```bash
npm run typecheck
npm run lint
```

</details>
