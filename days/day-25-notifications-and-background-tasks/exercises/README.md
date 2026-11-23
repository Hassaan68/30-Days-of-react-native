# Day 25 Exercises: Local Notifications & Reminder Scheduling

## How to Practise

1. Open the starter module [`ReminderSchedulerExercise.ts`](./ReminderSchedulerExercise.ts) and review `ReminderInput`, `ScheduleReminderResult`, and `DEFAULT_REMINDER_CHANNEL_ID`.
2. Complete the three functions tier by tier (**Beginner → Intermediate → Challenge**).
3. Run static checks from the repository root after each tier:

```bash
npm run typecheck
npm run lint
```

4. Test `validateReminderInput` with a quick Jest unit test, and test `scheduleReminder` + `cancelRemindersById` on a simulator, emulator, or Expo Go via `npm start` (scheduling a reminder 10 seconds in the future to see the live notification banner!).

---

## 1. Beginner — `validateReminderInput(input, nowMs)`

Before prompting the user for notification permissions or calling native scheduling APIs, validate every field synchronously.

### Requirements

1. Ensure `input.id`, `input.title`, and `input.body` are each non-empty after `.trim()`.
2. Validate `input.scheduledFor`:
   - Reject invalid `Date` instances (`Number.isNaN(input.scheduledFor.getTime())`).
   - Reject timestamps earlier than `nowMs + 5_000` (must be at least 5 seconds in the future).
3. If `input.route !== undefined`, verify its trimmed value starts with `'/'` and does **not** start with `'//'` (blocking protocol-relative open redirects).
4. Return a descriptive error message `string` if any check fails, or `null` when valid.

### Acceptance Criteria

- [ ] Empty or whitespace-only `id`, `title`, or `body` returns a clear error string.
- [ ] `new Date('invalid')` and dates 2 seconds in the future are rejected.
- [ ] Routes like `'https://evil.example'` and `'//evil.example/path'` are rejected; `'/tasks/42'` passes.
- [ ] Passing a valid future reminder returns `null`.

### Expected Behavior

```ts
validateReminderInput(
  {
    id: 'task-42',
    title: 'Review PR',
    body: 'Check accessibility fixes',
    scheduledFor: new Date(Date.now() + 60_000),
    route: '/tasks/42',
  },
);
// => null
```

<details>
<summary>Hint</summary>

Accept `nowMs: number = Date.now()` as the second parameter so unit tests can pass a deterministic timestamp instead of depending on wall-clock time. Check `targetTime < nowMs + 5_000` after confirming `!Number.isNaN(targetTime)`.

</details>

---

## 2. Intermediate — `scheduleReminder(input)`

### Requirements

1. Call `validateReminderInput(input)`. If an error string is returned, return `{ ok: false, reason: validationError }` immediately without prompting for permissions.
2. Check existing notification permissions with `Notifications.getPermissionsAsync()`; if `status !== 'granted'`, call `Notifications.requestPermissionsAsync()`. If still not granted, return `{ ok: false, reason: 'Notification permission was not granted.' }`.
3. On Android (`Platform.OS === 'android'`), ensure the channel (`input.channelId?.trim() || DEFAULT_REMINDER_CHANNEL_ID`) is created with `Notifications.setNotificationChannelAsync(...)` using `Notifications.AndroidImportance.HIGH`.
4. Schedule the local notification with `Notifications.scheduleNotificationAsync(...)`:
   - `content`: trimmed `title`, trimmed `body`, `sound: true`, and `data: { reminderId: input.id.trim(), route: input.route?.trim() }`.
   - `trigger`: `{ type: Notifications.SchedulableTriggerInputTypes.DATE, date: input.scheduledFor, channelId }`.
5. Return `{ ok: true, notificationId, scheduledForIso: input.scheduledFor.toISOString() }`.

### Acceptance Criteria

- [ ] Invalid input returns `{ ok: false, reason }` without invoking any `expo-notifications` native call.
- [ ] Denied permission returns `{ ok: false, reason }` gracefully without throwing.
- [ ] On Android, the notification channel is created before `scheduleNotificationAsync` is called.
- [ ] Uses `Notifications.SchedulableTriggerInputTypes.DATE` (not legacy untyped trigger objects).

### Expected Behavior

Scheduling a valid reminder 10 seconds in the future returns `{ ok: true, notificationId: '...', scheduledForIso: '...' }` and delivers a heads-up notification banner after 10 seconds.

<details>
<summary>Hint</summary>

Import `{ Platform } from 'react-native'` and extract small private helpers (`ensurePermissionGranted()` and `ensureReminderChannel(channelId)`) just like [`../examples/notificationService.ts`](../examples/notificationService.ts) to keep `scheduleReminder` clean and easy to read.

</details>

---

## 3. Challenge — `cancelRemindersById(reminderId)` & Deduplication

Editing a task's due date shouldn't leave the old OS reminder behind to fire at the wrong time.

### Requirements

1. Implement `cancelRemindersById(reminderId)`:
   - Return `0` early if `reminderId.trim().length === 0`.
   - Fetch all pending notifications via `await Notifications.getAllScheduledNotificationsAsync()`.
   - For every pending request whose `request.content.data.reminderId === normalizedId`, cancel it with `await Notifications.cancelScheduledNotificationAsync(request.identifier)` and increment a counter.
   - Return the total number of canceled notifications.
2. Call `await cancelRemindersById(input.id)` inside `scheduleReminder` right before scheduling the new notification so rescheduling the same reminder ID automatically replaces any previous pending alert.

### Acceptance Criteria

- [ ] Canceling a `reminderId` with 2 queued notifications cancels both and returns `2` while leaving unrelated notifications untouched.
- [ ] Calling `cancelRemindersById('   ')` returns `0` without scanning native notifications.
- [ ] Calling `scheduleReminder` twice with the same `id` leaves only **one** pending notification in the OS queue.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior

Rescheduling `id: 'task-42'` from 3:00 PM to 4:00 PM automatically cancels the 3:00 PM notification and queues only the 4:00 PM reminder.

<details>
<summary>Hint</summary>

Safely narrow `request.content.data` with `const data = request.content.data as Record<string, unknown> | undefined;` and check `if (data?.reminderId === normalizedId)` inside a `for (const request of pending)` loop.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to view the reference solution link</summary>

Once you have implemented and verified your reminder scheduler, compare your work against [`../solutions/ReminderSchedulerSolution.ts`](../solutions/ReminderSchedulerSolution.ts).

</details>
