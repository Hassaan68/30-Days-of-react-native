# React Native & Expo Glossary (A–Z)

A practical reference of terms you will encounter throughout **30 Days of React Native**, Expo SDK 58, and React Native 0.88.

---

## A

**AAB (Android App Bundle)**
The publishing format required by Google Play (`.aab`). Google Play uses your AAB to generate optimized, device-specific APKs for each user's screen density and CPU architecture.

**ADB (Android Debug Bridge)**
A command-line utility included with Android SDK Platform-Tools used to communicate with Android emulators and USB-connected devices (e.g., `adb devices`, `adb reverse tcp:8081 tcp:8081`, `adb logcat`).

**APK (Android Package Kit)**
An installable Android application binary (`.apk`). Useful for direct sideloading and internal QA testing outside the Google Play Store.

**APNs (Apple Push Notification service)**
Apple's cloud service responsible for delivering remote push notifications to iOS and iPadOS devices.

**AsyncStorage**
An asynchronous, unencrypted key-value persistence system (`@react-native-async-storage/async-storage`) suitable for non-sensitive preferences and lightweight app caches. Never store tokens or passwords here — use **SecureStore** instead.

---

## B

**Bridge (Legacy Architecture) vs. JSI**
In older React Native versions, JavaScript communicated with native iOS/Android code asynchronously by serializing JSON messages across a single "Bridge". Modern React Native (0.88, New Architecture) replaces the Bridge with **JSI (JavaScript Interface)**, allowing direct, synchronous C++ calls between JavaScript and native objects with dramatically lower overhead.

**Bundle Identifier / Package Name**
The unique reverse-domain identifier for your mobile app — called `bundleIdentifier` on iOS (`com.example.myapp`) and `package` on Android (`com.example.myapp`).

---

## C

**CNG (Continuous Native Generation)**
Expo's workflow where native `ios/` and `android/` folders are generated on demand from `app.json` / `app.config.ts` and Config Plugins via `npx expo prebuild`, rather than manually editing and committing native project files.

**CocoaPods**
A dependency manager for Swift and Objective-C Cocoa projects used during iOS native builds (`Podfile` / `pod install`).

**Config Plugin**
A JavaScript/TypeScript function used by Expo Prebuild to programmatically modify native iOS (`Info.plist`, `Podfile`, `AppDelegate`) and Android (`AndroidManifest.xml`, `build.gradle`) configuration files without manual edits.

---

## D

**Deep Linking**
Opening a specific screen inside a mobile app via a URL — either with a custom URL scheme (`myapp://tasks/42`) or verified HTTPS links (**Universal Links** on iOS, **Android App Links** on Android). Expo Router handles deep links automatically based on your `app/` file tree.

**Development Build (`expo-dev-client`)**
A custom-built version of your app containing your exact native dependencies and Config Plugins while still connecting to your local Metro dev server for Fast Refresh. Think of it as your own personalized Expo Go.

**Dynamic Type**
iOS's system-wide font scaling accessibility feature (parallel to Android Font Size). Respecting Dynamic Type ensures users who increase system text size can read your UI comfortably.

---

## E

**EAS (Expo Application Services)**
Hosted cloud services from Expo for building native binaries (**EAS Build**), submitting to Apple App Store & Google Play (**EAS Submit**), and delivering over-the-air JS/asset updates (**EAS Update**).

**Edge-to-Edge**
A modern Android and iOS design model where app content draws behind translucent system status and navigation bars, using safe area insets (`react-native-safe-area-context`) to pad interactive elements cleanly.

**Expo Go**
A pre-built sandbox app from the App Store / Play Store that lets you run Expo SDK projects instantly by scanning a QR code without compiling native code locally.

**Expo Router**
Expo's file-based router built on top of React Navigation. Creating files inside `app/` automatically defines stacks, tabs, modals, typed routes, and deep links.

---

## F

**Fabric**
React Native's New Architecture UI rendering system. Written in C++, Fabric synchronizes React's component tree directly with native platform views, supports React 19 concurrent features, and eliminates legacy asynchronous Bridge bottlenecks.

**Fast Refresh (formerly Hot Reloading)**
A developer feature that instantaneously updates edited React components in your running app while preserving local component state (`useState`, `useRef`).

**FCM (Firebase Cloud Messaging)**
Google's push notification delivery service used by Android devices (and optionally integrated with Expo Notifications).

