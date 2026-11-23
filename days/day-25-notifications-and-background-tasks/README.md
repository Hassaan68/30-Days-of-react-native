# Day 25: Notifications and Background Tasks

## Learning Objectives
By the end of Day 25, you will be able to:
- Distinguish **Local Notifications** from **Remote Push Notifications** (APNs, FCM, and the Expo Push Service) and know when a **development build** is required.
- Configure `expo-notifications` cleanly in Expo SDK 58 (including the updated foreground notification default and `setNotificationHandler`).
- Request notification permissions responsibly, register **Android Notification Channels**, schedule local reminders (`TIME_INTERVAL` and `DATE` triggers), and cancel pending notifications.
- Handle notification taps and safe internal deep linking for both warm-start and cold-start launches.
- Monitor React Native's `AppState` lifecycle (`active`, `inactive`, `background`) to pause work, flush drafts, and refresh stale data.
- Explain how mobile background tasks (`expo-background-task` / `expo-task-manager`) work and why iOS and Android aggressively restrict background execution to protect battery life.

## Prerequisites
- Completion of [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md), [Day 13: Device Features](../day-13-device-features/README.md), and [Day 23: Security](../day-23-security/README.md).
- Familiarity with async/await, TypeScript discriminated unions, and `useEffect` cleanup functions.

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

### 6. App Lifecycle (`AppState`)
React Native's `AppState` API reports whether your app is currently:
- **`active`** — running in the foreground and receiving user input.
- **`inactive`** *(iOS primarily)* — transitional state while switching apps, pulling down Control Center/Notification Center, or answering an incoming call.
- **`background`** — minimized; the OS may suspend JavaScript timers shortly after entering this state.

Common production patterns using `AppState.addEventListener('change', ...)`:
- **Entering `background`:** Save unsaved form drafts, pause video/audio playback, close real-time WebSocket heartbeats, and mask sensitive banking screens.
- **Returning to `active`:** Measure how long the user was away; if > 60 seconds, re-fetch stale queries or re-verify biometric lock.

### 7. Background Task Concepts & OS Battery Constraints
Both iOS (`BGTaskScheduler`) and Android (`WorkManager`) tightly restrict background code execution to preserve battery and thermal performance. You **cannot** guarantee an exact *"run my JavaScript every 60 seconds in the background"* loop on modern mobile operating systems!

When you genuinely need periodic offline sync or cache refresh, Expo provides:
- **`expo-task-manager`** — registers named top-level JavaScript tasks outside the React component tree (`TaskManager.defineTask(...)`) so the OS can wake a headless JS runtime when the UI isn't mounted.
- **`expo-background-task`** — schedules deferrable background work via native `BGTaskScheduler` (iOS) and `WorkManager` (Android) with a minimum interval (typically ≥ 15 minutes), executing opportunistically when the device is awake, has network, and isn't in Low Power / Doze mode.

> **Important:** Background tasks require a **development build** (or production build) on a real device to test reliably, and should always finish quickly (well under 30 seconds) with small memory footprints. For time-critical alerts, use **local notifications** or **remote push notifications** rather than polling in the background.

## Code Examples
Explore the complete, strictly typed examples in [`./examples/`](./examples/):
1. [`examples/notificationService.ts`](./examples/notificationService.ts) — Complete `expo-notifications` service demonstrating SDK 58 foreground handler customization, Android channel setup, permission checks, `TIME_INTERVAL` scheduling, safe internal route extraction, warm-start tap subscription, and cold-start `getLastNotificationResponseAsync()`.
2. [`examples/AppStateMonitor.tsx`](./examples/AppStateMonitor.tsx) — Reusable `useAppLifecycle` hook and `AppStateMonitor` screen tracking `active` / `inactive` / `background` transitions and measuring time spent away from the app.

## Step-by-Step Explanation
Let's walk through the key patterns in `notificationService.ts` and `AppStateMonitor.tsx`:
1. **Selective foreground suppression (`configureNotificationHandling`):** Because Expo SDK 58 shows foreground notifications by default, our handler inspects `content.data.silentInForeground` and suppresses the banner/sound only when explicitly requested, keeping all other alerts visible.
2. **Android-safe channel setup (`setupAndroidNotificationChannels`):** Guarding with `if (Platform.OS !== 'android') return;` makes the function safe to call unconditionally during app bootstrap on both platforms.
3. **Validating notification deep links (`extractSafeInternalRoute`):** Notification payloads are treated as untrusted input — `extractSafeInternalRoute` checks that `data.route` is a string starting with `/` (and not protocol-relative `//`) before passing it to navigation.
4. **Preventing stale closures in `useAppLifecycle` (`AppStateMonitor.tsx`):** Storing `callbacks` in `callbacksRef` lets the `AppState.addEventListener` effect subscribe **once** on mount while always invoking the latest `onForeground` / `onBackground` handlers.

## Common Mistakes
- **Testing remote push notifications in Expo Go or on an iOS Simulator:** Remote push requires a physical device and an Expo development build with valid APNs/FCM credentials. Local notifications, however, can be tested right away.
- **Using deprecated `shouldShowAlert` in `setNotificationHandler`:** Use `shouldShowBanner` and `shouldShowList` instead.
- **Forgetting Android Notification Channels:** Without a configured `HIGH`-importance channel, Android notifications may fail to show heads-up banners or play custom sounds.
- **Scheduling duplicate reminders every time a task is edited:** Always cancel previous pending notifications for the same `reminderId` before scheduling an updated reminder.
- **Relying on `setInterval` while the app is in `background`:** Both iOS and Android suspend JS timers once backgrounded. Persist target timestamps (`Date.now()`) and compute elapsed time on `AppState` resume instead.

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
Review the full, strictly typed solution in [`./solutions/ReminderSchedulerSolution.ts`](./solutions/ReminderSchedulerSolution.ts).
- `validateReminderInput` catches bad dates and unsafe routes cleanly before touching native APIs.
- `scheduleReminder` deduplicates via `cancelRemindersById(input.id)` before creating a fresh `DATE`-triggered notification and returns a strict `ScheduleReminderResult` discriminated union.
- `listPendingReminderIds` shows how to inspect the OS notification queue for debugging or UI badges.

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
- Always configure **Android Notification Channels**, validate deep-link routes inside notification payloads, and deduplicate reminders by domain ID.
- Use `AppState` to react cleanly to foreground/background transitions, and respect iOS/Android OS battery budgets when designing background tasks.

## Further Reading
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Background Task Documentation](https://docs.expo.dev/versions/latest/sdk/background-task/)
- [Expo Task Manager Documentation](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [React Native `AppState` API Reference](https://reactnative.dev/docs/appstate)

## Progress Checklist
- [ ] Understood the difference between local notifications and remote push (APNs/FCM/Expo Push)
- [ ] Reviewed SDK 58 foreground notification behavior and Android Notification Channels
- [ ] Inspected `examples/notificationService.ts` and `examples/AppStateMonitor.tsx`
- [ ] Completed Beginner, Intermediate, and Challenge tasks in `./exercises/ReminderSchedulerExercise.ts`
- [ ] Compared my code with `./solutions/ReminderSchedulerSolution.ts`

## Next Day
Continue to [Day 26: Backend and Realtime](../day-26-backend-and-realtime/README.md) to connect your React Native app to real backends, WebSockets, and live data synchronization.
