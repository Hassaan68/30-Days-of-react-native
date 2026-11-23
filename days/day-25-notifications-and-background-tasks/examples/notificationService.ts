import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const REMINDERS_CHANNEL_ID = 'reminders';
export const UPDATES_CHANNEL_ID = 'updates';

export interface NotificationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

export interface LocalNotificationPayload {
  title: string;
  body: string;
  /** Delay in seconds before delivering the local notification (minimum 1). */
  delaySeconds: number;
  /** Optional internal Expo Router path opened when the user taps the notification. */
  route?: string;
  /** Optional business identifier for canceling or deduplicating reminders. */
  reminderId?: string;
  /** Android notification channel ID (defaults to `REMINDERS_CHANNEL_ID`). */
  channelId?: string;
  /** If true, suppresses the banner while the app is open in the foreground. */
  silentInForeground?: boolean;
}

/**
 * Customizes foreground notification presentation.
 *
 * Note (Expo SDK 58+): Foreground notifications are displayed by default unless
 * explicitly overridden here. This handler demonstrates suppressing only those
 * notifications explicitly tagged with `silentInForeground: true`.
 */
export function configureNotificationHandling(): void {
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
}

/**
 * Registers Android notification channels so users can control importance,
 * sound, and vibration per category in Android system settings.
 * Safe to call on both platforms (no-op on iOS).
 */
export async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Task Reminders',
    description: 'Time-sensitive reminders you scheduled.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1D4ED8',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync(UPDATES_CHANNEL_ID, {
    name: 'General Updates',
    description: 'Low-priority status updates and summaries.',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/**
 * Checks current notification permissions and prompts the user only if needed.
 */
export async function ensureNotificationPermission(): Promise<NotificationPermissionResult> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') {
    return {
      granted: true,
      canAskAgain: existing.canAskAgain,
      status: existing.status,
    };
  }

  const requested = await Notifications.requestPermissionsAsync();
  return {
    granted: requested.status === 'granted',
    canAskAgain: requested.canAskAgain,
    status: requested.status,
  };
}

/**
 * Schedules a local notification after `delaySeconds` and returns its identifier.
 */
export async function scheduleLocalNotification(
  payload: LocalNotificationPayload,
): Promise<string> {
  const safeSeconds = Math.max(1, Math.round(payload.delaySeconds));
  const channelId = payload.channelId ?? REMINDERS_CHANNEL_ID;

  await setupAndroidNotificationChannels();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      sound: true,
      data: {
        route: payload.route,
        reminderId: payload.reminderId,
        silentInForeground: payload.silentInForeground ?? false,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: safeSeconds,
      repeats: false,
      channelId,
    },
  });
}

export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

function extractSafeInternalRoute(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const route = (data as Record<string, unknown>).route;
  if (typeof route !== 'string') {
    return null;
  }

  // Allow only internal relative Expo Router paths (e.g., "/tasks/42").
  const trimmed = route.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  return trimmed;
}

/**
 * Subscribes to notification taps while the app is running or backgrounded and
 * returns a cleanup function for `useEffect`.
 */
export function subscribeToNotificationTaps(onNavigate: (route: string) => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const route = extractSafeInternalRoute(response.notification.request.content.data);
    if (route) {
      onNavigate(route);
    }
  });

  return () => {
    subscription.remove();
  };
}

/**
 * Checks whether the app was cold-launched by tapping a notification.
 */
export async function getInitialNotificationRoute(): Promise<string | null> {
  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (!lastResponse) {
    return null;
  }

  return extractSafeInternalRoute(lastResponse.notification.request.content.data);
}
