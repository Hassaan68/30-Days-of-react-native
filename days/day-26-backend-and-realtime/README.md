# Day 26: Backend Integration and Real-Time Features

## Learning Objectives

By the end of Day 26, you will be able to:

- Architect a typed REST API client with timeouts, retries, and structured error mapping.
- Build a resilient WebSocket client in React Native with connection lifecycle tracking, heartbeat pings, and exponential backoff reconnection.
- Handle mobile-specific networking realities such as Wi-Fi-to-cellular handoffs and `AppState` foreground/background transitions.
- Merge real-time server events cleanly into client state without duplicates or race conditions.
- Upload images and files using React Native's multipart `FormData` pattern with client-side validation.
- Evaluate modern mobile backend options (custom Node/Fastify APIs, Supabase, Firebase, and Expo Router API routes) and design mobile-friendly API contracts.

## Prerequisites

- [Day 11: API Integration](../day-11-api-integration/README.md)
- [Day 12: Authentication](../day-12-authentication/README.md)
- [Day 17: Local Storage and Offline](../day-17-local-storage-and-offline/README.md)
- [Day 25: Notifications and Background Tasks](../day-25-notifications-and-background-tasks/README.md)

## Why This Concept Matters

On a desktop browser, network connections are usually stable and users rarely suspend the tab mid-upload. On a phone, users walk through elevators, switch from Wi-Fi to 5G, lock their screens mid-session, and snap multi-megabyte photos on cellular data. If your networking layer assumes every `fetch` succeeds quickly or that WebSockets stay open forever, users will experience frozen loading spinners, missed chat messages, and failed uploads. Building a resilient REST, WebSocket, and upload layer is what separates a fragile prototype from a dependable mobile app.

## Introduction

Real mobile apps rarely talk to a single static endpoint on a fast fiber connection. Users expect chat threads, collaborative checklists, and live delivery trackers to update instantaneously without pulling to refresh—and to recover quietly the moment signal returns.

Today you will level up from basic `fetch` calls to production backend integration. You will build a fault-tolerant REST client, manage persistent WebSocket connections that survive network drops, handle multipart media uploads safely, and learn how to choose and design a backend that respects mobile constraints like battery life and flaky networks.

## Concepts

### 1. Web vs. Mobile Real-Time & Uploads

If you come from React web development, several networking details behave differently on iOS and Android:

| Concern | React Web (Browser) | React Native (iOS & Android) |
| --- | --- | --- |
| **WebSocket drops** | Tabs stay on mostly stable broadband/Wi-Fi | Sockets drop whenever the OS suspends a backgrounded app or switches Wi-Fi → 5G. Exponential backoff reconnection and `AppState`-aware reconnects are mandatory. |
| **App lifecycle (`AppState`)** | `visibilitychange` / `online` events | Subscribe to `AppState.addEventListener('change', ...)` to pause/resume sockets cleanly. In React Native 0.88, `AppState.currentState` is typed as `string \| null \| undefined`, so always narrow it safely before treating it as an `AppStateStatus`. |
| **File uploads (`FormData`)** | Appends browser `File` or `Blob` objects | Appends a local `{ uri, name, type }` file descriptor (such as a `file://` URI from `expo-image-picker`) directly—streaming from disk without loading huge files into JS RAM as base64. |
| **Idle TCP connections** | Often survive longer on home routers | Mobile carriers drop idle NAT mappings after 30–60 seconds, making periodic heartbeat `ping`/`pong` frames essential. |

### 2. Typed REST Client Architecture

A single ad-hoc `fetch()` call works for a prototype, but production apps need a centralized transport layer so every feature gets consistent behavior:

- **Typed Contracts**: Share request and response TypeScript interfaces (or validate responses with Zod) so breaking backend changes surface at compile time or right at the network boundary.
- **Timeouts via `AbortController`**: Mobile radios can hang silently when switching cell towers. Always enforce a request timeout so loading spinners never spin forever.
- **Structured `ApiError` Mapping**: Convert raw HTTP statuses and network failures into a single typed `ApiError` class with a `code` (e.g., `TIMEOUT`, `OFFLINE`, `UNAUTHORIZED`, `RATE_LIMITED`) and a `retryable` boolean.
- **Selective Retries**: Retry `429` (rate limit), `5xx` (server error), and timeouts using exponential backoff. Never automatically retry `400`/`422` validation errors or `401` auth failures without refreshing tokens first.

