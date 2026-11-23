# Day 13: Device Features

## Learning Objectives

By the end of Day 13, you will be able to:

- Access native device capabilities cleanly with Expo SDK 58 modules: camera, photo library, GPS location, local notifications, haptics, clipboard, and native sharing.
- Follow the mobile permission lifecycle: explain before asking, handle denial gracefully, and guide permanently denied users to Settings via `Linking.openSettings()`.
- Capture photos with `expo-camera` (`CameraView` & `useCameraPermissions`) and pick images with `expo-image-picker`.
- Read foreground GPS coordinates responsibly using `expo-location`.
- Decide when a feature runs in **Expo Go** versus when you need a **Development Build**.

## Prerequisites

- Completion of [Day 06: Core Components](../day-06-core-components/README.md) and [Day 12: Authentication](../day-12-authentication/README.md).
- A physical iOS or Android device (recommended—simulators have no real camera or haptic engine, though location can be simulated).

## Introduction

What truly separates a mobile app from a web page is direct access to device hardware: the camera lens, photo gallery, GPS radio, haptic Taptic Engine, clipboard, native share sheet, and system notifications.

In Expo SDK 58, you get consistent, strictly typed JavaScript APIs over iOS and Android native frameworks without writing Swift or Kotlin on day one. However, hardware access comes with **strict OS privacy rules**. Users can deny or revoke permissions at any time, and both Apple and Google reject apps that request permissions without explaining *why*. Today you will master both the APIs and the UX patterns that earn user trust.

## Concepts

### 1. The Mobile Permission Lifecycle

Never trigger a system permission dialog on app launch before the user understands why it is needed. Follow this four-step lifecycle:

1. **Undetermined** — You have not asked yet. Show a clear in-app explanation or wait until the user taps a relevant button (e.g., *"Use My Location"*).
2. **OS Prompt** — Call `request...PermissionsAsync()`. iOS and Android display their system modal with the purpose string you configured in `app.json`.
3. **Granted** — Proceed with the hardware API. Remember that users can revoke permissions later in system Settings, so always re-check before calling sensitive APIs.
4. **Denied vs. Permanently Denied (`canAskAgain`)**:
   - If `canAskAgain === true`, you may explain the benefit and offer to ask again later.
   - If `canAskAgain === false` (always after a single denial on iOS, or after two denials / "Don't ask again" on Android), the OS will silently ignore further prompt requests. Show a friendly notice with an **"Open Settings"** button calling `Linking.openSettings()`.

### 2. Camera (`expo-camera`) & Photo Library (`expo-image-picker`)

- **`expo-camera`**: Use the modern `CameraView` component together with the `useCameraPermissions()` hook. You can toggle `facing` (`'back' | 'front'`) and call `cameraRef.current?.takePictureAsync()` to capture high-resolution photos.
- **`expo-image-picker`**: Launches the native OS photo picker. Always pass `mediaTypes: ['images']` (the modern array format replacing the deprecated `MediaTypeOptions`). Because `noUncheckedIndexedAccess` is enabled in strict TypeScript, check `const asset = result.assets[0]; if (!asset) return;` after confirming `!result.canceled`.

### 3. Location (`expo-location`)

- Request foreground access with `Location.requestForegroundPermissionsAsync()`.
- Choose the lowest `Location.Accuracy` that fits your feature—`Location.Accuracy.Balanced` (~100m accuracy) is ideal for weather or nearby-places screens and preserves battery far better than `Location.Accuracy.BestForNavigation`.
- Never request **background** location unless your app genuinely needs continuous tracking (such as turn-by-turn navigation or workout recording), as both app stores heavily scrutinize background location usage.

### 4. Local Notifications (`expo-notifications`)

Local notifications are scheduled directly on the device—no push server required.

- Register a foreground behavior handler with `Notifications.setNotificationHandler(...)` returning `shouldShowBanner`, `shouldShowList`, `shouldPlaySound`, and `shouldSetBadge`.
- Request permission before scheduling.
- Provide an explicit typed `trigger`, such as `{ type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 }` or `null` for immediate delivery.

