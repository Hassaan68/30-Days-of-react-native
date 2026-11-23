# Day 13: Device Features

## Learning Objectives

By the end of Day 13, you will be able to:

- Access native device capabilities cleanly with Expo SDK 58 modules: camera, photo library, GPS location, local notifications, haptics, clipboard, and native sharing.
- Follow the mobile permission lifecycle: explain before asking, handle denial gracefully, and guide permanently denied users to Settings via `Linking.openSettings()`.
- Capture photos with `expo-camera` (`CameraView` & `useCameraPermissions`) and pick images with `expo-image-picker`.
- Read foreground GPS coordinates responsibly using `expo-location`.
- Decide when a feature runs in **Expo Go** versus when you need a **Development Build**, and know which capabilities work on simulators versus physical devices.

## Prerequisites

- Completion of [Day 06: Core Components](../day-06-core-components/README.md) and [Day 12: Authentication](../day-12-authentication/README.md).
- A physical iOS or Android device (recommended—simulators have no real camera lens or haptic engine, though GPS location and local notifications can be tested on simulators).

## Why This Concept Matters

Native hardware integration is the #1 reason teams choose mobile apps over mobile websites. Scanning documents, uploading profile photos, tagging posts with GPS coordinates, sending timely reminders, and giving crisp tactile confirmation on actions all depend on device modules. Equally important, Apple App Store and Google Play reviewers strictly reject apps that demand permissions without context or break when a user taps "Don't Allow." Building respectful, resilient hardware flows early saves weeks of rework before launch.

## Introduction

What truly separates a mobile app from a web page is direct access to device hardware: the camera lens, photo gallery, GPS radio, haptic Taptic Engine, clipboard, native share sheet, and system notifications.

In Expo SDK 58, you get consistent, strictly typed JavaScript APIs over iOS and Android native frameworks without writing Swift or Kotlin on day one. However, hardware access comes with **strict OS privacy rules**. Users can deny or revoke permissions at any time, and both Apple and Google reject apps that request permissions without explaining *why*. Today you will master both the APIs and the UX patterns that earn user trust.

## Concepts

> **React Web vs. React Native Device APIs**
>
> - On the web, browser APIs (`navigator.geolocation`, `<input type="file">`) are heavily sandboxed, lack native haptic engines, and vary widely across Safari/Chrome.
> - On iOS and Android, native Expo modules unlock full hardware access—but once a user permanently denies an OS permission (`canAskAgain === false`), calling the request API again **silently does nothing**. Your app must detect that state and offer a button calling `Linking.openSettings()`.

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

### 6. Expo Go vs. Development Builds & Simulator Expectations

Before testing hardware modules, know **both** (1) whether Expo Go supports them and (2) whether a Simulator/Emulator has the hardware—this prevents hours of debugging a feature that simply isn't present in a simulator!