### 3. WebSockets in React Native

React Native ships with a built-in global `WebSocket` implementation powered by native networking stacks (`NSURLSessionWebSocketTask` on iOS and OkHttp on Android). Unlike HTTP request/response cycles, a WebSocket holds open a full-duplex TCP connection where the server can push JSON events at any moment.

Key lifecycle patterns for mobile WebSockets:

1. **Explicit Connection States**: Track `'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed'` so your UI can render a subtle "Reconnecting..." banner instead of silently dropping messages.
2. **Exponential Backoff with Jitter**: If your backend restarts, 50,000 phones reconnecting at the exact same second will cause a "thundering herd" outage. Multiply the delay (`1s → 2s → 4s → 8s`, capped at `30s`) and add small random jitter.
3. **Heartbeat (`ping` / `pong`)**: Mobile carriers aggressively close idle TCP sockets after 30–60 seconds. Sending a tiny periodic `ping` keeps NAT mappings alive and helps detect dead connections.
4. **App Lifecycle Awareness**: Close or pause sockets cleanly when a user signs out, and verify socket health (or reconnect if dropped while suspended) when the app returns to `'active'` via `AppState`.

### 4. Real-Time State Merging

Real-time updates frequently arrive out of order or duplicate items you already fetched via REST. Instead of blindly appending `[...prev, incoming]`:

- Key records in a `Map<string, T>` by stable `id`.
- Only overwrite an existing record if `incoming.updatedAt >= existing.updatedAt`.
- Sort deterministically by timestamp (`createdAt` or `sentAt`) so the UI never flickers.

### 5. Multipart File Uploads (`FormData`)

Uploading an image captured from `expo-image-picker` or `expo-camera` uses React Native's `FormData` object:

- Append a `{ uri, name, type }` descriptor pointing to the local `file://` URI rather than loading the entire binary file into JavaScript memory as a base64 string (which spikes RAM usage and inflates payload size by ~33%).
- **Do not** manually set the `Content-Type: multipart/form-data` header; React Native must generate the header itself so it includes the multipart boundary token.
- Validate MIME type and file size on the device before starting the upload to save user bandwidth and provide instant feedback.

### 6. Backend Architecture Options for Mobile Apps

| Option | Best For | Trade-offs |
| --- | --- | --- |
| **Node.js (Fastify / Express / NestJS)** | Full control over domain logic, custom WebSockets, existing SQL/NoSQL infrastructure | You own hosting, scaling, auth, and database migrations |
| **Supabase (PostgreSQL + Realtime + Storage)** | Rapid MVPs and relational apps needing auth, Row-Level Security, and DB change streams | Vendor conventions; complex server workflows may still need Edge Functions |
| **Firebase (Firestore + Cloud Functions)** | Offline-first document sync, instant push integration, Google ecosystem | NoSQL data modeling constraints and usage-based billing surprises at scale |
| **Expo Router API Routes (`+api.ts`)** | Lightweight BFF (Backend-for-Frontend) endpoints, webhooks, hiding third-party API keys | Runs as serverless HTTP handlers; not intended for long-lived stateful WebSocket hubs |

### 7. Mobile-Friendly API Design

- **Cursor Pagination**: Prefer cursor-based pagination (`?cursor=abc&limit=20`) over offset pagination (`?page=4`) so newly inserted items never cause duplicate rows while scrolling.
- **Sparse Payloads**: Return only fields the mobile screen needs. Large nested blobs waste cellular data and slow JSON parsing on budget Android devices.
- **Explicit API Versioning**: Prefix routes (`/v1/habits`) or pass a client version header (`X-App-Version: 1.4.0`). Remember that mobile users can stay on older app store binaries for months—never make breaking field removals without versioning.

## Code Examples

> **How to use today's examples**: Both files below are **reusable TypeScript service modules** (not standalone screens). In an Expo project, place them in `src/services/` and import them inside your screens, TanStack Query hooks, or Jest unit tests. To preview interactive UI screens in this repository, run `npm start` from the repo root.

### Example 1: Typed REST Client & Resilient WebSocket Client

- **Type**: Reusable helper module
- **Where to place in an Expo project**: `src/services/realtimeClient.ts`
- **Full source**: [`./examples/realtimeClient.ts`](./examples/realtimeClient.ts)

