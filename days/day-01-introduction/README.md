# Day 01: Introduction to React Native and Expo

Welcome to Day 01 of **30 Days of React Native**! Today you will learn what React Native is, how it differs from purely native development and Flutter, why Expo is the officially recommended framework for building React Native apps, how React Native's New Architecture works under the hood, and how to create and run your first Expo mobile app.

## Learning Objectives

By the end of Day 01, you will be able to:

- Explain what React Native is and how it renders real native UI components on iOS and Android.
- Compare React Native against native iOS/Android development (Swift/Kotlin) and Flutter to choose the right tool for a project.
- Describe what Expo is, what Expo SDK 58 provides, and why the React Native team recommends starting with a framework like Expo.
- Summarize the four pillars of React Native's New Architecture: **Hermes**, **JSI**, **Fabric**, and **TurboModules**.
- Install the prerequisites (Node.js 22.13+ or 24 LTS, Expo CLI via `npx`, and Expo Go / iOS Simulator / Android Emulator) and scaffold a project with `npx create-expo-app@latest`.
- Navigate a modern Expo Router project structure (`app/`, `app.json`, `package.json`, `tsconfig.json`) and edit your first screen.

## Prerequisites

- A computer running macOS, Windows, or Linux (macOS with Xcode is required if you want to run the iOS Simulator locally, though you can test on a physical iPhone from any OS using Expo Go).
- Basic familiarity with using a terminal (`cd`, `ls`, `mkdir`) and a code editor such as VS Code or Cursor.
- Basic exposure to HTML/CSS and JavaScript helps, though we will reinforce modern JavaScript and TypeScript on Day 02.

## Why This Concept Matters

Before writing components, navigation, or animations, you need an accurate mental model of what React Native actually builds. Real mobile engineering teams choose React Native + Expo because it lets them ship genuine iOS and Android apps from a single TypeScript codebase without sacrificing native feel, gesture responsiveness, or platform APIs. Understanding how Expo structures your project and how React Native talks to native UI widgets saves hours of guesswork the first time you debug a layout, add a native permission, or inspect performance on a real device.

## Introduction

Building a mobile app used to mean writing and maintaining two completely separate codebases: one in Swift (or Objective-C) for iOS, and another in Kotlin (or Java) for Android. For solo developers, startups, and even large engineering organizations, duplicating business logic, UI flows, and bug fixes across two platforms doubles the cost and slows down every release.

**React Native** solves this problem by letting you write your application once in **TypeScript and React**, while still rendering genuine native UI widgets (`UIView` on iOS, `android.view.View` on Android) rather than embedding a web page inside a WebView. Combined with **Expo**—a complete framework and platform built around React Native—you get file-based routing, rich native device APIs, instant reload during development, and streamlined cloud builds out of the box.

## Concepts

### 1. What Is React Native?

React Native is an open-source framework created by Meta that lets you build cross-platform mobile applications using React. Instead of rendering HTML tags like `<div>` and `<p>` into a browser DOM, React Native maps components like `<View>`, `<Text>`, and `<Pressable>` directly to each platform's native UI primitives.

Key benefits include:

- **One codebase for iOS and Android (and optionally Web):** Share business logic, state management, networking, and most UI code across platforms.
- **Real native components and gestures:** Scrolling physics, text selection, accessibility APIs, and animations feel authentic to each operating system.
- **Fast Refresh:** Save a TypeScript file and see your changes on the device in under a second while preserving component state.
- **Huge ecosystem:** Leverage npm packages alongside native iOS and Android libraries whenever you need custom platform capabilities.

#### React Web vs. React Native at a Glance

If you have used React on the web, the core ideas (components, props, state, hooks) stay the same—only the UI primitives change:

| Concept | React Web (DOM) | React Native (iOS & Android) |
| --- | --- | --- |
| **Layout container** | `<div>`, `<section>` | `<View>` |
| **Text content** | `<p>`, `<span>`, `<h1>` | `<Text>` (all text must live inside `<Text>`) |
| **Buttons / touch** | `<button onClick={...}>` | `<Pressable onPress={...}>` |
| **Text input** | `<input type="text" />` | `<TextInput />` |
| **Styling** | `.css` files & `className` | `StyleSheet.create(...)` & `style` prop |
| **Units** | `px`, `rem`, `vh` | Unitless numbers (`dp` / `pt`) or percentages |

### 2. React Native vs. Native Development vs. Flutter

Choosing a mobile technology depends on your team, product goals, and existing skills:

