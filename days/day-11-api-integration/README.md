# Day 11: API Integration

## Learning Objectives

By the end of Day 11, you will be able to:

- Perform typed HTTP requests with React Native's built-in **`fetch`** API and cancel stale or timed-out requests using **`AbortController`**.
- Configure a reusable **Axios** instance with request and response **interceptors** for auth headers and consistent error normalization.
- Normalize unknown network, HTTP, and cancellation errors into a single typed `ApiError` class.
- Handle every real-world mobile UI state cleanly: **loading**, **empty**, **error (with retry)**, and **pull-to-refresh**.
- Manage server state with **TanStack Query v5** (`QueryClientProvider`, `useQuery`, `useMutation`, `useInfiniteQuery`), structured query keys, caching (`staleTime`, `gcTime`), cache invalidation, pagination, and optimistic updates with rollback.

## Prerequisites

- Completed [Day 10: State Management](../day-10-state-management/README.md).
- Comfortable with `async`/`await`, Promises, `FlatList`, and TypeScript generics.

## Introduction

Connecting a mobile app to a backend API is about far more than calling `fetch()` inside a `useEffect`. Mobile networks fluctuate between 5G, flaky Wi-Fi, elevators, and airplane mode. Users switch tabs mid-request, pull down to refresh, scroll through paginated feeds, and expect likes or new posts to appear instantaneously.

Writing manual `useEffect` + `isLoading` + `error` boilerplate in every screen leads to race conditions, duplicate network calls, and stale data. Today you will pair a clean, typed HTTP layer (`fetch` + `AbortController` and Axios interceptors) with **TanStack Query v5**—the industry standard for caching, synchronizing, and updating server state in React Native.

## Concepts

### 1. Built-in `fetch` with `AbortController` & Typed Responses