Key highlights:
- `ApiError` and `mapHttpStatusToApiError()` normalize every HTTP status into a consistent domain error.
- `apiRequest<T>()` enforces timeouts with `AbortController` and retries only retryable errors.
- `RealtimeClient<TMessage>` manages socket lifecycle, heartbeats, backoff reconnection, and dependency-injected socket factories for easy unit testing.
- `mergeRealtimeFeedItems()` merges incoming WebSocket payloads into existing feed state without duplicates.

### Example 2: Validated Multipart Upload Service

- **Type**: Reusable helper module
- **Where to place in an Expo project**: `src/services/uploadService.ts`
- **Full source**: [`./examples/uploadService.ts`](./examples/uploadService.ts)

Key highlights:
- `validateMediaAsset()` enforces MIME allowlists and maximum file size before any network call.
- `sanitizeFileName()` strips unsafe characters from user-supplied filenames.
- `uploadMediaFile()` constructs a React Native `FormData` payload from a local `file://` URI without overriding the multipart boundary header.
- `uploadMediaBatch()` uploads multiple files sequentially and reports progress percentages to the UI.

## Step-by-Step Explanation

1. **Normalize errors at the edge**: In `realtimeClient.ts`, `apiRequest` wraps every failure—whether a `503` response, an `AbortController` timeout, or a dropped radio—into an `ApiError`. Screens can then inspect `error.code` to display a clear message or redirect to login on `UNAUTHORIZED`.
2. **Inject the WebSocket factory**: `RealtimeClient` accepts an optional `socketFactory`. In production it defaults to React Native's global `new WebSocket(url)`; in Jest tests you pass a lightweight fake socket to simulate disconnects, heartbeats, and reconnect delays deterministically.
3. **Clean up every timer**: Both `heartbeatTimer` and `reconnectTimer` are stored as `ReturnType<typeof setInterval> | null` / `ReturnType<typeof setTimeout> | null` and cleared on `disconnect()` or before starting a new connection. This prevents memory leaks and duplicate ghost connections.
4. **Keep `FormData` headers clean**: In `uploadService.ts`, we set `Accept` and `Authorization`, deliberately omitting `Content-Type` so React Native's native networking layer calculates the exact `multipart/form-data; boundary=...` header.

## Expected Output

Because today's examples are reusable service modules, you verify them through TypeScript checks (`npm run typecheck`), Jest tests, or by wiring them into a screen. When integrated into a live status screen or test harness, here is what you will observe:

```text
[RealtimeClient] status: idle -> connecting -> open
[RealtimeClient] heartbeat sent: {"type":"ping","sentAt":1763935200000}
[RealtimeClient] network dropped (code 1006) -> status: reconnecting (attempt 1 in ~1120ms)
[RealtimeClient] status: open -> merged 1 incoming item (0 duplicates)

[uploadMediaBatch] progress: 50% (1/2) — avatar_photo.jpg
[uploadMediaBatch] progress: 100% (2/2) — receipt_02.png
[validateMediaAsset] rejected oversized file -> { valid: false, reason: "File exceeds the 5.0 MB size limit." }
```

## Common Mistakes

- **Setting `Content-Type: multipart/form-data` manually**: Without the generated `boundary=...` parameter, servers reject the request with `400 Bad Request` or parse an empty file body. **Fix**: Omit `Content-Type` and pass `FormData` directly as `body`.
- **Forgetting to close WebSockets on unmount or sign-out**: Leaked sockets keep consuming battery, trigger state updates on unmounted components, and can leak private messages after a user switches accounts. **Fix**: Call `client.disconnect()` inside your `useEffect` cleanup and sign-out handler.
- **Retrying non-idempotent mutations blindly**: Retrying a `POST /payments` request on a timeout without an `Idempotency-Key` header can charge a user twice. **Fix**: Only auto-retry `GET` requests or endpoints protected by idempotency keys.
- **Reconnecting infinitely on `401` / `1008` auth failures**: If a token is expired or revoked, reconnecting in a loop hammers your server. **Fix**: Inspect the close code, stop reconnecting, and refresh credentials first.
- **Uploading raw 12 MP camera photos unvalidated**: Large unresized images stall on 3G/4G networks. **Fix**: Validate size/MIME type first and compress images when capturing.

## Best Practices

