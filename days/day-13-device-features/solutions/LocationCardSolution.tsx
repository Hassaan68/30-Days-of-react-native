import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export type LocationCardState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; position: Location.LocationObject }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

export function LocationCardSolution() {
  const [state, setState] = useState<LocationCardState>({ status: 'idle' });
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleLocateMe = async () => {
    setCopiedNotice(false);
    setState({ status: 'loading' });

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState({ status: 'denied', canAskAgain: permission.canAskAgain });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({ status: 'granted', position });
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not read your location. Make sure location services are enabled.';
      setState({ status: 'error', message });
    }
  };

  const handleCopyCoordinates = async (latitude: number, longitude: number) => {
    const formatted = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    await Clipboard.setStringAsync(formatted);
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    setCopiedNotice(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Location</Text>
      <Text style={styles.body}>
        Your GPS coordinates are read only on demand and never stored or sent to a server.
      </Text>

      {state.status === 'loading' && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching GPS coordinates...</Text>
        </View>
      )}

      {state.status === 'granted' && (
        <View style={styles.coordsBox}>
          <Text style={styles.coordsPrimary}>
            {state.position.coords.latitude.toFixed(4)},{' '}
            {state.position.coords.longitude.toFixed(4)}
          </Text>
          <Text style={styles.coordsMeta}>
            Accuracy:{' '}
            {state.position.coords.accuracy !== null
              ? `±${Math.round(state.position.coords.accuracy)} m`
              : 'Unavailable'}{' '}
            • Updated {new Date(state.position.timestamp).toLocaleTimeString()}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleCopyCoordinates(
                state.position.coords.latitude,
                state.position.coords.longitude,
              );
            }}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>
              {copiedNotice ? 'Copied Coordinates!' : 'Copy Coordinates'}
            </Text>
          </Pressable>
        </View>
      )}

      {state.status === 'denied' && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            {state.canAskAgain
              ? 'Location permission was denied. Tap "Locate Me" again if you want to allow access.'
              : 'Location permission is permanently denied. Enable it in your device settings.'}
          </Text>
          {!state.canAskAgain && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Linking.openSettings();
              }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Open Settings</Text>
            </Pressable>
          )}
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{state.message}</Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={state.status === 'loading'}
        onPress={() => {
          void handleLocateMe();
        }}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
          state.status === 'loading' && styles.disabled,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {state.status === 'granted' ? 'Refresh Location' : 'Locate Me'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#334155',
  },
  coordsBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  coordsPrimary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14532D',
  },
  coordsMeta: {
    fontSize: 13,
    color: '#166534',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#92400E',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
