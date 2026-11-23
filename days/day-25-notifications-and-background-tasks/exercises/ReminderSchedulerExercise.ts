import * as Notifications from 'expo-notifications';

export interface ReminderInput {
  /** Stable application-level reminder ID (e.g., "task-42"). */
  id: string;
  title: string;
  body: string;
  /** Future Date when the local reminder should fire. */
  scheduledFor: Date;
  /** Optional internal Expo Router path to open on tap (must start with "/"). */
  route?: string;
  /** Android notification channel ID (defaults to "reminders"). */
  channelId?: string;
}

export type ScheduleReminderResult =
  | { ok: true; notificationId: string; scheduledForIso: string }
  | { ok: false; reason: string };

export const DEFAULT_REMINDER_CHANNEL_ID = 'reminders';

/**
 * Day 25 Exercise Starter: Local Reminder Scheduler
 *
 * Complete the three functions below using `expo-notifications`, then compare
 * with `../solutions/ReminderSchedulerSolution.ts`.
 */

/**
 * TODO (Beginner):
 * Validate `ReminderInput` before requesting permissions or scheduling:
 * 1. `id`, `title`, and `body` must be non-empty after trimming.
 * 2. `scheduledFor` must be a valid `Date` (`!Number.isNaN(date.getTime())`)
 *    at least 5 seconds in the future relative to `nowMs`.
 * 3. If `route` is provided, it must start with `'/'` and NOT start with `'//'`.
 * Return an error message string if invalid, or `null` if valid.
 */
export function validateReminderInput(
  _input: ReminderInput,
  _nowMs: number = Date.now(),
): string | null {
  return 'Validation not implemented yet.';
}

/**
 * TODO (Intermediate):
 * 1. Validate `input` with `validateReminderInput(input)`. Return `{ ok: false, reason }` on error.
 * 2. Check notification permissions (`Notifications.getPermissionsAsync()` /
 *    `Notifications.requestPermissionsAsync()`). If not granted, return `{ ok: false, reason }`.
 * 3. On Android, ensure the channel exists via `Notifications.setNotificationChannelAsync(...)`.
 * 4. Schedule the notification using `Notifications.scheduleNotificationAsync(...)`
 *    with `trigger.type = Notifications.SchedulableTriggerInputTypes.DATE`,
 *    storing `reminderId: input.id` and `route: input.route` in `content.data`.
 */
export async function scheduleReminder(
  _input: ReminderInput,
): Promise<ScheduleReminderResult> {
  // Keep reference to Notifications active until you complete the TODO above.
  void Notifications;
  return { ok: false, reason: 'Not implemented yet.' };
}

/**
 * TODO (Challenge):
 * Find every pending notification returned by `Notifications.getAllScheduledNotificationsAsync()`
 * whose `content.data.reminderId === reminderId`, cancel each one via
 * `Notifications.cancelScheduledNotificationAsync(item.identifier)`, and return
 * the number of canceled notifications.
 */
export async function cancelRemindersById(_reminderId: string): Promise<number> {
  return 0;
}