- **Use `AbortController` everywhere**: Cancel in-flight requests when screens unmount or when a user types a new search query.
- **Pair WebSockets with `AppState`**: Re-check socket health when the app transitions from `'background'` back to `'active'` (safely narrowing `AppState.currentState`), and disconnect cleanly on sign-out.
- **Combine REST + WebSockets cleanly**: Fetch the initial snapshot via REST (cached with TanStack Query), then apply incremental WebSocket events to the cache or invalidate targeted query keys.
- **Add jitter to every retry/backoff timer**: Even 15–20% random jitter dramatically smooths traffic spikes after server deployments.
- **Keep API contracts versioned**: Treat every released mobile build as a long-lived client and maintain backward-compatible response fields.
- **Use presigned URLs for very large media**: For videos or large files, ask your API for a short-lived S3/R2/GCS presigned upload URL so binary traffic bypasses your application server entirely.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for full requirements, acceptance criteria, and hints, then complete [`./exercises/ReconnectBackoffExercise.ts`](./exercises/ReconnectBackoffExercise.ts):

- **Beginner**: Implement `calculateBackoffDelay()` with exponential growth, a `maxDelayMs` cap, and deterministic jitter.
- **Intermediate**: Implement `shouldRetryConnection()` to stop reconnecting on normal closures (`1000`), policy violations (`1008`), unauthorized closes (`4001`), or exceeded `maxAttempts`.
- **Challenge**: Implement `mergeChatMessages()` to deduplicate incoming real-time messages, preserve the latest `updatedAt` revision, and sort chronologically by `sentAt`.

## Solutions

Try completing all three functions in [`./exercises/ReconnectBackoffExercise.ts`](./exercises/ReconnectBackoffExercise.ts) and running `npm run typecheck` before opening the solution notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your work against the complete reference implementation in [`./solutions/ReconnectBackoffSolution.ts`](./solutions/ReconnectBackoffSolution.ts):

- `calculateBackoffDelay` clamps invalid attempts to `1`, clamps `randomFactor` to `[0, 1]`, calculates `baseDelayMs * 2^(attempt - 1)`, caps at `maxDelayMs`, and adds rounded jitter.
- `shouldRetryConnection` checks `attempt >= maxAttempts` first and consults a `Set` of non-retryable WebSocket close codes (`1000`, `1008`, `4001`).
- `mergeChatMessages` indexes existing and incoming messages inside a `Map`, compares ISO timestamps (`updatedAt`) to avoid overwriting newer edits with stale events, and returns a new array sorted ascending by `sentAt`.

</details>

## Mini Project

**Live Team Status Board**

Build a small screen that combines today's patterns:
1. Fetch an initial list of team status updates using `apiRequest<LiveFeedItem[]>()`.
2. Connect a `RealtimeClient` to a local or echo WebSocket server, listen to `AppState` changes, and render a live connection badge (`Connected`, `Reconnecting…`, `Offline`).
3. Merge incoming events using `mergeRealtimeFeedItems()`.
4. Add an "Attach Photo" button that validates a selected asset with `validateMediaAsset()` and uploads it via `uploadMediaFile()`.

## Key Takeaways

- Centralize timeouts, retries, and `ApiError` mapping in a single typed client module.
- Mobile WebSockets must handle flaky networks and app backgrounding with explicit status states, heartbeats, `AppState` awareness, and jittered exponential backoff.
- Merge real-time events idempotently by `id` and `updatedAt` so out-of-order deliveries never corrupt UI state.
- Validate files locally and pass `{ uri, name, type }` to `FormData`—letting React Native generate the multipart boundary header automatically.

## Further Reading

- [React Native Networking Guide](https://reactnative.dev/docs/network)
- [React Native `AppState` Documentation](https://reactnative.dev/docs/appstate)
- [MDN WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Expo Router API Routes Documentation](https://docs.expo.dev/router/web/api-routes/)
- [TanStack Query Official Documentation](https://tanstack.com/query/latest)

## Progress Checklist

- [ ] Built and reviewed `ApiError` mapping and `AbortController` timeouts in `realtimeClient.ts`
- [ ] Understood WebSocket lifecycle states, `AppState` transitions, heartbeat pings, and exponential backoff with jitter
- [ ] Practiced multipart `FormData` file validation and uploads in `uploadService.ts`
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `ReconnectBackoffExercise.ts`
- [ ] Verified solutions against `ReconnectBackoffSolution.ts`

## Next Day

Continue to [Day 27: CI/CD and App Deployment](../day-27-cicd-and-deployment/README.md).