### 5. Haptics, Clipboard, and Native Sharing

- **`expo-haptics`**: Adds subtle tactile feedback (`impactAsync`, `notificationAsync`, `selectionAsync`). Guard calls with `Platform.OS !== 'web'` and use haptics sparingly so they stay meaningful.
- **`expo-clipboard`**: Reads and writes strings (`setStringAsync` / `getStringAsync`). Note that iOS 16+ shows a system paste confirmation banner whenever an app reads the clipboard—only read the clipboard in response to an explicit user tap.
- **Sharing (`expo-sharing` vs. React Native `Share`)**:
  - Use React Native's built-in `Share.share({ message, title })` for sharing plain text or URLs.
  - Use `expo-sharing` (`Sharing.shareAsync(localFileUri)`) when sharing local files such as PDFs, CSV exports, or saved photos. Always check `await Sharing.isAvailableAsync()` first.

### 6. Expo Go vs. Development Builds

As you add native capabilities, know what works out of the box in **Expo Go** versus when you should create a **Development Build** (`npx expo run:ios`, `npx expo run:android`, or `eas build --profile development`):

| Capability | Works in Expo Go? | When You Need a Development Build |
| --- | --- | --- |
| `expo-haptics`, `expo-clipboard`, `expo-sharing` | Yes | Only if adding custom native code |
| `expo-camera`, `expo-image-picker` | Yes (with default Expo Go strings) | Custom `app.json` permission descriptions (`NSCameraUsageDescription`) |
| `expo-location` (foreground) | Yes | Background location or custom native geofencing |
| `expo-notifications` (local) | Yes | **Remote push notifications** (Android Expo Go does not support remote FCM push; iOS push requires your own bundle ID & entitlements) |
| Custom native SDKs / Swift / Kotlin modules | No | Always requires a Development Build |

When configuring permissions for a Development Build or store release, add each module's config plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        { "cameraPermission": "Allow this app to take profile photos." }
      ],
      [
        "expo-location",
        { "locationWhenInUsePermission": "Show local weather for your current city." }
      ]
    ]
  }
}
```

## Code Examples

### 1. Device Toolkit Screen (`examples/DeviceToolkitScreen.tsx`)

Inspect [`./examples/DeviceToolkitScreen.tsx`](./examples/DeviceToolkitScreen.tsx) for an interactive screen combining:

- `expo-haptics` (impact, notification, and selection feedback)
- `expo-clipboard` (copy & read back)
- `expo-notifications` (permission check, `Linking.openSettings()` fallback, 3-second local notification)
- `expo-sharing` availability check + React Native `Share.share`

### 2. Camera & Image Picker Card (`examples/PhotoPickerCard.tsx`)

Inspect [`./examples/PhotoPickerCard.tsx`](./examples/PhotoPickerCard.tsx) to see a reusable profile photo card that integrates `expo-image-picker`, `expo-camera`'s `CameraView`, `expo-image` for smooth image rendering, and graceful permission-denied handling.

## Step-by-Step Explanation

1. **Permission-first handlers**: Every hardware button (`handlePickFromLibrary`, `handleOpenCamera`, `handleScheduleNotification`) checks or requests permission *before* touching the native module.
2. **Checking `canAskAgain`**: Whenever `granted` is `false`, we inspect `canAskAgain`. If `false`, we present an **"Open Settings"** button calling `Linking.openSettings()` so the user is never stuck in a dead end.
3. **Platform guards**: Calls to `Haptics` check `Platform.OS !== 'web'` so the same components stay safe if rendered on Expo Web.
4. **Cleanup of async effects**: In `DeviceToolkitScreen`, checking `Sharing.isAvailableAsync()` inside `useEffect` uses an `active` boolean flag to avoid calling `setState` on an unmounted component.

## Common Mistakes

1. **Requesting every permission at app startup**: Users immediately tap "Don't Allow" when bombarded with popups before seeing your app. Ask *in context* when the user taps a feature.
2. **Ignoring `canAskAgain === false`**: Calling `requestPermissionsAsync()` repeatedly after permanent denial does nothing on iOS and Android. Always guide users to `Linking.openSettings()`.
3. **Using deprecated `ImagePicker.MediaTypeOptions`**: Replaced by `mediaTypes: ['images']` in modern Expo SDK releases.
4. **Using `Location.Accuracy.Highest` everywhere**: Drains battery quickly and takes longer to lock on indoors. Use `Location.Accuracy.Balanced` unless you need meter-level precision.
5. **Forgetting `setNotificationHandler` for foreground notifications**: By default, iOS and Android suppress notification banners when your app is already open in the foreground unless you configure `Notifications.setNotificationHandler`.
6. **Passing a web URL to `expo-sharing`**: `Sharing.shareAsync()` expects a local `file://` URI (downloaded or saved via `expo-file-system`), whereas text/URLs should use React Native's `Share.share()`.

