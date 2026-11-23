# Day 13 Exercises: Device Permissions & Location Card

Build a permission-aware `LocationCard` component using `expo-location`, `expo-clipboard`, and `expo-haptics` in [`LocationCardExercise.tsx`](./LocationCardExercise.tsx).

## How to Practise

1. Open [`LocationCardExercise.tsx`](./LocationCardExercise.tsx) and work through the `TODO` comments step by step.
2. Render the card inside your Expo playground app (or via `npm start` in this repository's shared Expo launcher).
   - **Simulator tip**: If testing without a physical phone, set a simulated GPS location in **iOS Simulator → Features → Location → Apple** or **Android Emulator → Extended Controls (⋯) → Location**.
3. Verify types and lint rules from the repository root:

```bash
npm run typecheck
npm run lint
```

---

## Beginner — Request Foreground Permission & Read Coordinates

### Requirements
- Change the starter's `import type * as Location` to a value import (`import * as Location from 'expo-location'`).
- Make `handleLocateMe` an `async` handler that sets `{ status: 'loading' }` first.
- Request foreground location permission using `Location.requestForegroundPermissionsAsync()`.
- When granted, call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })` and transition to `{ status: 'granted', position }`.
- Render a loading indicator during `'loading'` (disabling the **Locate Me** button while loading) and display latitude and longitude formatted to 4 decimal places (`toFixed(4)`) during `'granted'`.

### Acceptance Criteria
- [ ] Tapping **Locate Me** shows a loading spinner and disables duplicate taps until the lookup finishes.
- [ ] When permission is granted, latitude and longitude render to 4 decimal places (e.g., `37.7749, -122.4194`).
- [ ] Uses `Location.Accuracy.Balanced` rather than unnecessarily battery-heavy `BestForNavigation`.

### Expected Behavior
Tapping **Locate Me** triggers the OS permission modal on first use, briefly shows `"Fetching GPS coordinates..."`, and then displays the device's coordinates in a green result card (changing the button text to **Refresh Location**).

<details>
<summary>Hint</summary>

Invoke your async handler safely from `Pressable`:

```tsx
<Pressable
  accessibilityRole="button"
  disabled={state.status === 'loading'}
  onPress={() => {
    void handleLocateMe();
  }}
>
```

And read coordinates from `state.position.coords.latitude.toFixed(4)` and `state.position.coords.longitude.toFixed(4)`.

</details>

---

## Intermediate — Handle Denied & Permanently Denied Permissions

### Requirements
- If `!permission.granted`, transition state to `{ status: 'denied', canAskAgain: permission.canAskAgain }`.
- Render a warning card for `state.status === 'denied'`:
  - If `state.canAskAgain` is `true`, explain that permission was denied and the user can tap **Locate Me** again.
  - If `state.canAskAgain` is `false`, explain that permission is permanently denied and render an **"Open Settings"** `Pressable` calling `void Linking.openSettings()`.
- Wrap the permission and GPS lookup in `try / catch (err: unknown)` and transition to `{ status: 'error', message }` if an unexpected failure occurs (such as device location services being turned off).

### Acceptance Criteria
- [ ] Denying permission shows a clear warning message instead of crashing or staying stuck in `'loading'`.
- [ ] When `canAskAgain === false`, an **Open Settings** button appears and launches the device's app Settings page.
- [ ] Errors are typed as `err: unknown` (never `any`) and narrowed with `err instanceof Error`.

### Expected Behavior
Users who tap "Don't Allow" see a friendly, non-judgmental recovery box—and permanently denied users can jump straight to system Settings in one tap.

<details>
<summary>Hint</summary>

Because `LocationCardState` is a discriminated union, TypeScript narrows `state.canAskAgain` automatically inside `state.status === 'denied'`:

```tsx
{state.status === 'denied' && (
  <View style={styles.warningBox}>
    <Text style={styles.warningText}>
      {state.canAskAgain
        ? 'Location permission was denied. Tap "Locate Me" again to retry.'
        : 'Location permission is permanently denied. Enable it in Settings.'}
    </Text>
    {!state.canAskAgain && (
      <Pressable onPress={() => { void Linking.openSettings(); }}>
        <Text>Open Settings</Text>
      </Pressable>
    )}
  </View>
)}
```

</details>

---

## Challenge — Accuracy Metadata, Copy Coordinates & Haptics

### Requirements
- Inside the `'granted'` card, display:
  - Horizontal accuracy in meters (`±${Math.round(accuracy)} m`), safely handling `accuracy === null` (`'Unavailable'`).
  - The localized timestamp of the GPS fix (`new Date(state.position.timestamp).toLocaleTimeString()`).
- Add a **"Copy Coordinates"** `Pressable` that copies `"<lat>, <lon>"` via `Clipboard.setStringAsync(...)`, triggers `Haptics.selectionAsync()` when `Platform.OS !== 'web'`, and updates the button label to `"Copied Coordinates!"` (resetting this notice whenever the user fetches a fresh location).
- Trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` (guarded with `Platform.OS !== 'web'`) when a location fix succeeds.

### Acceptance Criteria
- [ ] Null `coords.accuracy` is handled safely without printing `±0 m` or `NaN`.
- [ ] Copying coordinates puts the exact 4-decimal string on the clipboard and gives visual + haptic confirmation.
- [ ] All `Haptics` calls are guarded with `Platform.OS !== 'web'`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior
The granted location card feels like a polished native utility: coordinates, accuracy, and update time appear immediately with subtle haptic feedback, and one tap copies the coordinates to the clipboard.

<details>
<summary>Hint</summary>

Check `accuracy !== null` explicitly (not truthiness, since `0` is a valid number):

```tsx
const accuracyLabel =
  state.position.coords.accuracy !== null
    ? `±${Math.round(state.position.coords.accuracy)} m`
    : 'Unavailable';
```

</details>

---

## Reference Solution

<details>
<summary>Only after trying — view reference solution</summary>

Compare your completed component against [`../solutions/LocationCardSolution.tsx`](../solutions/LocationCardSolution.tsx), then run:

```bash
npm run typecheck
npm run lint
```

</details>
