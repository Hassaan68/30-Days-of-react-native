# Day 25: Notifications and Background Tasks

## Learning Objectives
By the end of Day 25, you will be able to:
- Distinguish **Local Notifications** from **Remote Push Notifications** (APNs, FCM, and the Expo Push Service) and know when a **development build** is required.
- Configure `expo-notifications` cleanly in Expo SDK 58 (including the updated foreground notification default and `setNotificationHandler`).
- Request notification permissions responsibly, register **Android Notification Channels**, schedule local reminders (`TIME_INTERVAL` and `DATE` triggers), and cancel pending notifications.
- Handle notification taps and safe internal deep linking for both warm-start and cold-start launches.
- Monitor React Native's `AppState` lifecycle (`active`, `inactive`, `background`) safely in React Native 0.88 to pause work, flush drafts, and refresh stale data.
- Explain how mobile background tasks (`expo-background-task` / `expo-task-manager`) work and why iOS and Android aggressively restrict background execution to protect battery life.

## Prerequisites
- Completion of [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md), [Day 13: Device Features](../day-13-device-features/README.md), and [Day 23: Security](../day-23-security/README.md).
- Familiarity with async/await, TypeScript discriminated unions, and `useEffect` cleanup functions.

## Why This Concept Matters
Unlike a desktop browser tab that often sits open for hours, mobile users bounce in and out of apps dozens of times a day—locking their screen, answering phone calls, and switching between apps every few seconds. Knowing how to schedule timely local reminders, route notification taps cleanly (even from a cold launch), react to `AppState` transitions, and work *with* iOS/Android background battery rules instead of fighting them is what makes a mobile app feel reliable and native.

## Introduction
Mobile apps rarely live in isolation while open on screen. Users expect timely reminders when a task is due, instant alerts when a teammate mentions them, and fresh data waiting the moment they reopen the app — all without draining their battery overnight.

Today you will learn the three pillars of out-of-foreground mobile behavior:
1. **Local & Remote Notifications** via `expo-notifications`.
2. **App Lifecycle transitions** via React Native's `AppState`.
3. **OS-managed Background Tasks** and the real-world battery constraints enforced by iOS and Android.

## Concepts

### 1. Local Notifications vs. Remote Push Notifications

| Feature | Local Notifications | Remote Push Notifications |
| --- | --- | --- |
| **Origin** | Scheduled directly on the device by your app | Sent by your backend server through **APNs** (iOS) or **FCM** (Android) |
| **Internet needed to deliver?** | No (works offline) | Yes (requires network connectivity) |
| **Common use cases** | Task reminders, timers, medication alerts, habit check-ins | Chat messages, order status updates, security alerts, social mentions |
| **Works in Expo Go / Simulator?** | Yes (great for testing local scheduling) | **Requires an Expo development build on a real physical device** |

**How Remote Push works end-to-end:**
1. Your app requests notification permission and calls `Notifications.getExpoPushTokenAsync({ projectId })` (or native device push token) on a **physical device running a development or production build** — Expo Go does not support remote push notifications.
2. Your app sends that push token to **your backend** over HTTPS and stores it against the user's account.
3. When an event happens (e.g., a new message), your backend sends the payload to the **Expo Push Service** (or directly to **Apple Push Notification service (APNs)** for iOS and **Firebase Cloud Messaging (FCM)** for Android).
4. APNs/FCM wakes the device's OS notification tray and delivers the alert.

### 2. Setting Up `expo-notifications` (Expo SDK 58 Behavior)
Install and configure `expo-notifications` in `app.json` (adding the `"expo-notifications"` config plugin for custom icon/color/sounds in development builds).

> **Expo SDK 58 Important Change:** Starting in Expo SDK 58, **foreground notifications are displayed by default** (banner + list + sound) even if you haven't called `setNotificationHandler` yet. Call `Notifications.setNotificationHandler(...)` only when you want to **customize or suppress** foreground presentation (for example, hiding a chat banner when the user is already viewing that conversation).

```ts
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as Record<string, unknown> | undefined;
    const isSilent = data?.silentInForeground === true;

    return {
      shouldShowBanner: !isSilent,
      shouldShowList: true,
      shouldPlaySound: !isSilent,
      shouldSetBadge: false,
    };
  },
});
```

