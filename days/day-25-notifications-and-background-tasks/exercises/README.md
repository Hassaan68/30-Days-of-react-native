# Day 25 Exercises: Local Notifications & Reminder Scheduling

Open [`ReminderSchedulerExercise.ts`](./ReminderSchedulerExercise.ts) and complete the three tiers below.

## 1. Beginner — `validateReminderInput`
Before prompting the user for notification permissions or calling native scheduling APIs, validate the payload cleanly:
1. Ensure `id`, `title`, and `body` are non-empty after `.trim()`.
2. Reject invalid `Date` values (`Number.isNaN(date.getTime())`) and dates less than 5 seconds ahead of `nowMs`.
3. If `route` is provided, ensure it is an internal relative route starting with `'/'` and NOT starting with `'//'`.

## 2. Intermediate — `scheduleReminder`
1. Validate input using `validateReminderInput`.
2. Check/request permissions with `Notifications.getPermissionsAsync()` and `Notifications.requestPermissionsAsync()`.
3. On Android (`Platform.OS === 'android'`), register the notification channel with `Notifications.setNotificationChannelAsync`.
4. Schedule the notification using `Notifications.SchedulableTriggerInputTypes.DATE`, storing `reminderId` and `route` in `content.data`.

## 3. Challenge — `cancelRemindersById` & Deduplication
1. Implement `cancelRemindersById(reminderId)` by scanning `Notifications.getAllScheduledNotificationsAsync()`, canceling every matching notification via `cancelScheduledNotificationAsync`, and returning the number canceled.
2. Call `cancelRemindersById(input.id)` inside `scheduleReminder` before scheduling so rescheduling a task reminder never creates duplicate alerts.

## Reference Solution
Compare your work against [`../solutions/ReminderSchedulerSolution.ts`](../solutions/ReminderSchedulerSolution.ts).
