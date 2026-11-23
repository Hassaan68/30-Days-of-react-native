# Day 19: Native Modules and Platform Differences

## Learning Objectives

By the end of Day 19, you will be able to:

- Identify key UX, visual, and behavioral differences between iOS and Android (navigation gestures, shadows vs elevation, keyboard behavior, permissions, iOS 27 `SceneDelegate`, and Android edge-to-edge/R8).
- Branch styles and logic cleanly using `Platform.OS`, `Platform.Version`, and `Platform.select()`.
- Organize larger platform-specific implementations using `.ios.tsx`, `.android.tsx`, `.native.tsx`, and `.web.tsx` file extensions.
- Understand how Native Modules and TurboModules work under React Native's New Architecture (JSI).
- Explain how the Expo Modules API (Swift & Kotlin, including Expo Modules 2.0 beta in SDK 58) and Config Plugins (`withInfoPlist`, `withAndroidManifest`, and Continuous Native Generation) let you customize native projects cleanly.
- Decide when writing custom native code is truly necessary versus reaching for a maintained Expo package.

## Prerequisites

- Completed [Day 18: Architecture and Folder Structure](../day-18-architecture-and-folder-structure/README.md).
- Comfortable with TypeScript, `StyleSheet.create`, `Pressable`, and `react-native-safe-area-context`.
- Familiarity with Expo Router and running apps on an iOS Simulator, Android Emulator, or physical device.

## Introduction

React Native's promise is **"learn once, write anywhere"** — not "make iOS look like Android." Users immediately notice when an app ignores their platform's conventions: an iOS app with Android ripple effects or an Android app with missing back navigation feels subtly broken.

At the same time, real-world apps occasionally need access to native SDKs, custom sensors, or native configuration keys (such as `Info.plist` entries or Android manifest permissions). In modern Expo SDK 58 and React Native 0.88 (where the New Architecture is enabled by default), you rarely need to hand-edit Objective-C or Java files. Instead, you combine:

1. **Platform-aware UI** (`Platform.select`, platform extensions, native action sheets).
2. **Continuous Native Generation (CNG)** and **Config Plugins** (`npx expo prebuild`).
3. **Expo Modules API** (idiomatic Swift and Kotlin) whenever you truly need custom native code.

## Concepts

### 1. Core iOS vs Android Differences

| Area | iOS | Android |
| --- | --- | --- |
| **Navigation & Back** | Edge-swipe from left side; centered header titles by default. | Hardware/gesture back button with predictive back animations; left-aligned titles by default. |
| **Surface Depth** | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`. | `elevation` (Material elevation shadows). Putting `overflow: 'hidden'` on the same view clips iOS shadows, so wrap shadows in an outer `View`. |
| **Touch Feedback** | Subtle opacity dimming (`pressed ? 0.78 : 1`) and haptic taps. | Material ink ripple via `Pressable`'s `android_ripple` prop. |
| **Keyboard Avoidance** | `KeyboardAvoidingView` typically uses `behavior="padding"`. | Managed via Android's `softwareKeyboardLayoutMode` (`"resize"` or `"pan"` in `app.json`) or `behavior="height"`. |
| **Permissions** | Often one-shot system prompt; if denied, guide the user to Settings via `Linking.openSettings()`. | Runtime prompts with rationale support (`canAskAgain`), plus granular photo/location/notification permissions. |
| **App Lifecycle & Build (2026)** | **iOS 27 `SceneDelegate`** lifecycle is adopted in Expo SDK 58 for multi-scene and deep-link handling. | **Edge-to-edge display** is enforced on modern Android versions (use `react-native-safe-area-context`!), and release builds rely on **R8** code shrinking and obfuscation. |

### 2. Runtime Detection with `Platform`

React Native exposes the `Platform` module for small, localized differences:

- `Platform.OS`: returns `'ios'`, `'android'`, `'web'`, `'macos'`, or `'windows'`.
- `Platform.Version`: returns a string on iOS (e.g., `'27.0'`) and an integer API level on Android (e.g., `36`).
- `Platform.select({ ios, android, default })`: picks the matching value cleanly. Always provide a `default` branch so TypeScript narrows the return type without `undefined`.

```ts
import { Platform, type ViewStyle } from 'react-native';

const headerShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  android: {
    elevation: 4,
  },
  default: {},
});
```

### 3. Platform-Specific File Extensions

When an entire component differs significantly between platforms (for example, a native date picker or share menu), splitting by filename keeps every file clean and avoids nested `if (Platform.OS === ...)` blocks:

```text
components/
├── ActionMenu.ios.tsx      # Bundled automatically on iOS
├── ActionMenu.android.tsx  # Bundled automatically on Android
├── ActionMenu.web.tsx      # Bundled automatically on Web
└── ActionMenu.tsx          # Optional shared fallback / TypeScript contract
```

You import it without the platform suffix:

```ts
import { ActionMenu } from './components/ActionMenu';
```

Metro resolves `.ios.tsx` on iOS, `.android.tsx` on Android, `.native.tsx` on both mobile platforms, and `.web.tsx` on Web. Keep the exported prop interface identical across platform files so callers remain platform-agnostic.

### 4. Native Modules & TurboModules (New Architecture)

Historically, React Native communicated with native code over an asynchronous JSON **Bridge**. Every call had to serialize data to JSON, cross the bridge, and deserialize on the other side.

In React Native 0.88 (New Architecture enabled by default), **TurboModules** communicate directly over **JSI (JavaScript Interface)**:

- **Direct C++ host bindings**: JavaScript holds direct references to native objects without JSON serialization overhead.
- **Lazy initialization**: Native modules load on demand instead of slowing down app startup.
- **Synchronous & asynchronous calls**: Reading small values (like device locale or storage keys) can happen synchronously, while heavy work stays async.
- **Strict TypeScript Codegen**: Native specs are generated directly from TypeScript interfaces, catching type mismatches at build time.

### 5. Expo Modules API (Swift & Kotlin)

Writing raw TurboModules requires C++ glue code and Codegen boilerplate. The **Expo Modules API** wraps the New Architecture in a declarative DSL so you write modern **Swift** (iOS) and **Kotlin** (Android) directly:

```swift
// ios/BatteryModule.swift (conceptual example)
import ExpoModulesCore

public class BatteryModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BatteryInfo")

    Function("isLowPowerMode") {
      return ProcessInfo.processInfo.isLowPowerModeEnabled
    }
  }
}
```

```kotlin
// android/src/main/java/expo/modules/batteryinfo/BatteryModule.kt (conceptual example)
package expo.modules.batteryinfo

import android.content.Context
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BatteryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BatteryInfo")

    Function("isLowPowerMode") {
      val powerManager = appContext.reactContext?.getSystemService(Context.POWER_SERVICE) as? PowerManager
      return@Function powerManager?.isPowerSaveMode ?: false
    }
  }
}
```

In **Expo SDK 58**, **Expo Modules 2.0 (beta)** further streamlines this layer with faster JSI interop, improved Swift/Kotlin type bridging, and leaner generated code while staying compatible with existing Expo Modules.

### 6. Config Plugins & Continuous Native Generation (CNG)

When you install a native library or need custom `Info.plist` / `AndroidManifest.xml` entries, resist the urge to manually edit `ios/` and `android/` folders and commit them forever — upgrades become painful.

Instead, Expo promotes **Continuous Native Generation (CNG)**:

1. Declare native customizations declaratively in `app.json` / `app.config.ts` via **Config Plugins**.
2. Run `npx expo prebuild` (or let EAS Build run it automatically) to generate fresh `ios/` and `android/` directories from your config.
3. For custom edits, write a small Config Plugin using `@expo/config-plugins` helpers such as `withInfoPlist` (iOS) and `withAndroidManifest` (Android):

```ts
// plugins/withCustomUsageDescription.ts (conceptual Config Plugin)
import { type ConfigPlugin, withInfoPlist, withAndroidManifest } from '@expo/config-plugins';