Notice the modern `NotificationBehavior` flags (`shouldShowBanner` and `shouldShowList`), which replace the deprecated `shouldShowAlert` boolean.

### 3. Requesting Permissions Responsibly
Never blast the OS notification permission dialog on the very first millisecond of app launch — users deny unexpected prompts reflexively, and once denied on iOS, the OS **will not show the prompt again** (`canAskAgain: false`). Instead:
1. Ask **in context** (e.g., when the user taps *"Remind me about this task"*).
2. Check `Notifications.getPermissionsAsync()` first.
3. Only call `Notifications.requestPermissionsAsync()` if `status !== 'granted'`.
4. If the user previously denied permission (`canAskAgain === false`), offer a calm inline message with a button to open system settings (`Linking.openSettings()`).

### 4. Android Notification Channels
Since Android 8.0 (API 26), every Android notification must belong to a **Notification Channel** created via `Notifications.setNotificationChannelAsync(channelId, config)`. Channels let Android users mute promotional updates while keeping high-priority task reminders loud.
- Always create channels **before** scheduling notifications or registering for push tokens.
- Pass `channelId` inside the `trigger` object when scheduling local notifications.
- `AndroidImportance.HIGH` or `MAX` shows heads-up banners; `DEFAULT` or `LOW` delivers quietly to the tray.

### 5. Scheduling Local Reminders & Handling Taps
`expo-notifications` supports explicit typed triggers via `Notifications.SchedulableTriggerInputTypes`:
- **`TIME_INTERVAL`** — fires after `seconds` (for repeating notifications on iOS, `seconds` must be `>= 60`).
- **`DATE`** — fires once at an exact JavaScript `Date` or timestamp.
- **`DAILY` / `WEEKLY` / `CALENDAR`** — fires on repeating calendar schedules.

**Handling notification taps (Warm Start & Cold Start):**
- **App running or backgrounded:** Subscribe with `Notifications.addNotificationResponseReceivedListener(response => ...)` inside a root `useEffect` and clean up with `subscription.remove()`.
- **App terminated (cold start):** On mount, await `Notifications.getLastNotificationResponseAsync()` to see if the user launched the app by tapping a notification.
- **Security reminder (from Day 23):** Always validate any `route` string in `notification.request.content.data` (ensure it starts with `'/'` and not `'//'`) before passing it to `router.push(...)`.

### 6. App Lifecycle (`AppState`) — Web `visibilitychange` vs. React Native `AppState`

> **Web `visibilitychange` vs. React Native `AppState`:** On the web, `document.addEventListener('visibilitychange', ...)` only distinguishes two states (`visible` and `hidden`). Mobile operating systems have a richer lifecycle:
>
> | Web (`document.visibilityState`) | React Native (`AppState`) | When It Happens on Mobile |
> | --- | --- | --- |
> | `'visible'` | `'active'` | App is in the foreground and receiving user touch input |
> | *(no equivalent)* | `'inactive'` *(iOS primarily)* | Transitional state when opening the app switcher, pulling down Control Center/Notification Center, or receiving a phone call (great moment to mask sensitive screens!) |
> | `'hidden'` | `'background'` | App is minimized; the OS will soon suspend JS timers (`setInterval`/`setTimeout`) |
> | *(none)* | `'unknown'` / `'extension'` / `null` | App is initializing before native state is ready, or running inside an iOS app extension |

> **Critical React Native 0.88 TypeScript Note (`AppState.currentState`):** In React Native 0.88, `AppState.currentState` is typed as **`string | null | undefined`** because it can be `null` briefly before native initialization completes. **Do not** pass `AppState.currentState` directly into `useState<AppStateStatus>(AppState.currentState)` or blindly cast it with `as AppStateStatus`! Instead, narrow it safely with a helper like `parseAppStateStatus` in [`examples/AppStateMonitor.tsx`](./examples/AppStateMonitor.tsx):
>
> ```ts
> function parseAppStateStatus(state: string | null | undefined): AppStateStatus | null {
>   if (
>     state === 'active' ||
>     state === 'background' ||
>     state === 'inactive' ||
>     state === 'extension' ||
>     state === 'unknown'
>   ) {
>     return state;
>   }
>   return null;
> }
> ```