React Native ships with the standard Fetch API and `AbortController`. Unlike Axios, `fetch` **does not throw** on HTTP error statuses like `404` or `500`—it only rejects on network failures or aborts. Always check `response.ok`:

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(url, { signal: controller.signal });
  if (!response.ok) {
    throw new ApiError(`HTTP ${response.status}`, { status: response.status, ... });
  }
  return (await response.json()) as T;
} finally {
  clearTimeout(timeoutId);
}
```

Passing an `AbortSignal` lets TanStack Query (or a component unmount) cancel in-flight requests automatically so stale responses never overwrite fresh data.

### 2. Axios Instance & Interceptors

For larger apps, an **Axios instance** (`axios.create(...)`) centralizes `baseURL`, `timeout`, default headers, and **interceptors**:

- **Request Interceptor**: Reads the latest auth token (from a decoupled token provider) and sets `Authorization: Bearer <token>` automatically on every outgoing request.
- **Response Interceptor**: Converts Axios errors, timeouts, network dropouts, and backend error messages into your single `ApiError` type so every screen receives consistent, user-friendly `error.message` strings.

### 3. Proper Error Normalization

Catching `error: unknown` (never `any`) and routing it through a `normalizeApiError(error)` helper protects your UI from crashing on unexpected shapes:

- Is it already an `ApiError`? Return it as-is.
- Is it an `AxiosError`? Inspect `axios.isCancel(error)`, `!error.response` (network offline), and `error.response?.data` (safely checked via a type guard for `.message`).
- Is it a native `AbortError`? Flag `isCanceled: true`.
- Anything else? Return a safe fallback message.

### 4. The Four Mandatory Async UI States

Every data-driven mobile screen should explicitly design for all four states:

1. **Initial Loading (`isPending`)**: Full-screen spinner or skeleton placeholder when no cached data exists yet.
2. **Error (`isError`)**: Friendly explanation (`error.message`) + a **Retry** button calling `refetch()`.
3. **Empty (`items.length === 0`)**: Helpful empty state (`ListEmptyComponent`) so users don't stare at a blank screen.
4. **Background Refresh (`isRefetching`)**: Native `RefreshControl` on `FlatList` so users can pull to refresh without hiding already-rendered content.

### 5. TanStack Query v5 Essentials

**TanStack Query v5** treats remote API data as a **cache** keyed by serializable arrays:

- **`QueryClientProvider`**: Create one `QueryClient` at your app root (`app/_layout.tsx`) to share the cache across screens.
- **Query Key Factories**: Keep keys consistent and easy to invalidate:
  ```ts
  export const postKeys = {
    all: ['posts'] as const,
    infinite: (limit: number) => [...postKeys.all, 'infinite', limit] as const,
  };
  ```
- **`staleTime` vs `gcTime`** (note: `gcTime` replaced `cacheTime` in v5!):
  - **`staleTime`** (default `0`): How long cached data is considered *fresh* (no background refetch on mount). Setting `staleTime: 60_000` avoids hammering your API when users jump back and forth between tabs.
  - **`gcTime`** (default `5 * 60_000` / 5 minutes): How long *unused* cached data stays in memory before garbage collection.
- **Pagination (`useInfiniteQuery`)**: Requires `initialPageParam` and `getNextPageParam(lastPage)` in v5, giving you `hasNextPage`, `isFetchingNextPage`, and `fetchNextPage()` out of the box.
- **Mutations, Invalidation & Optimistic Updates (`useMutation`)**:
  - `onMutate`: Cancel outgoing queries, snapshot `previousData`, and optimistically update the cache so the UI responds in 0ms.
  - `onError`: Roll back to `context.previousData` if the request fails.
  - `onSettled`: Call `queryClient.invalidateQueries({ queryKey })` so client cache re-syncs with server truth.

## Code Examples

Review both strictly typed examples for this day:

1. **[examples/apiClient.ts](./examples/apiClient.ts)** — Custom `ApiError`, `normalizeApiError`, typed `fetchJson<T>` with `AbortController` timeout, Axios instance with auth/error interceptors, and paginated post helpers.
2. **[examples/PostsFeedScreen.tsx](./examples/PostsFeedScreen.tsx)** — Full TanStack Query v5 feed with `useInfiniteQuery`, `RefreshControl`, Load More footer, loading/error/empty states, and optimistic post creation with rollback.

## Step-by-Step Explanation

1. **Decouple authentication from the HTTP client**: `setAuthTokenProvider` in `apiClient.ts` lets your auth module (Day 12) supply tokens dynamically without creating circular imports between your API client and auth store.
2. **Forward TanStack Query's `signal` into your fetcher**: Inside `queryFn: ({ pageParam, signal }) => fetchPostsPage(pageParam, PAGE_SIZE, signal)`, forwarding `signal` ensures rapid navigation or query cancellation actually aborts the underlying HTTP request.
3. **Flatten infinite pages with `useMemo`**: `data?.pages.flatMap((page) => page.items) ?? []` turns paginated chunks into a single array for `FlatList`.
4. **Distinguish pull-to-refresh from load-more spinners**: Passing `refreshing={isRefetching && !isFetchingNextPage}` to `RefreshControl` prevents the top spinner from activating while the user is loading the next page at the bottom of the list.
5. **Guard indexed page access under `noUncheckedIndexedAccess`**: Before updating `current.pages[0]` during an optimistic update, check `const firstPage = current.pages[0]; if (!firstPage) return current;` so TypeScript strict mode stays happy and runtime crashes are impossible.

## Common Mistakes

- **Fetching Inside `useEffect` Without Cleanup/Cancellation**: Rapidly switching screens or typing in a search box can cause an older, slower request to resolve *after* a newer one and overwrite your UI with stale data. Use TanStack Query (or `AbortController` cleanup).
- **Forgetting to Check `response.ok` With `fetch`**: A `404 Not Found` or `500 Internal Server Error` resolves the `fetch()` Promise normally! Always inspect `response.ok` before calling `response.json()`.
- **Using Deprecated `cacheTime` or Missing `initialPageParam` in TanStack Query v5**: In v5, `cacheTime` was renamed to `gcTime`, `isPending` replaces initial `isLoading` semantics, and `useInfiniteQuery` requires `initialPageParam`.
- **Creating `new QueryClient()` Directly in Render Without `useState`**: Writing `const queryClient = new QueryClient()` inside a component body wipes the entire cache on every re-render! Always initialize it once outside the component or inside `useState(() => new QueryClient())`.
- **Swallowing Errors in `catch` Blocks**: Never catch an error and return `[]` silently; let TanStack Query receive the rejected Promise so `isError`, retries, and your Retry UI actually work.

## Best Practices

- **Centralize Query Keys in Factory Objects**: Prevents subtle typos between `useQuery` and `invalidateQueries`.
- **Keep API Functions Pure and Framework-Agnostic**: Put `fetchPostsPage` and `createPost` in `apiClient.ts` so they can be reused across screens and tested independently.
- **Set Sensible `staleTime` Values**: Most mobile screens benefit from `staleTime: 30_000`–`60_000` to eliminate redundant refetches when switching tabs.
- **Always Cancel In-Flight Queries Before Optimistic Updates**: Calling `await queryClient.cancelQueries(...)` inside `onMutate` stops a concurrent background refetch from overwriting your optimistic state.
- **Type Every Catch Block as `error: unknown`**: Pair with `normalizeApiError(error)` so you never rely on unsafe `any` casts.

## Exercises

Head to [exercises/README.md](./exercises/README.md) and open [exercises/UsersQueryExercise.tsx](./exercises/UsersQueryExercise.tsx).

### Beginner
Implement `fetchUsers(signal?: AbortSignal)` against `https://jsonplaceholder.typicode.com/users` with `response.ok` validation, and configure `useQuery` with `queryKey: userKeys.all`, `staleTime: 30_000`, and `gcTime: 5 * 60_000`.