export const withCustomMetadata: ConfigPlugin = (config) => {
  config = withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSCameraUsageDescription =
      'Allow this app to scan documents and capture profile photos.';
    return modConfig;
  });

  config = withAndroidManifest(config, (modConfig) => {
    // Inspect or add manifest metadata safely here
    return modConfig;
  });

  return config;
};
```

### 7. When Do You Actually Need Custom Native Code?

Before writing a single line of Swift or Kotlin, run through this checklist:

1. **Does an official Expo package already exist?** (`expo-camera`, `expo-location`, `expo-notifications`, `expo-secure-store`, `expo-haptics`, `expo-sqlite`, `expo-audio`, `expo-video`). Use it — you get automatic Config Plugins, New Architecture support, and SDK upgrades for free.
2. **Is there a well-maintained community package with New Architecture support?** Check the [React Native Directory](https://reactnative.directory/).
3. **Do you need a proprietary native SDK, custom hardware protocol (BLE/NFC/USB), or OS widget/extension?** That is the right time to scaffold a local module with `npx create-expo-module --local` and build it cleanly in Swift and Kotlin.

## Code Examples

### Example 1: Cross-Platform Action Sheet & Shadow Helper

See [`./examples/PlatformActionSheet.ts`](./examples/PlatformActionSheet.ts). It abstracts iOS's native `ActionSheetIOS` and Android's Material `Alert.alert` behind one strictly typed `showPlatformActionSheet()` function, and exposes `getPlatformShadow()` using `Platform.select`.

```ts
import { showPlatformActionSheet } from './examples/PlatformActionSheet';