**Flexbox**
The layout engine used by React Native (implemented natively via **Yoga**). Unlike CSS on the web, React Native defaults to `flexDirection: 'column'`, `alignContent: 'flex-start'`, and `flexShrink: 0`.

---

## G

**Gesture Handler (`react-native-gesture-handler`)**
A library that drives touch gestures (pan, pinch, swipe, tap) directly on the native UI thread instead of routing every touch event through JavaScript.

---

## H

**Hermes**
An open-source JavaScript engine built specifically for React Native. Rather than compiling JavaScript to native CPU machine code like a conventional native AOT compiler, Hermes precompiles JavaScript into compact **Hermes bytecode (`.hbc`)** during your app's build step and executes that bytecode in a lightweight mobile virtual machine at runtime—avoiding on-device JS parsing/compilation and cutting startup latency and memory usage.

---

## I

**IPA (iOS App Store Package)**
The compiled archive format (`.ipa`) for distributing iOS applications to TestFlight, ad-hoc testers, and the Apple App Store.

---

## J

**JSI (JavaScript Interface)**
A lightweight C++ API that enables JavaScript engines like Hermes to hold direct references to native C++/Objective-C/Java/Kotlin host objects and invoke methods synchronously without JSON serialization.

---

## M

**Metro**
React Native's JavaScript bundler. Metro resolves imports, transforms TypeScript/JSX, bundles code for iOS/Android/Web, and serves live updates for Fast Refresh.

---

## N

**Native Module**
Platform-specific code written in Swift, Objective-C, Kotlin, Java, or C++ that exposes device capabilities (camera, biometrics, Bluetooth, SQLite) to JavaScript.

**New Architecture**
React Native's modern runtime — enabled by default in React Native 0.88 — combining **JSI**, **Fabric** (renderer), **TurboModules** (lazy-loaded native modules), and **Codegen** (type-safe JS-to-native interfaces).

---

## O

**OTA Update (Over-the-Air Update)**
Delivering JavaScript bundle and static asset updates directly to users' installed apps (e.g., via **EAS Update**) without waiting for a full App Store or Google Play binary review. Native code changes still require a new binary build.

---

## P

**Prebuild (`npx expo prebuild`)**
The Expo CLI command that executes Continuous Native Generation (CNG), creating or updating native `ios/` and `android/` directories from your `app.json` and Config Plugins.

**Pressable**
React Native's core interactive touch component that supports `onPress`, `onLongPress`, `onPressIn`, `onPressOut`, hit slop configuration, and pressed-state dynamic styling. Preferred over legacy `TouchableOpacity`.

---

## R

**Reanimated (`react-native-reanimated`)**
An animation library that runs animation logic directly on the native UI thread via **worklets**, delivering smooth 60–120 FPS animations even when the JavaScript thread is busy.

---

## S

**Safe Area**
The portion of a device screen unobstructed by hardware cutouts (notches, Dynamic Island, rounded corners) and OS chrome (status bar, home indicator). Always manage safe areas with `SafeAreaProvider`, `SafeAreaView`, and `useSafeAreaInsets` from `react-native-safe-area-context`.

**SceneDelegate**
The modern iOS window lifecycle architecture (`UISceneDelegate`) used by iOS apps to manage multi-window scenes, deep links, and foreground/background transitions.

**SecureStore (`expo-secure-store`)**
An Expo module that encrypts and stores sensitive key-value secrets (auth tokens, refresh keys) inside the iOS Keychain and Android Keystore.

**Strict TypeScript API**
Introduced and enabled by default in modern React Native (0.88), restricting TypeScript imports to documented public APIs and disallowing fragile deep imports (`react-native/Libraries/*`).

---

## T

**TurboModules**
The New Architecture native module system powered by JSI and Codegen. TurboModules load lazily on first use (improving cold startup speed) and expose strongly typed synchronous/asynchronous native methods.

---

## V

**VirtualizedList**
The underlying virtualization primitive powering `FlatList` and `SectionList`. It renders only the items currently near the visible viewport and recycles memory for offscreen rows so lists with thousands of items stay smooth.

---

## W

**Worklet**
A small JavaScript function marked with `'worklet'` (used by `react-native-reanimated` and `react-native-gesture-handler`) that executes synchronously on the native UI thread rather than the JS thread.

---

## Y

**Yoga**
Meta's cross-platform C++ layout engine that implements Flexbox for React Native across iOS, Android, and other native targets.

---

## Related Guides

- [Curriculum Roadmap](./ROADMAP.md)
- [Environment Setup Guide](./SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Resources](./RESOURCES.md)