| Criterion | React Native (with Expo) | Pure Native (Swift / Kotlin) | Flutter |
| --- | --- | --- | --- |
| **Language** | TypeScript / JavaScript | Swift (iOS) & Kotlin (Android) | Dart |
| **Rendering** | Native platform UI widgets via Fabric | Native platform UI widgets (UIKit/SwiftUI, Jetpack Compose) | Custom Impeller/Skia canvas engine |
| **Code Sharing** | High (typically 85–95% across iOS & Android) | Low (separate apps, unless using KMP for logic) | High (typically 90%+ across platforms) |
| **Web / React Skill Reuse** | Very high for React & TypeScript developers | Minimal | Low (requires learning Dart and Flutter's widget tree) |
| **Direct OS Feature Access** | Excellent via Expo Modules & TurboModules | Immediate (day-zero OS API access) | Very good via Platform Channels & FFI |
| **Best Fit** | Most consumer, SaaS, e-commerce, and startup apps | Ultra-specialized OS-heavy apps (e.g., complex AR, custom camera pipelines, games) | Pixel-identical branded UI across platforms when teams prefer Dart |

### 3. What Expo Is and Why It Is Recommended

Raw React Native gives you the core rendering runtime, but real apps also need navigation, camera access, secure storage, push notifications, fonts, splash screens, and reliable CI/CD builds. **Expo** (currently **SDK 58** paired with **React Native 0.88** and **React 19.3**) provides all of those pieces in a cohesive, well-tested suite:

- **Expo Router:** File-based navigation (`app/index.tsx`, `app/profile.tsx`) with automatic deep linking and typed routes.
- **Expo SDK Modules:** Over 50 maintained native libraries (`expo-camera`, `expo-location`, `expo-secure-store`, `expo-notifications`, `expo-image`, and more) with consistent TypeScript APIs.
- **Continuous Native Generation (CNG):** Configure native permissions, icons, and plugins declaratively in `app.json` instead of manually editing fragile Xcode and Gradle files.
- **Development Builds & Expo Go:** Start prototyping immediately in **Expo Go**, and seamlessly graduate to a custom **Development Build** (`npx expo run:ios` / `npx expo run:android` or EAS Build) when adding custom native code.
- **EAS (Expo Application Services):** Optional cloud services for building binaries, submitting to the App Store / Play Store, and shipping over-the-air JavaScript updates.

### 4. How React Native Works Under the Hood

You do not need to memorize C++ internals on Day 01, so let's build your mental model in three simple layers:

#### a) Real Native Widgets—Not a WebView

Hybrid frameworks like Cordova or Capacitor wrap a web page inside an embedded browser (a WebView). **React Native does not.** When you write `<View>` and `<Text>`, React Native creates real platform views—a `UIView` and `UILabel` on iOS, or an `android.view.View` and `TextView` on Android. That is why scrolling momentum, screen readers, and text selection feel native out of the box.

#### b) How JavaScript Talks to Native Views & Device APIs

Your React components and business logic run in JavaScript, while the actual screen pixels, camera, GPS, and sensors live in the native iOS/Android OS. Whenever your state updates (for example, tapping a button changes `tapCount`), React calculates the minimal UI changes and sends instructions directly to the native side so the OS updates only the native views that changed.

#### c) A Beginner-Friendly Overview of the New Architecture

Older versions of React Native passed messages between JavaScript and native code by serializing JSON strings over an asynchronous **Bridge**, which could lag during fast scrolling or complex gestures. Today, **React Native 0.88 runs exclusively on the New Architecture**, built on four approachable pillars:

```text
+-------------------------------------------------------------------+
|  Your TypeScript / React 19.3 Code                                |
|  (<View>, <Text>, <Pressable>, hooks, state)                      |
+-------------------------------------------------------------------+
                                |
                                v
+-------------------------------------------------------------------+
|  Hermes JavaScript Engine                                         |
|  (Precompiles JS to .hbc bytecode at build time; fast VM startup) |
+-------------------------------------------------------------------+
                                |
                     JSI (JavaScript Interface)
            Direct C++ references — no JSON bridge overhead
                 /                              \
                v                                v
+-------------------------------+  +--------------------------------+
|  Fabric (UI Renderer)         |  |  TurboModules (Native APIs)    |
|  - Updates native views fast  |  |  - Loaded on demand (lazy)     |
|  - Supports React 19 features |  |  - Direct sync/async calls     |
+-------------------------------+  +--------------------------------+
                |                                |
                v                                v
+-------------------------------------------------------------------+
|  Native iOS (UIKit / Swift) & Native Android (View / Kotlin)      |
+-------------------------------------------------------------------+
```

1. **Hermes:** A lightweight JavaScript engine designed specifically for mobile apps. Rather than compiling to native CPU machine code like a conventional native AOT compiler, Hermes **precompiles your JavaScript into compact Hermes bytecode (`.hbc`) at build time**, which is then executed by the Hermes bytecode virtual machine on the device. Skipping runtime JS parsing and compilation cuts app startup time and keeps memory usage low.
2. **JSI (JavaScript Interface):** A thin C++ layer that lets JavaScript hold direct references to native objects and call native functions directly—eliminating the old JSON bridge bottleneck.
3. **Fabric:** React Native's modern UI renderer. It keeps layout consistent across iOS and Android, enables smooth React 19 concurrent updates, and lets components measure native layout synchronously when needed.
4. **TurboModules:** The modern native module system for device capabilities (like camera, storage, or haptics). Modules load **lazily**—only when your app actually calls them—keeping cold startup fast.

> **Curious about deeper internals?** Later in the course—on [Day 19: Native Modules and Platform Differences](../day-19-native-modules-and-platform-differences/README.md) and [Day 24: Debugging and DevTools](../day-24-debugging-and-devtools/README.md)—you will explore advanced details such as native module bindings, type-safe native specs, and runtime profiling. For Day 01, understanding these four pillars is all you need!

### 5. Setting Up Your Development Environment

Follow these steps to prepare your machine:

1. **Install Node.js (LTS):** Install **Node.js 22.13+ or 24.3+ LTS** (this repository specifies `24` in `.nvmrc`). Verify in your terminal:
   ```bash
   node -v
   npm -v
   ```
2. **Install a Code Editor:** Install VS Code (or Cursor) with the official ESLint and Prettier extensions.
3. **Prepare a Device or Emulator:**
   - **Physical Phone (Fastest way to start):** Install the **Expo Go** app from the Apple App Store (iOS) or Google Play Store (Android). Ensure your phone and computer are on the same Wi-Fi network.
   - **iOS Simulator (macOS only):** Install Xcode from the Mac App Store, open Xcode once to install iOS simulator runtimes, and install Command Line Tools (`xcode-select --install`).
   - **Android Emulator (macOS / Windows / Linux):** Install Android Studio, open **SDK Manager**, install the latest Android SDK + Platform-Tools, and create a virtual device in **Device Manager**.

### 6. Creating and Running Your First Expo App

Scaffold a brand-new Expo project using `npx` (you do not need a global `expo-cli` package):

```bash
npx create-expo-app@latest my-first-app
cd my-first-app
npx expo start
```

When the Metro bundler starts, your terminal prints a QR code and keyboard shortcuts:

- Press **`i`** to open the app in the iOS Simulator (macOS).
- Press **`a`** to open the app in the Android Emulator.
- Press **`w`** to open the web preview.
- Scan the **QR code** with the iOS Camera app or Android Expo Go app to run on your physical phone.
- Press **`r`** to reload the app at any time.

### 7. Understanding the Project Structure

A modern Expo SDK 58 project created with `create-expo-app` uses this layout:

```text
my-first-app/
├── app/                   # File-based routes powered by Expo Router
│   ├── _layout.tsx        # Root navigation layout (Stack / Tabs)
│   └── index.tsx          # Home screen route ("/")
├── assets/                # Images, app icons, splash graphics, fonts
├── app.json               # Expo app config (name, slug, icons, plugins)
├── package.json           # Dependencies and npm scripts
└── tsconfig.json          # Strict TypeScript compiler configuration
```

- **`app/`**: Every `.tsx` file inside `app/` automatically becomes a screen route. `_layout.tsx` wraps child routes with shared UI like navigation headers or `SafeAreaProvider`.
- **`app.json`**: Declares app metadata (`name`, `slug`, `scheme`, `version`), splash screen, platform identifiers (`ios.bundleIdentifier`, `android.package`), and Expo config plugins.
- **`package.json`**: Lists installed libraries (`expo`, `react`, `react-native`, `expo-router`) and scripts (`start`, `lint`, `typecheck`, `test`).
- **`tsconfig.json`**: Configures TypeScript strictness (`strict: true`, `noUncheckedIndexedAccess: true`) so bugs are caught in your editor before they reach a device.

## Code Examples

- **File:** [`./examples/WelcomeScreen.tsx`](./examples/WelcomeScreen.tsx) — **Runnable screen component**
- **Where to place in an Expo project:** Drop it in `app/index.tsx` (or import it into `app/index.tsx` from `components/WelcomeScreen.tsx`).
- **Preview immediately:** Run `npm start` from the root of this repository to launch the shared Expo playground and open Day 01's interactive screen on iOS, Android, or Web right away.

Here is the core component logic from [`./examples/WelcomeScreen.tsx`](./examples/WelcomeScreen.tsx) (styles omitted for brevity—open the full file to see `StyleSheet.create`):

```tsx
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ARCHITECTURE_PILLARS = [
  'Hermes Engine (fast startup & low memory)',
  'JSI (direct C++ native bindings, no JSON bridge)',
  'Fabric (concurrent C++ UI renderer)',
  'TurboModules (lazy, type-safe native modules)',
] as const;

function getPlatformLabel(): string {
  if (Platform.OS === 'ios') return 'iOS';
  if (Platform.OS === 'android') return 'Android';
  return 'Web';
}

export function WelcomeScreen() {
  const [tapCount, setTapCount] = useState<number>(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.badge}>Day 01 · Expo SDK 58</Text>
        <Text style={styles.title}>Hello, React Native!</Text>
        <Text style={styles.subtitle}>
          Running natively on {getPlatformLabel()} with React Native 0.88.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>New Architecture Pillars</Text>
          {ARCHITECTURE_PILLARS.map((pillar) => (
            <Text key={pillar} style={styles.listItem}>
              • {pillar}
            </Text>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increment native interaction counter"
          onPress={() => setTapCount((count) => count + 1)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>
            {tapCount === 0
              ? 'Tap to test native interaction'
              : `Tapped ${tapCount} ${tapCount === 1 ? 'time' : 'times'}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

## Step-by-Step Explanation

1. **Safe Area Handling (`SafeAreaView`):** We import `SafeAreaView` from `'react-native-safe-area-context'` (never from `'react-native'`). This automatically pads our UI away from notches, Dynamic Islands, and home indicator bars on both iOS and Android.
2. **Status Bar (`StatusBar` from `'expo-status-bar'`):** Sets the clock and battery icons at the top of the screen to dark text against our light background.
3. **Platform Detection (`Platform.OS`):** React Native exposes `Platform.OS` (`'ios'`, `'android'`, `'web'`) via `getPlatformLabel()` so you can inspect or customize behavior per operating system.
4. **Core Primitives (`View`, `Text`, `Pressable`):**
   - `<View>` is the universal layout container (like a flexbox `<div>`).
   - `<Text>` is required for rendering any string on screen.
   - `<Pressable>` handles taps and gives you a `pressed` state callback for crisp visual feedback.
5. **Typed State (`useState<number>(0)`):** Tapping the button updates `tapCount` using a functional state updater `(count) => count + 1`, triggering React Native to re-render only the updated text natively.
6. **`StyleSheet.create`:** Styles are defined once in a plain TypeScript object using Flexbox and unitless density-independent pixels (`dp`).

## Expected Output

When you preview `WelcomeScreen` on iOS, Android, or Web, you will see a vertically centered light-slate screen padded safely inside notches and status bars:

```text
+------------------------------------------+
|  [ Day 01 · Expo SDK 58 ]                |
|                                          |
|  Hello, React Native!                    |
|  Running natively on iOS with React      |
|  Native 0.88.                            |
|                                          |
|  +------------------------------------+  |
|  | New Architecture Pillars           |  |
|  | • Hermes Engine (fast startup...)  |  |
|  | • JSI (direct C++ native...)       |  |
|  | • Fabric (concurrent C++ UI...)    |  |
|  | • TurboModules (lazy, type-safe..) |  |
|  +------------------------------------+  |
|                                          |
|  [    Tap to test native interaction   ] |
+------------------------------------------+
```

- Tapping the blue button dims it slightly while pressed and updates the label to **`Tapped 1 time`**, **`Tapped 2 times`**, **`Tapped 3 times`**, and so on.
- On Android the subtitle automatically displays **`Running natively on Android...`**; on iOS it shows **`iOS`**.

## Common Mistakes

1. **Importing `SafeAreaView` from `react-native`:** The legacy `SafeAreaView` in `react-native` is iOS-only and deprecated. Always import `SafeAreaView` and `SafeAreaProvider` from `'react-native-safe-area-context'`.
2. **Placing raw text directly inside a `<View>`:** Unlike HTML (`<div>Hello</div>`), React Native throws a runtime error if text is not wrapped inside a `<Text>` component.
3. **Installing the deprecated global `expo-cli`:** Older blog posts recommend `npm install -g expo-cli`. Never do that—modern Expo uses the local CLI bundled inside your project via `npx expo start`.
4. **Using CSS units like `'16px'` or `'100vh'`:** React Native styles use plain numbers (`fontSize: 16`, `padding: 20`) representing density-independent pixels, or percentage strings like `'100%'`.
5. **Expecting phone and laptop on different Wi-Fi networks to connect automatically:** Expo Go connects to Metro over your local LAN. If your Wi-Fi blocks peer-to-peer traffic (common on corporate or university networks), run `npx expo start --tunnel`.

## Best Practices

- **Start every project with TypeScript strict mode:** Catch null/undefined issues and misspelled props before running on a device.
- **Prefer `Pressable` over `TouchableOpacity`:** `Pressable` is the modern, flexible touch primitive with full pressed-state styling and accessibility support.
- **Keep `app.json` clean and declarative:** Configure icons, permissions, and plugins in `app.json` so Expo can regenerate native folders cleanly anytime.
- **Test on a real device early:** Emulators are convenient, but real devices reveal real touch ergonomics, network latency, keyboard behavior, and frame-rate quirks.

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) and edit [`./exercises/IntroCardExercise.tsx`](./exercises/IntroCardExercise.tsx).