showPlatformActionSheet({
  title: 'Photo Options',
  message: 'Choose an action for this photo',
  options: [
    { label: 'Share Photo', onPress: () => console.log('Sharing...') },
    { label: 'Delete Photo', destructive: true, onPress: () => console.log('Deleted') },
  ],
});
```

### Example 2: Runtime Diagnostics & Platform Banner

See [`./examples/DeviceInfoBanner.tsx`](./examples/DeviceInfoBanner.tsx). It combines `Platform.OS`, `Platform.Version`, `Platform.select`, `useWindowDimensions`, `useColorScheme`, `expo-constants`, `expo-haptics`, and `SafeAreaView` from `react-native-safe-area-context` into a live device diagnostics card.

## Step-by-Step Explanation

1. **Keep platform differences behind tiny abstractions**: Look at `showPlatformActionSheet` in [`./examples/PlatformActionSheet.ts`](./examples/PlatformActionSheet.ts). Calling components never import `ActionSheetIOS` directly or scatter `if (Platform.OS === 'ios')` checks across screens.
2. **Guard array indexing under strict TypeScript**: When `ActionSheetIOS` invokes the callback with `selectedIndex`, we verify `selectedIndex !== cancelButtonIndex` and check `const chosen = config.options[selectedIndex]; if (chosen) { chosen.onPress(); }`. This prevents out-of-bounds bugs and satisfies `noUncheckedIndexedAccess: true`.
3. **Always provide a `default` branch in `Platform.select`**: Returning `Platform.select<ViewStyle>({ ios: ..., android: ..., default: ... })` ensures web, tests, and future platforms always receive a valid `ViewStyle`.
4. **Separate outer shadow container from inner clipped pressable**: In [`./examples/DeviceInfoBanner.tsx`](./examples/DeviceInfoBanner.tsx), the button uses `overflow: 'hidden'` so `android_ripple` stays cleanly clipped to its `borderRadius`, while iOS uses `pressed ? styles.buttonPressedIos : undefined`.
5. **Respect edge-to-edge & safe areas**: Wrapping the screen in `SafeAreaView` from `react-native-safe-area-context` prevents content from colliding with the iOS Dynamic Island, home indicator, or Android edge-to-edge system bars.

## Common Mistakes

- **Importing `SafeAreaView` from `react-native`**: The built-in `SafeAreaView` is deprecated and ignores Android edge-to-edge insets. Always import `SafeAreaView` from `react-native-safe-area-context`.
- **Putting `overflow: 'hidden'` and iOS `shadow*` props on the same `View`**: `overflow: 'hidden'` clips iOS shadows completely. Apply the shadow on an outer wrapper `View` and clip ripples/content on an inner `View` or `Pressable`.
- **Forgetting `default` in `Platform.select()`**: Without `default`, the return type becomes `T | undefined`, causing unexpected TypeScript errors or missing styles on Web.
- **Calling `ActionSheetIOS` without checking `Platform.OS === 'ios'`**: `ActionSheetIOS` throws on Android if called unconditionally.
- **Hand-editing `ios/` and `android/` directly in a CNG project**: Running `npx expo prebuild --clean` overwrites manual edits. Always encode native configuration changes in `app.json` or a Config Plugin.

## Best Practices

- **Abstract platform branching into reusable primitives** (e.g., `PlatformCard`, `showPlatformActionSheet`, `getPlatformShadow`) instead of scattering `Platform.OS` checks across business logic.
- **Use `.ios.tsx` / `.android.tsx` when implementations diverge by more than ~25 lines**, and keep exported prop interfaces identical across variants.
- **Test on both platforms early and often**, especially keyboard forms, shadows, safe areas, and back navigation.
- **Keep release builds R8-safe on Android**: When adding native libraries, verify they ship consumer ProGuard/R8 rules and test a release build before shipping.
- **Prefer Expo SDK modules over custom native code** until you hit a genuine capability gap.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete the starter file [`./exercises/PlatformCardExercise.tsx`](./exercises/PlatformCardExercise.tsx).

- **Beginner**: Complete `getPlatformBadgeText()` using `Platform.select` so iOS displays `"iOS Native"`, Android displays `"Android Material"`, and other platforms display `"Cross-Platform"`.
- **Intermediate**: Implement `getCardDepthStyle(elevated)` with iOS shadow properties and Android `elevation`, and wire up `android_ripple` + iOS pressed opacity feedback on `Pressable` without clipping iOS shadows.
- **Challenge**: Add dark/light theme support via `useColorScheme()` and create a pair of platform-specific helper files (`PlatformHaptics.ios.ts` and `PlatformHaptics.android.ts`) with an identical exported function `triggerCardFeedback()` that uses subtle selection haptics on iOS and light impact feedback on Android.

## Solutions

Compare your work against the complete reference solution in [`./solutions/PlatformCardSolution.tsx`](./solutions/PlatformCardSolution.tsx):

- `getCardDepthStyle` separates iOS shadow styling and Android `elevation` with a safe `default` fallback.
- The outer `View` carries the shadow/elevation and background color so iOS shadows render smoothly, while the inner `Pressable` uses `overflow: 'hidden'` to clip `android_ripple` cleanly within the rounded border.
- `useColorScheme()` adapts every surface, border, badge, and ripple color for both light and dark modes.

## Mini Project

**Adaptive Settings Sheet**: Build a mini "App Preferences" screen that displays three `PlatformCardSolution` items (`Theme`, `Notifications`, `Export Data`). Tapping `Export Data` opens `showPlatformActionSheet` with `"JSON"`, `"CSV"`, and a destructive `"Clear Local Cache"` option, while updating a status banner on screen with the chosen action and current OS metadata.

## Key Takeaways

- Great cross-platform apps share business logic while respecting each OS's visual and interaction conventions.
- Use `Platform.select` for small differences and `.ios.tsx` / `.android.tsx` files when platform implementations diverge substantially.
- React Native 0.88's New Architecture uses JSI-powered TurboModules, and the Expo Modules API (including Expo Modules 2.0 beta in SDK 58) lets you author native modules in clean Swift and Kotlin.
- Config Plugins and Continuous Native Generation (`npx expo prebuild`) keep native configuration reproducible across Expo SDK upgrades.

## Further Reading

- [React Native Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [React Native New Architecture & TurboModules](https://reactnative.dev/architecture/overview)
- [Expo Modules API Overview](https://docs.expo.dev/modules/overview/)
- [Expo Config Plugins & Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)
- [React Native Directory (New Architecture Compatibility)](https://reactnative.directory/)

## Progress Checklist

- [ ] Understand key iOS vs Android UX, shadow, keyboard, permission, and lifecycle differences.
- [ ] Practice `Platform.OS`, `Platform.Version`, and `Platform.select` with a `default` branch.
- [ ] Understand `.ios.tsx` / `.android.tsx` file resolution and TurboModules / Expo Modules API.
- [ ] Complete [`PlatformCardExercise.tsx`](./exercises/PlatformCardExercise.tsx) and compare with [`PlatformCardSolution.tsx`](./solutions/PlatformCardSolution.tsx).
- [ ] Build the Adaptive Settings Sheet mini project.

## Next Day

Continue to [Day 20: Testing](../day-20-testing/README.md) to learn how to write fast, reliable unit and component tests with Jest and React Native Testing Library.
