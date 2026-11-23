# Day 13 Exercises: Device Permissions & Location Card

Build a permission-aware `LocationCard` component using `expo-location`, `expo-clipboard`, and `expo-haptics` in [`LocationCardExercise.tsx`](./LocationCardExercise.tsx).

## Tasks

### 1. Beginner — Request Foreground Permission & Read Coordinates
- When the user taps **"Locate Me"**, transition state to `{ status: 'loading' }`.
- Call `Location.requestForegroundPermissionsAsync()`.
- If granted, fetch the device position using `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })` and display latitude and longitude formatted to 4 decimal places.

### 2. Intermediate — Handle Denied & Permanently Denied Permissions
- When permission is denied (`!response.granted`), store `{ status: 'denied', canAskAgain: response.canAskAgain }`.
- If `canAskAgain` is `true`, show a clear explanation and let the user retry.
- If `canAskAgain` is `false`, render an **"Open Settings"** button that calls `Linking.openSettings()`.
- Catch unexpected GPS failures (for example, location services turned off) and transition to `{ status: 'error', message }`.

### 3. Challenge — Accuracy Metadata, Copy Coordinates & Haptics
- Display the reported horizontal accuracy in meters (e.g., `±18 m`) and the timestamp of the last fix.
- Add a **"Copy Coordinates"** button that copies `"<lat>, <lon>"` via `expo-clipboard` and triggers a `Success` haptic via `expo-haptics` (guarded for non-web platforms).

## Checking Your Work

Compare your completed component with [`../solutions/LocationCardSolution.tsx`](../solutions/LocationCardSolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```