### Intermediate
Add complete **loading**, **error (with Retry button)**, and **empty** UI states, plus pull-to-refresh on `FlatList` using `RefreshControl`.

### Challenge
Add a client-side search `TextInput` filtering cached users by `name` or `email`, and build an optimistic `useMutation` to add a new user with `onMutate` snapshot/update, `onError` rollback, and `onSettled` cache invalidation.

## Solutions

Compare your implementation against the complete reference solution:

- **[solutions/UsersQuerySolution.tsx](./solutions/UsersQuerySolution.tsx)** — Full TanStack Query v5 directory screen with `fetch` + `AbortSignal`, all four UI states, pull-to-refresh, local cache search filtering, and optimistic user creation with rollback.

## Mini Project

**Paginated Tech News Reader**: Combine `apiClient.ts` and `PostsFeedScreen.tsx` patterns to build a two-screen news reader:

1. **Feed Screen**: Uses `useInfiniteQuery` to load articles 10 at a time with pull-to-refresh and a Load More footer.
2. **Article Detail Screen (`articles/[id].tsx`)**: Uses `useQuery({ queryKey: ['articles', id], ... })` with `initialData` seeded from the feed cache so tapping a card opens instantaneously while refreshing full details in the background.
3. **Offline Error Testing**: Toggle Airplane Mode in the simulator/device to verify your normalized error screen and Retry button recover smoothly once back online.

## Key Takeaways

- Always check `response.ok` with `fetch` and pass `AbortSignal` so stale or timed-out requests cancel cleanly.
- Axios instances with request/response interceptors keep auth headers and `ApiError` normalization in one place.
- TanStack Query v5 eliminates manual `useEffect` networking boilerplate while giving you caching (`staleTime`, `gcTime`), pagination (`useInfiniteQuery`), pull-to-refresh, and optimistic mutations (`useMutation`) out of the box.
- Designing loading, error, empty, and refreshing states upfront turns flaky mobile networking into a resilient user experience.

## Further Reading

- [TanStack Query v5 Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query v5 React Native Guide](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [Axios Documentation — Interceptors](https://axios-http.com/docs/interceptors)
- [React Native Networking Guide](https://reactnative.dev/docs/network)

## Progress Checklist

- [ ] Built a typed `fetch` wrapper with `AbortController` timeout and `response.ok` checking
- [ ] Configured an Axios instance with request and response interceptors and `ApiError` normalization
- [ ] Connected `QueryClientProvider` and `useQuery` with structured query keys, `staleTime`, and `gcTime`
- [ ] Implemented all four async UI states: loading, error + retry, empty, and pull-to-refresh
- [ ] Built paginated loading with `useInfiniteQuery` and optimistic updates with rollback via `useMutation`
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `exercises/UsersQueryExercise.tsx`

## Next Day

Continue to [Day 12: Authentication](../day-12-authentication/README.md) to build secure sign-in flows, protected Expo Router routes, token storage with `expo-secure-store`, and refresh-token rotation.