Common production patterns using `AppState.addEventListener('change', ...)`:
- **Entering `background` (or `inactive` for privacy):** Save unsaved form drafts, pause video/audio playback, close real-time WebSocket heartbeats, and mask sensitive banking screens.
- **Returning to `active`:** Measure how long the user was away; if > 60 seconds, re-fetch stale queries or re-verify biometric lock.

### 7. Background Task Concepts & OS Battery Constraints
Both iOS (`BGTaskScheduler`) and Android (`WorkManager`) tightly restrict background code execution to preserve battery and thermal performance. You **cannot** guarantee an exact *"run my JavaScript every 60 seconds in the background"* loop on modern mobile operating systems!

When you genuinely need periodic offline sync or cache refresh, Expo provides:
- **`expo-task-manager`** — registers named top-level JavaScript tasks outside the React component tree (`TaskManager.defineTask(...)`) so the OS can wake a headless JS runtime when the UI isn't mounted.
- **`expo-background-task`** — schedules deferrable background work via native `BGTaskScheduler` (iOS) and `WorkManager` (Android) with a minimum interval (typically ≥ 15 minutes), executing opportunistically when the device is awake, has network, and isn't in Low Power / Doze mode.

> **Important:** Background tasks require a **development build** (or production build) on a real device to test reliably, and should always finish quickly (well under 30 seconds) with small memory footprints. For time-critical alerts, use **local notifications** or **remote push notifications** rather than polling in the background.

## Code Examples

> **How to run & preview today's examples:**
> - **Interactive screen preview (this repository):** Run `npm start` from the repository root to open the shared Expo launcher and preview `AppStateMonitor` directly on iOS Simulator, Android Emulator, or Expo Go—then minimize and reopen the app to watch live `AppState` transitions and away-duration measurements!
> - **Reusable notification service:** Import `notificationService.ts` into any screen or root `_layout.tsx` to schedule local alerts and handle notification taps.

### Example 1: Local Notification & Tap-Routing Service
- **Type:** Reusable service module (`configureNotificationHandling`, `setupAndroidNotificationChannels`, `ensureNotificationPermission`, `scheduleLocalNotification`, `cancelScheduledNotification`, `subscribeToNotificationTaps`, `getInitialNotificationRoute`)
- **File:** [`examples/notificationService.ts`](./examples/notificationService.ts)
- **Where to place in an Expo project:** `src/services/notifications/notificationService.ts`
- **What it demonstrates:** Expo SDK 58 foreground handler customization, Android channel setup, permission checks, `TIME_INTERVAL` scheduling, safe internal route extraction, warm-start tap subscription, and cold-start `getLastNotificationResponseAsync()`.

### Example 2: Safe RN 0.88 `AppState` Hook & Interactive Lifecycle Monitor Screen
- **Type:** Runnable interactive screen (`AppStateMonitor`) + reusable lifecycle hook (`useAppLifecycle`)
- **File:** [`examples/AppStateMonitor.tsx`](./examples/AppStateMonitor.tsx)
- **Where to place in an Expo project:** Split or place at `src/hooks/useAppLifecycle.ts` and `src/screens/AppStateMonitor.tsx` (or import `AppStateMonitor` directly into an Expo Router route)
- **Preview immediately:** Run `npm start` in this repo's shared Expo launcher and open Day 25's `AppStateMonitor` screen.
- **What it demonstrates:** Safely narrows RN 0.88's `AppState.currentState` (`string | null | undefined`) via `parseAppStateStatus`, tracks `active` / `inactive` / `background` transitions without stale closures, and measures away duration when returning to the foreground.