| Capability | Works in Expo Go? | Simulator / Emulator Behavior | When You Need a Development Build |
| --- | --- | --- | --- |
| **Camera (`expo-camera`)** | Yes (uses Expo Go's default permission text) | **iOS Simulator has NO camera hardware** (`CameraView` renders black/blank); Android Emulator offers a virtual room camera. Use a **physical device** for real camera testing | Custom `app.json` permission strings (`NSCameraUsageDescription`) or frame processors |
| **Photo Library (`expo-image-picker`)** | Yes | Works on both iOS Simulator & Android Emulator using their built-in sample photos | Custom native permission descriptions in `app.json` |
| **Location (`expo-location`)** | Yes (foreground only) | Works with simulated GPS! Set coordinates via **iOS Simulator → Features → Location** or **Android Emulator → Extended Controls (⋯) → Location** | Background location tracking or native geofencing |
| **Notifications (`expo-notifications`)** | **Local notifications:** Yes<br>**Remote push:** No (Android Expo Go removed remote FCM push; iOS push requires your own bundle ID) | Local notifications display on both iOS Simulator & Android Emulator; remote push tokens require a **physical device** | **Any remote push notifications**, custom notification sounds/icons, or notification categories |
| **Haptics (`expo-haptics`)** | Yes | **No vibration motor** in iOS Simulator or Android Emulator—API calls succeed silently without tactile feedback. Test on a **physical phone** (ensure system vibration/haptics aren't muted) | Never (works in Expo Go) |
| **Clipboard & Sharing** | Yes | Works on simulators, emulators, and physical devices | Never (works in Expo Go) |
| **Custom Native SDKs (Swift / Kotlin)** | No | Requires compiling native code locally or via EAS | Always requires a Development Build (`npx expo run:ios` / `npx expo run:android` / `eas build --profile development`) |

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

Both examples below are runnable interactive components you can preview right away via `npm start` in this repository's shared Expo launcher, or copy into your own Expo project:

### 1. Device Toolkit Screen (`examples/DeviceToolkitScreen.tsx`)

- **Type**: **Runnable screen component** (place in `app/device-toolkit.tsx` or `src/screens/DeviceToolkitScreen.tsx` in your Expo project, or preview via `npm start` in the shared Expo launcher).
- Inspect [`./examples/DeviceToolkitScreen.tsx`](./examples/DeviceToolkitScreen.tsx) for an interactive screen combining:
  - `expo-haptics` (impact, notification, and selection feedback)
  - `expo-clipboard` (copy & read back)
  - `expo-notifications` (permission check, `Linking.openSettings()` fallback, 3-second local notification)
  - `expo-sharing` availability check + React Native `Share.share`

### 2. Camera & Image Picker Card (`examples/PhotoPickerCard.tsx`)

- **Type**: **Runnable reusable component** (place in `src/components/PhotoPickerCard.tsx` and render inside any screen, or preview via `npm start` in the shared Expo launcher).
- Inspect [`./examples/PhotoPickerCard.tsx`](./examples/PhotoPickerCard.tsx) to see a reusable profile photo card that integrates `expo-image-picker`, `expo-camera`'s `CameraView`, `expo-image` for smooth image rendering, and graceful permission-denied handling.

## Step-by-Step Explanation

1. **Permission-first handlers**: Every hardware button (`handlePickFromLibrary`, `handleOpenCamera`, `handleScheduleNotification`) checks or requests permission *before* touching the native module.
2. **Checking `canAskAgain`**: Whenever `granted` is `false`, we inspect `canAskAgain`. If `false`, we present an **"Open Settings"** button calling `Linking.openSettings()` so the user is never stuck in a dead end.
3. **Platform guards**: Calls to `Haptics` check `Platform.OS !== 'web'` so the same components stay safe if rendered on Expo Web.
4. **Cleanup of async effects**: In `DeviceToolkitScreen`, checking `Sharing.isAvailableAsync()` inside `useEffect` uses an `active` boolean flag to avoid calling `setState` on an unmounted component.

## Expected Output

When you preview `DeviceToolkitScreen.tsx` and `PhotoPickerCard.tsx` on a phone (or simulator):

```text
+------------------------------------------+
| Device Toolkit                           |
| [Status Banner: Tap any tool below...]   |
+------------------------------------------+
| 1. Haptic Feedback                       |
|    [Light] [Medium] [Success] [Selection]|
+------------------------------------------+
| 2. Clipboard  (Code: RN-DAY13-EXPO58)    |
|    [ Copy Code ]   [ Read Clipboard ]    |
+------------------------------------------+
| 3. Local Notifications                   |
|    [   Schedule 3s Notification   ]      |
+------------------------------------------+
| 4. Native Sharing                        |
|    [      Share Invite Text       ]      |
+------------------------------------------+
```

- **Haptics**: On a physical device, tapping **Light / Medium / Success / Selection** triggers distinct physical vibrations and updates the blue status banner.
- **Clipboard**: Tapping **Copy Code** writes `RN-DAY13-EXPO58` to the system clipboard; tapping **Read Clipboard** displays the value below the buttons (iOS shows a native paste toast).
- **Local Notifications**: First tap prompts for OS notification permission; once granted, a local banner (`"Day 13 Reminder"`) drops down from the top of the screen 3 seconds later—even while the app stays in the foreground!
- **PhotoPickerCard**: Tapping **Choose Photo** opens the native photo library with square crop editing and fades the chosen image into the preview box. On a physical phone, **Open Camera** opens a live `CameraView` with **Flip**, **Capture**, and **Cancel** buttons. If permission is permanently denied, a yellow notice appears with an **Open Settings** link.

## Common Mistakes

1. **Testing `CameraView` or `Haptics` on iOS Simulator and assuming your code is broken**: iOS Simulator lacks camera hardware and a Taptic Engine—always test camera capture and haptics on a real phone.
2. **Requesting every permission at app startup**: Users immediately tap "Don't Allow" when bombarded with popups before seeing your app. Ask *in context* when the user taps a feature.
3. **Ignoring `canAskAgain === false`**: Calling `requestPermissionsAsync()` repeatedly after permanent denial does nothing on iOS and Android. Always guide users to `Linking.openSettings()`.
4. **Using deprecated `ImagePicker.MediaTypeOptions`**: Replaced by `mediaTypes: ['images']` in modern Expo SDK releases.
5. **Using `Location.Accuracy.Highest` everywhere**: Drains battery quickly and takes longer to lock on indoors. Use `Location.Accuracy.Balanced` unless you need meter-level precision.
6. **Forgetting `setNotificationHandler` for foreground notifications**: By default, iOS and Android suppress notification banners when your app is already open in the foreground unless you configure `Notifications.setNotificationHandler`.
7. **Passing a web URL to `expo-sharing`**: `Sharing.shareAsync()` expects a local `file://` URI (downloaded or saved via `expo-file-system`), whereas text/URLs should use React Native's `Share.share()`.

## Best Practices

- Show a brief, honest rationale in your UI before invoking OS permission dialogs.
- Always provide an alternative path when a permission is denied (for example, manual city search when GPS location is denied—we will apply this directly on Day 14!).
- Use `expo-image` for rendering picked or captured photos; it handles caching, aspect-ratio scaling (`contentFit="cover"`), and smooth transitions out of the box.
- Test permission flows on **real devices** and practice revoking permissions in iOS/Android Settings to verify your recovery UI.
- Plan to move to a Development Build early whenever your app relies on remote push notifications, background location, or custom permission strings.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/LocationCardExercise.tsx`](./exercises/LocationCardExercise.tsx):

- **Beginner**: Request foreground location permissions and render formatted latitude and longitude coordinates.
- **Intermediate**: Handle `denied` (`canAskAgain: true` vs. `false` with `Linking.openSettings()`) and GPS `error` states using a discriminated union.
- **Challenge**: Display horizontal accuracy and update timestamp, and add a "Copy Coordinates" button with `expo-clipboard` and `expo-haptics`.

## Solutions

Try completing `LocationCardExercise.tsx` independently before expanding the solution walkthrough below.

<details>
<summary>Click to view solution notes & links</summary>

- [`./solutions/LocationCardSolution.tsx`](./solutions/LocationCardSolution.tsx) — Full discriminated-union state machine (`idle | loading | granted | denied | error`) demonstrating:
  - Foreground location permission requests with `Location.Accuracy.Balanced`.
  - Conditional **Open Settings** recovery button via `Linking.openSettings()` when `canAskAgain === false`.
  - Formatted 4-decimal latitude/longitude, null-safe horizontal accuracy (`±XX m`), and localized timestamp.
  - One-tap **Copy Coordinates** powered by `expo-clipboard` + platform-guarded `expo-haptics` feedback.

</details>

## Mini Project

Create a **"Field Notes" Card** combining Day 13's modules:

1. Reuse `PhotoPickerCard` to attach a photo from the camera or gallery.
2. Reuse `LocationCardSolution` to stamp the note with current GPS coordinates.
3. Add a text note input and a **"Share Note"** button that formats the note text and coordinates into the native share sheet and fires a `Success` haptic.

## Key Takeaways

- Always follow the permission lifecycle: explain in context, request, handle denial, and offer `Linking.openSettings()` when `canAskAgain` is `false`.
- `expo-camera`'s `CameraView`, `expo-image-picker`, `expo-location`, `expo-notifications`, `expo-haptics`, `expo-clipboard`, and `expo-sharing` cover most everyday mobile hardware needs.
- Guard platform-specific APIs (such as haptics) and always handle user cancellation (`result.canceled`) and empty asset arrays safely.
- Know what works in **Expo Go** vs. **Development Builds** and which hardware features require a **physical device** instead of a simulator.

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
- [ ] Know which features work in Expo Go vs. Development Builds, and simulator vs. physical device limits
- [ ] Complete `exercises/LocationCardExercise.tsx` and verify against `solutions/LocationCardSolution.tsx`
- [ ] Test granting, denying, and revoking a permission on a device or simulator

## Next Day

Continue to [Day 14: Build a Weather App](../day-14-weather-app/README.md) for your Week 2 Capstone, bringing together APIs, device location, search, pull-to-refresh, and responsive UI!
