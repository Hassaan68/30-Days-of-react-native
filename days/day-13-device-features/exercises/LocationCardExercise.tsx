import type * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type LocationCardState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; position: Location.LocationObject }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

/**
 * Exercise Starter: Build a permission-aware LocationCard component.
 *
 * TODOs:
 * 1. Import `Location` as a value (`import * as Location from 'expo-location'`), plus
 *    `Linking`, `Platform`, `ActivityIndicator`, `Clipboard`, and `Haptics`.
 * 2. Implement `handleLocateMe` to request foreground location permissions and fetch
 *    the current position with `Location.Accuracy.Balanced`.
 * 3. Handle all 5 discriminated union states (`idle`, `loading`, `granted`, `denied`, `error`).
 * 4. When `status === 'denied'` and `!canAskAgain`, show an "Open Settings" button
 *    calling `Linking.openSettings()`.
 * 5. In the `granted` state, render latitude, longitude, accuracy, timestamp, and a
 *    "Copy Coordinates" button with haptic confirmation.
 */
export function LocationCardExercise() {
  const [state, setState] = useState<LocationCardState>({ status: 'idle' });

  const handleLocateMe = () => {
    // TODO: Request foreground permissions and fetch current location.
    setState({
      status: 'error',
      message: 'TODO: Implement location permission request and GPS lookup.',
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Location</Text>
      <Text style={styles.body}>
        We use your location only when you tap the button below to show your current coordinates.
      </Text>

      {state.status === 'error' && <Text style={styles.errorText}>{state.message}</Text>}

      <Pressable
        accessibilityRole="button"
        onPress={handleLocateMe}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Locate Me</Text>
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
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
