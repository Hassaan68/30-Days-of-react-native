import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
const MIN_LEAD_TIME_MS = 5_000;

/**
 * Validates a reminder payload before scheduling it with the OS.
 */
export function validateReminderInput(
  input: ReminderInput,
  nowMs: number = Date.now(),
): string | null {
  if (input.id.trim().length === 0) {
    return 'Reminder id is required.';
  }

  if (input.title.trim().length === 0) {
    return 'Reminder title is required.';
  }

  if (input.body.trim().length === 0) {
    return 'Reminder body is required.';
  }

  const targetTime = input.scheduledFor.getTime();
  if (Number.isNaN(targetTime)) {
    return 'Reminder scheduledFor must be a valid Date.';
  }

  if (targetTime < nowMs + MIN_LEAD_TIME_MS) {
    return 'Reminder must be scheduled at least 5 seconds in the future.';
  }

  if (input.route !== undefined) {
    const trimmedRoute = input.route.trim();
    if (!trimmedRoute.startsWith('/') || trimmedRoute.startsWith('//')) {
      return 'Reminder route must be an internal path starting with "/".';
    }
  }

  return null;
}

async function ensureReminderChannel(channelId: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(channelId, {
    name: 'Reminders',
    description: 'Scheduled task and event reminders.',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

async function ensurePermissionGranted(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

/**
 * Validates input, checks notification permissions, creates the Android channel,
 * cancels any existing duplicate notification for `input.id`, and schedules a
 * date-based local reminder.
 */
export async function scheduleReminder(input: ReminderInput): Promise<ScheduleReminderResult> {
  const validationError = validateReminderInput(input);
  if (validationError) {
    return { ok: false, reason: validationError };
  }

  const granted = await ensurePermissionGranted();
  if (!granted) {
    return { ok: false, reason: 'Notification permission was not granted.' };
  }

  const channelId = input.channelId?.trim() || DEFAULT_REMINDER_CHANNEL_ID;
  await ensureReminderChannel(channelId);

  // Deduplicate: replace any previously scheduled notification for the same reminder ID.
  await cancelRemindersById(input.id);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: input.title.trim(),
      body: input.body.trim(),
      sound: true,
      data: {
        reminderId: input.id.trim(),
        route: input.route?.trim(),
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.scheduledFor,
      channelId,
    },
  });

  return {
    ok: true,
    notificationId,
    scheduledForIso: input.scheduledFor.toISOString(),
  };
}

/**
 * Cancels all pending scheduled notifications tagged with a given `reminderId`
 * and returns the number of canceled notifications.
 */
export async function cancelRemindersById(reminderId: string): Promise<number> {
  const normalizedId = reminderId.trim();
  if (normalizedId.length === 0) {
    return 0;
  }

  const pending = await Notifications.getAllScheduledNotificationsAsync();
  let canceledCount = 0;

  for (const request of pending) {
    const data = request.content.data as Record<string, unknown> | undefined;
    if (data?.reminderId === normalizedId) {
      await Notifications.cancelScheduledNotificationAsync(request.identifier);
      canceledCount += 1;
    }
  }

  return canceledCount;
}

/**
 * Lists all pending scheduled reminder IDs currently queued with the OS.
 */
export async function listPendingReminderIds(): Promise<string[]> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const ids: string[] = [];

  for (const request of pending) {
    const data = request.content.data as Record<string, unknown> | undefined;
    if (typeof data?.reminderId === 'string') {
      ids.push(data.reminderId);
    }
  }

  return ids;
}
