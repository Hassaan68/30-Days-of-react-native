import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SAMPLE_INVITE_CODE = 'RN-DAY13-EXPO58';

export function DeviceToolkitScreen() {
  const [statusMessage, setStatusMessage] = useState<string>(
    'Tap any tool below to test native device APIs.',
  );
  const [clipboardPreview, setClipboardPreview] = useState<string>('');
  const [fileSharingAvailable, setFileSharingAvailable] = useState<boolean | null>(null);
  const [notifDeniedPermanently, setNotifDeniedPermanently] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function checkSharingSupport() {
      const available = await Sharing.isAvailableAsync();
      if (active) {
        setFileSharingAvailable(available);
      }
    }

    void checkSharingSupport();
    return () => {
      active = false;
    };
  }, []);

  const triggerHaptic = async (kind: 'light' | 'medium' | 'success' | 'selection') => {
    if (Platform.OS === 'web') {
      setStatusMessage('Haptics are only available on iOS and Android devices.');
      return;
    }

    switch (kind) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStatusMessage('Triggered Light impact haptic.');
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setStatusMessage('Triggered Medium impact haptic.');
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatusMessage('Triggered Success notification haptic.');
        break;
      case 'selection':
        await Haptics.selectionAsync();
        setStatusMessage('Triggered Selection haptic.');
        break;
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(SAMPLE_INVITE_CODE);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setStatusMessage(`Copied "${SAMPLE_INVITE_CODE}" to clipboard.`);
  };

  const handleReadClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setClipboardPreview(text || '(clipboard is empty)');
    setStatusMessage('Read current clipboard contents.');
  };

  const handleScheduleNotification = async () => {
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    let canAskAgain = existing.canAskAgain;

    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
      canAskAgain = requested.canAskAgain;
    }

    if (!granted) {
      setNotifDeniedPermanently(!canAskAgain);
      setStatusMessage(
        canAskAgain
          ? 'Notification permission was denied. You can try again anytime.'
          : 'Notifications are disabled in system settings.',
      );
      return;
    }

    setNotifDeniedPermanently(false);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Day 13 Reminder',
        body: 'Your local notification fired from expo-notifications!',
        data: { day: 13 },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStatusMessage('Scheduled a local notification for 3 seconds from now.');
  };

  const handleShareText = async () => {
    try {
      const result = await Share.share({
        title: '30 Days of React Native',
        message: `Join me on Day 13! Invite code: ${SAMPLE_INVITE_CODE}`,
      });
      if (result.action === Share.sharedAction) {
        setStatusMessage('Shared text via the native share sheet.');
      } else {
        setStatusMessage('Share sheet dismissed.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to open share sheet.';
      setStatusMessage(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Device Toolkit</Text>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{statusMessage}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Haptic Feedback</Text>
          <Text style={styles.cardSubtitle}>
            Subtle tactile responses make mobile interactions feel native and physical.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void triggerHaptic('light');
              }}
              style={({ pressed }) => [styles.chipButton, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>Light</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void triggerHaptic('medium');
              }}
              style={({ pressed }) => [styles.chipButton, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>Medium</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void triggerHaptic('success');
              }}
              style={({ pressed }) => [styles.chipButton, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>Success</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void triggerHaptic('selection');
              }}
              style={({ pressed }) => [styles.chipButton, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>Selection</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Clipboard</Text>
          <Text style={styles.cardSubtitle}>Invite Code: {SAMPLE_INVITE_CODE}</Text>
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void handleCopyCode();
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Copy Code</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void handleReadClipboard();
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Read Clipboard</Text>
            </Pressable>
          </View>
          {clipboardPreview !== '' && (
            <Text style={styles.previewText}>Clipboard value: {clipboardPreview}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Local Notifications</Text>
          <Text style={styles.cardSubtitle}>
            Requests permission cleanly and schedules a local alert 3 seconds from now.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleScheduleNotification();
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Schedule 3s Notification</Text>
          </Pressable>
          {notifDeniedPermanently && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Linking.openSettings();
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Open System Settings</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>4. Native Sharing</Text>
          <Text style={styles.cardSubtitle}>
            File sharing via expo-sharing:{' '}
            {fileSharingAvailable === null
              ? 'Checking...'
              : fileSharingAvailable
                ? 'Supported on this device'
                : 'Not available on this platform'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleShareText();
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Share Invite Text</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  banner: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 14,
  },
  bannerText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  previewText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.8,
  },
});