## Step-by-Step Explanation
Let's walk through the key patterns in `notificationService.ts` and `AppStateMonitor.tsx`:
1. **Selective foreground suppression (`configureNotificationHandling`):** Because Expo SDK 58 shows foreground notifications by default, our handler inspects `content.data.silentInForeground` and suppresses the banner/sound only when explicitly requested, keeping all other alerts visible.
2. **Android-safe channel setup (`setupAndroidNotificationChannels`):** Guarding with `if (Platform.OS !== 'android') return;` makes the function safe to call unconditionally during app bootstrap on both platforms.
3. **Validating notification deep links (`extractSafeInternalRoute`):** Notification payloads are treated as untrusted input — `extractSafeInternalRoute` checks that `data.route` is a string starting with `/` (and not protocol-relative `//`) before passing it to navigation.
4. **Safe `AppState.currentState` narrowing in RN 0.88 (`parseAppStateStatus`):** Because `AppState.currentState` is typed as `string | null | undefined` in React Native 0.88, `useAppLifecycle` runs it through `parseAppStateStatus(...)` to produce a strictly typed `AppStateStatus | null` initial value without unsafe type assertions.
5. **Preventing stale closures in `useAppLifecycle` (`AppStateMonitor.tsx`):** Storing `callbacks` in `callbacksRef` lets the `AppState.addEventListener` effect subscribe **once** on mount while always invoking the latest `onForeground` / `onBackground` handlers.

## Expected Output

### 1. On Screen (`AppStateMonitor.tsx`)
When you launch `AppStateMonitor` via `npm start`, send the app to the background for ~5 seconds, and return:

```text
┌─────────────────────────────────────────┐
│ App Lifecycle Monitor                   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CURRENT APPSTATE                    │ │
│ │ [ ACTIVE ]                          │ │
│ │ Last time in background: 5.2s       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Recent Transitions                  │ │
│ │ inactive → active          10:42:18 │ │  (on iOS; Android goes
│ │ background → inactive      10:42:17 │ │   background → active)
│ │ inactive → background      10:42:12 │ │
│ │ active → inactive          10:42:11 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Local Notification Scheduling (`notificationService.ts`)
Calling `scheduleLocalNotification({ title: 'Stand up & stretch', body: 'Take a 2-minute break', delaySeconds: 5, route: '/tasks/42' })` triggers an OS notification banner after 5 seconds (even while the app is foregrounded under Expo SDK 58 defaults). Tapping the notification invokes `subscribeToNotificationTaps` with `'/tasks/42'`.

## Common Mistakes
- **Assuming `AppState.currentState` is always a non-null `AppStateStatus` in RN 0.88:** In React Native 0.88, `AppState.currentState` is `string | null | undefined` and can be `null` before native initialization. **Fix:** Narrow safely with a helper like `parseAppStateStatus` (see `examples/AppStateMonitor.tsx`).
- **Testing remote push notifications in Expo Go or on an iOS Simulator:** Remote push requires a physical device and an Expo development build with valid APNs/FCM credentials. Local notifications, however, can be tested right away.
- **Using deprecated `shouldShowAlert` in `setNotificationHandler`:** **Fix:** Use `shouldShowBanner` and `shouldShowList` instead.
- **Forgetting Android Notification Channels:** Without a configured `HIGH`-importance channel, Android notifications may fail to show heads-up banners or play custom sounds. **Fix:** Call `setNotificationChannelAsync` before scheduling.
- **Scheduling duplicate reminders every time a task is edited:** **Fix:** Cancel previous pending notifications matching the same `reminderId` before scheduling an updated reminder.
- **Relying on `setInterval` while the app is in `background`:** Both iOS and Android suspend JS timers once backgrounded. **Fix:** Persist target timestamps (`Date.now()`) and compute elapsed time on `AppState` resume instead.

## Best Practices
- **Request notification permissions at a moment of clear user value**, never blindly on cold start.
- **Store a domain `reminderId` inside `content.data`** so you can cancel or replace specific reminders without tracking OS-generated UUIDs separately.
- **Always handle both warm-start (`addNotificationResponseReceivedListener`) and cold-start (`getLastNotificationResponseAsync`)** notification taps at your root navigation layout.
- **Design background sync to be idempotent and fast**, expecting the OS to delay or skip runs under Low Power / Doze mode.

## Exercises
Work through the guided exercises in [`./exercises/README.md`](./exercises/README.md) using the starter file [`./exercises/ReminderSchedulerExercise.ts`](./exercises/ReminderSchedulerExercise.ts):
- **Beginner:** Implement `validateReminderInput` to verify non-empty fields, a valid future `Date` at least 5 seconds ahead, and safe internal `route` paths.
- **Intermediate:** Implement `scheduleReminder` with permission checks, Android channel creation, and a `SchedulableTriggerInputTypes.DATE` trigger.
- **Challenge:** Implement `cancelRemindersById` using `getAllScheduledNotificationsAsync()` and call it inside `scheduleReminder` so editing a reminder automatically deduplicates pending OS alerts.

## Solutions
Complete all three functions in [`./exercises/ReminderSchedulerExercise.ts`](./exercises/ReminderSchedulerExercise.ts) and verify them with `npm run typecheck` and `npm run lint` before peeking at the reference solution.

<details>
<summary>Click to view solution notes & links</summary>

Review the full, strictly typed solution in [`./solutions/ReminderSchedulerSolution.ts`](./solutions/ReminderSchedulerSolution.ts):
- `validateReminderInput` catches empty strings, invalid `Date` values (`Number.isNaN`), dates less than 5 seconds in the future, and unsafe routes (anything not starting with `'/'` or starting with `'//'`) cleanly before touching native APIs.
- `scheduleReminder` checks/requests permissions, ensures the Android notification channel exists, deduplicates via `cancelRemindersById(input.id)`, schedules a `SchedulableTriggerInputTypes.DATE` notification, and returns a strict `ScheduleReminderResult` discriminated union.
- `listPendingReminderIds` shows how to inspect the OS notification queue for debugging or UI badges.

</details>

## Mini Project
**Task Reminder & Smart Resume Upgrade**
Enhance your Task Manager from [Day 21](../day-21-task-manager/README.md) with local reminders and lifecycle awareness:
1. Add an optional **"Remind me in 1 minute / 1 hour / tomorrow"** picker to your task creation form using `scheduleReminder` from `./solutions/ReminderSchedulerSolution.ts`.
2. When a task is marked completed or deleted, automatically call `cancelRemindersById(task.id)` so completed tasks never trigger stale alerts.
3. Wire `subscribeToNotificationTaps` and `getInitialNotificationRoute` in your root Expo Router `_layout.tsx` to navigate directly to `/tasks/[id]` when the user taps a reminder.
4. Integrate `useAppLifecycle` so returning to the app after > 60 seconds refreshes your task list and overdue badges.

## Key Takeaways
- **Local notifications** work offline and are ideal for reminders; **remote push notifications** route through APNs/FCM/Expo Push Service and require a **development build** on a physical device.
- In **Expo SDK 58**, foreground notifications display by default; use `setNotificationHandler` (`shouldShowBanner`, `shouldShowList`) when customizing or suppressing them.
- In **React Native 0.88**, `AppState.currentState` is typed as `string | null | undefined` — always narrow it safely (e.g., via `parseAppStateStatus`) before treating it as `AppStateStatus`.
- Always configure **Android Notification Channels**, validate deep-link routes inside notification payloads, and deduplicate reminders by domain ID.
- Respect iOS and Android OS battery budgets when designing background tasks.

## Further Reading
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Background Task Documentation](https://docs.expo.dev/versions/latest/sdk/background-task/)
- [Expo Task Manager Documentation](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [React Native `AppState` API Reference](https://reactnative.dev/docs/appstate)

## Progress Checklist
- [ ] Understood the difference between local notifications and remote push (APNs/FCM/Expo Push)
- [ ] Reviewed SDK 58 foreground notification behavior, Android Notification Channels, and RN 0.88's `AppState.currentState` narrowing
- [ ] Inspected `examples/notificationService.ts` and previewed `examples/AppStateMonitor.tsx` via `npm start`
- [ ] Completed Beginner, Intermediate, and Challenge tasks in `./exercises/ReminderSchedulerExercise.ts`
- [ ] Compared my code with `./solutions/ReminderSchedulerSolution.ts`

## Next Day
Continue to [Day 26: Backend and Realtime](../day-26-backend-and-realtime/README.md) to connect your React Native app to real backends, WebSockets, and live data synchronization.