### Beginner
Update the starter `IntroCardExercise` component to display your own **name**, **current role or goal**, and **3 reasons you are learning React Native**, using `<View>`, `<Text>`, and `StyleSheet.create`.

### Intermediate
Add an interactive **"Check In for Day 01"** `<Pressable>` button that toggles between `"Not Checked In"` and `"Checked In — Day 01 Complete!"`, changing the button's background color and badge text when active.

### Challenge
Display the current runtime platform (`Platform.OS`) inside a pill badge, add a second `<Pressable>` button to cycle through 3 motivational quotes, and ensure every interactive element includes `accessibilityRole="button"` and a descriptive `accessibilityLabel`.

## Solutions

Try completing the starter file on your own first before opening the reference walkthrough below.

<details>
<summary>Click to view solution notes &amp; links</summary>

- [`./solutions/IntroCardSolution.tsx`](./solutions/IntroCardSolution.tsx): Complete solution implementing the personal intro card, interactive Day 01 check-in toggle, platform pill badge, and motivational quote cycler using strict TypeScript and `SafeAreaView` from `react-native-safe-area-context`.
- **Key details to compare:**
  - `formatPlatformName(Platform.OS)` maps `'ios'` and `'android'` to readable labels inside a rounded pill badge (`borderRadius: 999`).
  - `setQuoteIndex((previous) => (previous + 1) % QUOTES.length)` cycles smoothly without ever going out of bounds, and `QUOTES[quoteIndex] ?? 'Keep building!'` satisfies `noUncheckedIndexedAccess`.
  - Both `<Pressable>` controls include pressed opacity feedback, `accessibilityRole="button"`, and descriptive `accessibilityLabel` values.