## Best Practices

- Show a brief, honest rationale in your UI before invoking OS permission dialogs.
- Always provide an alternative path when a permission is denied (for example, manual city search when GPS location is denied—we will apply this directly on Day 14!).
- Use `expo-image` for rendering picked or captured photos; it handles caching, aspect-ratio scaling (`contentFit="cover"`), and smooth transitions out of the box.
- Test permission flows on **real devices** and practice revoking permissions in iOS/Android Settings to verify your recovery UI.
- Plan to move to a Development Build early whenever your app relies on push notifications, background location, or custom permission strings.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/LocationCardExercise.tsx`](./exercises/LocationCardExercise.tsx):

- **Beginner**: Request foreground location permissions and render formatted latitude and longitude coordinates.
- **Intermediate**: Handle `denied` (`canAskAgain: true` vs. `false` with `Linking.openSettings()`) and GPS `error` states using a discriminated union.
- **Challenge**: Display horizontal accuracy and update timestamp, and add a "Copy Coordinates" button with `expo-clipboard` and `expo-haptics`.

## Solutions

Compare your solution with the complete reference implementation:

- [`./solutions/LocationCardSolution.tsx`](./solutions/LocationCardSolution.tsx) — Full discriminated-union state machine with permission recovery, accuracy metadata, clipboard copy, and haptic confirmation.

## Mini Project

Create a **"Field Notes" Card** combining Day 13's modules:

1. Reuse `PhotoPickerCard` to attach a photo from the camera or gallery.
2. Reuse `LocationCardSolution` to stamp the note with current GPS coordinates.
3. Add a text note input and a **"Share Note"** button that formats the note text and coordinates into the native share sheet and fires a `Success` haptic.

## Key Takeaways

- Always follow the permission lifecycle: explain in context, request, handle denial, and offer `Linking.openSettings()` when `canAskAgain` is `false`.
- `expo-camera`'s `CameraView`, `expo-image-picker`, `expo-location`, `expo-notifications`, `expo-haptics`, `expo-clipboard`, and `expo-sharing` cover most everyday mobile hardware needs.
- Guard platform-specific APIs (such as haptics) and always handle user cancellation (`result.canceled`) and empty asset arrays safely.
- Know when Expo Go is enough for prototyping and when to switch to a Development Build.

## Further Reading

- [Expo Camera (`CameraView`) Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Haptics, Clipboard, and Sharing Docs](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Expo Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)

## Progress Checklist

- [ ] Understand the 4-stage mobile permission lifecycle and `Linking.openSettings()`
- [ ] Run and study `examples/DeviceToolkitScreen.tsx` and `examples/PhotoPickerCard.tsx`
- [ ] Know which features work in Expo Go vs. require a Development Build
- [ ] Complete `exercises/LocationCardExercise.tsx` and verify against `solutions/LocationCardSolution.tsx`
- [ ] Test granting, denying, and revoking a permission on a device or simulator

## Next Day

Continue to [Day 14: Build a Weather App](../day-14-weather-app/README.md) for your Week 2 Capstone, bringing together APIs, device location, search, pull-to-refresh, and responsive UI!