</details>

## Mini Project

**Personal Learning Passport Screen:** Create a fresh Expo app with `npx create-expo-app@latest learning-passport`, replace the home screen in `app/index.tsx` with your customized `IntroCardSolution`, and run it on your physical phone with **Expo Go** (or in the iOS Simulator / Android Emulator). Take a screenshot of your running app—you will look back at this screen on Day 30 to see how far you have come!

## Key Takeaways

- React Native renders genuine native iOS and Android UI components from a shared TypeScript + React codebase.
- **Expo SDK 58** is the recommended way to build React Native apps, giving you file-based routing, maintained native APIs, and effortless setup.
- React Native 0.88's **New Architecture** (Hermes, JSI, Fabric, TurboModules) removes the old JSON bridge for faster startup and smoother native interactions.
- Always wrap text in `<Text>`, use `<Pressable>` for buttons, and import `SafeAreaView` from `react-native-safe-area-context`.

## Further Reading

- [React Native Official Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation — Introduction & Setup](https://docs.expo.dev/)
- [Expo Router Introduction](https://docs.expo.dev/router/introduction/)
- [React Native New Architecture Overview](https://reactnative.dev/architecture/landing-page)

## Progress Checklist

- [ ] Installed Node.js 22.13+ or 24 LTS and verified `node -v`
- [ ] Understood the differences between React Native, native development, and Flutter
- [ ] Learned the roles of Hermes, JSI, Fabric, and TurboModules
- [ ] Created and ran a starter app with `npx create-expo-app@latest`
- [ ] Completed the Day 01 exercises and reviewed `./solutions/IntroCardSolution.tsx`

## Next Day

Ready to sharpen the language skills behind every React Native component? Continue to **[Day 02: JavaScript and TypeScript for React Native](../day-02-javascript-typescript/README.md)**.
