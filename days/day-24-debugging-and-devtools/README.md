# Day 24: Debugging and Developer Tools

## Learning Objectives
By the end of Day 24, you will be able to:
- Navigate Expo CLI shortcuts and open the modern **React Native DevTools** (the unified Chrome DevTools-based debugger replacing Flipper and legacy remote debugging).
- Debug JavaScript efficiently using breakpoints, conditional breakpoints, watch expressions, network inspection, the React Components tree, and the React Profiler.
- Capture and filter native iOS and Android logs (`adb logcat`, Xcode Console, macOS `Console.app`) to diagnose crashes that happen outside JavaScript.
- Build and integrate a React **Error Boundary** (`getDerivedStateFromError` + `componentDidCatch`) with user-friendly fallback UI and clean recovery.
- Explain how crash symbolication works using JavaScript source maps, iOS `.dSYM` bundles, and Android ProGuard/R8 `mapping.txt` files.
- Diagnose dropped frames by distinguishing **JS thread** bottlenecks from **UI thread** bottlenecks.

## Prerequisites
- Completion of [Day 16: Lists and Performance](../day-16-lists-and-performance/README.md), [Day 19: Native Modules and Platform Differences](../day-19-native-modules-and-platform-differences/README.md), and [Day 23: Security](../day-23-security/README.md).
- Familiarity with running your Expo app via `npm start` / `npx expo start`.

## Why This Concept Matters
Shipping mobile features quickly is impossible if you rely on guessing and littering components with `console.log`. Because React Native runs across both JavaScript (Hermes) and native iOS/Android threads, bugs can happen in React renders, network payloads, native permissions, or frame timing. Mastering React Native DevTools, native system logs, and Error Boundaries turns frustrating "my app just closed" moments into fast, calm, repeatable root-cause fixes—and keeps unexpected render errors from stranding real users on a blank screen.

## Introduction
Writing features is only half of mobile engineering — the other half is finding out **why** something broke, slowed down, or crashed on a user's device. Because a React Native app spans both a JavaScript runtime (**Hermes**) and native iOS/Android runtimes, effective debugging means knowing which tool looks into which layer.

In modern React Native (0.88) and Expo SDK 58, the debugging story has been dramatically simplified around **React Native DevTools**, a single built-in debugger modeled on Chrome DevTools that connects directly to the Hermes engine without legacy proxy hacks or third-party Flipper plugins.

## Concepts

### 1. Browser DevTools vs. React Native DevTools

> **Browser DevTools vs. React Native DevTools Callout:** On the web, you press `F12` / `Cmd + Opt + I` in Chrome to inspect everything in one place. In React Native, there is no browser DOM—your app renders native iOS/Android views driven by Hermes.
> - **For JavaScript, React state, Network & Profiling:** Start Metro (`npm start` or `npx expo start`) and press **`j`** in the terminal to launch **React Native DevTools**. It gives you familiar Chrome DevTools panels (**Console**, **Sources**, **Network**, **React Components**, and **React Profiler**) attached directly to Hermes.
> - **For native crashes & OS logs:** If the app closes before JS even starts (missing native permission, native SDK mismatch, out-of-memory kill), React Native DevTools cannot catch it—open **Xcode Console** / macOS **`Console.app`** (iOS) or run **`adb logcat`** (Android).

| Debugging Task | Browser DevTools (Web) | React Native 0.88 + Expo SDK 58 |
| --- | --- | --- |
| **Open Debugger** | `F12` / `Cmd + Opt + I` | Press **`j`** in the Metro terminal (`npm start`) |
| **Inspect UI Layout** | **Elements** DOM tree & CSS box model | In-app **Element Inspector** (Dev Menu → `m`) + **Components** tab in React Native DevTools |
| **Console & Breakpoints** | **Console** / **Sources** tabs | **Console** / **Sources** tabs in React Native DevTools (attached to Hermes) |
| **Inspect HTTP Calls** | **Network** tab | **Network** tab in React Native DevTools (shows `fetch` & `axios` calls) |
| **Frame & Render Profiling** | **Performance** + React Profiler | In-app **Perf Monitor** (JS vs. UI FPS) + **Profiler** tab in React Native DevTools |
| **OS / Native Crashes** | Browser crash tab | **Xcode Console** / macOS **`Console.app`** (iOS) and **`adb logcat`** (Android) |

### 2. Expo CLI & Dev Menu Shortcuts
When you run `npm start` (or `npx expo start`), keep these terminal shortcuts at your fingertips:

| Key | Action |
| --- | --- |
| `j` | Open **React Native DevTools** attached to the running app |
| `r` | Reload the JavaScript bundle |
| `m` | Toggle the in-app **Developer Menu** on connected devices/simulators |
| `i` / `a` | Open on iOS Simulator / Android Emulator |
| `shift + m` | Open extra DevTools plugins (e.g., React Query / SQLite inspectors) |
| `c` | Show the QR code again |

On a physical device, shake the phone (or press `Cmd + D` on iOS Simulator / `Cmd + M` or `Ctrl + M` on Android Emulator) to open the **Developer Menu**, where you can toggle the **Element Inspector**, **Performance Monitor**, and Fast Refresh.

### 3. React Native DevTools (Unified Debugger)
**React Native DevTools** is the official, built-in debugger for React Native and Expo (replacing both legacy Chrome remote JS debugging and Flipper). Press `j` in your Expo terminal to launch it. It includes:
- **Console:** Live logs with clickable stack traces mapped back to your TypeScript source files, plus interactive expression evaluation in the paused stack frame.
- **Sources (Breakpoints):** Open any `.ts`/`.tsx` file (`Cmd/Ctrl + P`), click a line gutter to set a breakpoint, right-click for **conditional breakpoints** (e.g., `item.id === 'task-42'`), inspect closure variables, and step over/into functions.
- **Network:** Inspect `fetch` and `axios` HTTP requests, status codes, headers, timings, and JSON payloads directly without setting up an external proxy.
- **Components (React DevTools):** Inspect the live React component hierarchy, edit props/state on the fly, and highlight renders visually.
- **Profiler (React DevTools):** Record an interaction (such as scrolling a list or typing in a form) and view a **flamegraph** showing which components rendered, how many milliseconds each took, and *why* they re-rendered.

> **LogBox (In-App Warnings & RedBox):** Unhandled JS exceptions appear as a full-screen **RedBox** in development, while `console.warn` / `console.error` appear as collapsible **LogBox** banners at the bottom. Never blindly call `LogBox.ignoreAllLogs()` — fix root warnings instead.

### 4. Inspecting Native Logs (`adb logcat`, Xcode Console, `Console.app`)
When a native module fails (permissions crash, mismatched native SDK, out-of-memory kill), the app closes before React Native's JavaScript LogBox can appear. Use native system logs:

- **Android (`adb logcat`):**
  ```bash
  # Filter React Native JS logs and AndroidRuntime native crashes
  adb logcat "*:S" ReactNative:V ReactNativeJS:V AndroidRuntime:E
  ```
- **iOS (Xcode Console):** Run your development build from Xcode (`npx expo run:ios`) to view native Objective-C/Swift exceptions, Auto Layout warnings, and `NSLog`/`os_log` output live in the debug console.
- **iOS Simulator / Physical Device (`Console.app` on macOS):** Open macOS **Console.app**, select your simulator or USB-connected iPhone in the sidebar, click **Start**, and filter by your app's process name or bundle identifier.

### 5. React Error Boundaries
An uncaught JavaScript error during rendering unmounts the entire React tree, leaving users staring at a frozen or blank screen. A **React Error Boundary** catches rendering, lifecycle, and constructor errors in any child component below it and displays a safe recovery screen instead.

Error Boundaries must be implemented as React class components defining:
- `static getDerivedStateFromError(error)` — updates state so the next render shows the fallback UI.
- `componentDidCatch(error, errorInfo)` — logs the error and `errorInfo.componentStack` to your crash reporter (Sentry, Bugsnag, Crashlytics).

**Important limitation:** Error Boundaries do **not** catch errors thrown inside:
- Event handlers (`onPress`, `onChangeText`) — wrap those in `try/catch`.
- Asynchronous callbacks (`setTimeout`, rejected Promises) — handle with `try/catch` or TanStack Query `isError` states.
- Native crashes (Objective-C/Swift/Java/Kotlin) — caught by native crash SDKs like Sentry or Firebase Crashlytics.

### 6. Crash Investigation & Symbolication
In production builds, JavaScript is minified and precompiled at build time into compact **Hermes bytecode (`.hbc`)** executed by the Hermes bytecode VM on the device, and native binaries are stripped of debug symbols to shrink app download size. Raw production stack traces therefore look unreadable (e.g., `index.android.bundle:1:48291` or raw memory addresses `0x0000000104a8f2c0`).

**Symbolication** turns those cryptic addresses back into human-readable file names and line numbers:
- **JavaScript / Hermes:** Upload **source maps** (`*.map`) generated during `eas build` / Metro bundling to your crash reporting service (e.g., Sentry via the `@sentry/react-native` Expo plugin).
- **iOS Native Crashes:** Upload **`.dSYM`** debug symbol bundles generated by Xcode / EAS Build.
- **Android Native Crashes:** Upload the **ProGuard / R8 `mapping.txt`** file generated when code shrinking/obfuscation is enabled.

### 7. Performance Profiling (JS Thread vs. UI Thread)
Smooth mobile apps render at **60 FPS** (**16.6 ms** per frame) — or **120 FPS** (**8.3 ms** per frame) on ProMotion / high-refresh-rate screens.

When scrolling stutters or taps feel sluggish, open the in-app **Performance Monitor** (`Dev Menu → Show Perf Monitor`) and compare the two FPS counters:
- **Low JS FPS (UI FPS stays ~60):** The JavaScript thread is blocked by expensive synchronous work — heavy `JSON.parse`, large array filtering during render, unmemoized `FlatList` item re-renders, or excessive `console.log` calls in dev mode. Use the **React Profiler** and `useRenderTracker` to find wasted renders.
- **Low UI FPS (JS FPS stays ~60):** The native main thread is overwhelmed — oversized uncompressed images, deep shadow/opacity hierarchies, or unvirtualized `ScrollView`s with hundreds of views. Move gesture animations to the UI thread with **Reanimated** worklets and use `FlatList` / `expo-image`.

> **Always profile performance in a Release build!** Development mode runs extra checks, unoptimized bundles, and DevTools hooks that can make an app appear 3–5× slower than production.

## Code Examples

> **How to run & preview today's examples:**
> - **Interactive preview (this repository):** Run `npm start` from the repository root to open the shared Expo launcher, press **`j`** in Metro to open React Native DevTools, and wrap any preview screen with `AppErrorBoundary` or attach `useRenderTracker` to watch live render diagnostics in the DevTools Console.
> - **In your own Expo project:** Place `AppErrorBoundary.tsx` in `src/components/AppErrorBoundary.tsx` (wrapping your root layout in `app/_layout.tsx` or risky screens) and `useRenderTracker.ts` in `src/hooks/useRenderTracker.ts`.

### Example 1: Reusable React Error Boundary & Recovery Screen
- **Type:** Reusable wrapper component + fallback UI (`AppErrorBoundary`)
- **File:** [`examples/AppErrorBoundary.tsx`](./examples/AppErrorBoundary.tsx)
- **Where to place in an Expo project:** `src/components/AppErrorBoundary.tsx` (import in `app/_layout.tsx` or around feature screens)
- **What it demonstrates:** Class-based Error Boundary with `onError` reporting hook, `onReset` recovery callback, custom `fallback` render prop, accessible **Try Again** UI inside `SafeAreaView`, and a `__DEV__`-only scrollable stack trace viewer.

### Example 2: Development-Only Render Diagnostics Hook & Prop Diff Helper
- **Type:** Reusable custom hook + pure helper module (`useRenderTracker`, `diffTrackedProps`)
- **File:** [`examples/useRenderTracker.ts`](./examples/useRenderTracker.ts)
- **Where to place in an Expo project:** `src/hooks/useRenderTracker.ts`
- **What it demonstrates:** Logs component render counts, milliseconds since the previous commit, and changed prop keys to React Native DevTools Console inside `useEffect` without violating React 19 hook rules.

## Step-by-Step Explanation
Let's walk through how `AppErrorBoundary.tsx` and `useRenderTracker.ts` work under the hood:
1. **Two-phase capture in `AppErrorBoundary`:** When a child component throws during render, React calls `getDerivedStateFromError(error)` synchronously to flip `hasError: true` before painting. Immediately afterward, `componentDidCatch(error, errorInfo)` captures `errorInfo.componentStack` and forwards both arguments to `this.props.onError` (where you wire Sentry or your `safeLogger`).
2. **Safe reset without reloading the whole app:** Tapping **Try Again** resets boundary state back to `INITIAL_STATE` and invokes `onReset?.()`, letting parent screens clear broken state or re-run a React Query fetch.
3. **Never exposing internals to production users:** The dark developer stack panel is gated behind `typeof __DEV__ !== 'undefined' && __DEV__`, ensuring end users see calm recovery guidance instead of frightening stack traces.
4. **Pure effect-based render tracking (`useRenderTracker.ts`):** Instead of mutating refs during the render phase (which breaks under React 19 Strict Mode), `useRenderTracker` updates `commitCountRef`, `lastCommitTimeRef`, and `previousPropsRef` inside `useEffect`, then delegates prop comparison to the pure `diffTrackedProps` utility using `Object.is`.

## Expected Output

### 1. On Screen (`AppErrorBoundary.tsx`)
When a wrapped child component throws during render, instead of a blank screen, the user sees a centered recovery card:

```text
┌─────────────────────────────────────────┐
│ Something went wrong                    │
│                                         │
│ We ran into an unexpected display       │
│ error. Your saved data is safe — tap    │
│ below to reload this screen.            │
│                                         │
│ [              Try Again              ] │
│                                         │
│ ┌─────────────────────────────────────┐ │  ← Visible in __DEV__ only!
│ │ DEVELOPER DETAILS (__DEV__ ONLY)    │ │
│ │ TypeError: Cannot read properties...│ │
│ │ Component Stack:                    │ │
│ │   at BrokenWidget ...               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

Tapping **Try Again** resets the boundary and re-mounts the child tree cleanly.

### 2. In React Native DevTools Console (`useRenderTracker.ts`)
After pressing `j` in Metro, each re-render of a tracked component prints structured diagnostics:

```text
[RenderTracker] TaskRow { renderCount: 1, elapsedSinceLastMs: 0, changedProps: [] }
[RenderTracker] TaskRow { renderCount: 2, elapsedSinceLastMs: 412, changedProps: ['onToggle'] }
```

Seeing `changedProps: ['onToggle']` immediately tells you a parent is creating a new inline callback reference on every render!

## Common Mistakes
- **Profiling performance in Debug mode:** Seeing 35 FPS in Expo Go dev mode does not automatically mean your production app is slow. **Fix:** Always benchmark release builds before micro-optimizing.
- **Expecting an Error Boundary to catch `async` or `onPress` errors:** Unhandled promise rejections inside an `onPress` handler bypass Error Boundaries completely. **Fix:** Wrap event handlers and async calls in `try/catch` (or use TanStack Query `isError` states).
- **Leaving `console.log` inside `renderItem` or scroll handlers:** Logging hundreds of objects per second can saturate the JS thread and DevTools connection. **Fix:** Use breakpoints or `useRenderTracker` temporarily during debugging, and remove noisy logs afterward.
- **Showing raw stack traces to production users:** Looks broken and can leak internal file paths or state details. **Fix:** Always gate debug panels behind `__DEV__`.
- **Forgetting to upload source maps / dSYMs on release builds:** Without symbolication files, production crash reports are nearly impossible to trace back to your TypeScript code. **Fix:** Automate symbol upload in EAS Build / CI.

## Best Practices
- **Place Error Boundaries strategically:** Wrap your root layout **and** isolate risky sections (charts, third-party widgets, rich-text renderers) with feature-level boundaries so one failing widget doesn't take down the entire app.
- **Prefer breakpoints over shotgun `console.log` editing:** Conditional breakpoints in React Native DevTools let you inspect entire call stacks without triggering reloads.
- **Use the React Profiler before memoizing:** Measure which component is actually re-rendering slowly instead of wrapping every component blindly in `React.memo`.
- **Automate source map uploads in CI/EAS Build** so every production build is automatically symbolicated in your crash reporter.

## Exercises
Work through the guided exercises in [`./exercises/README.md`](./exercises/README.md) using the starter file [`./exercises/ErrorFallbackExercise.tsx`](./exercises/ErrorFallbackExercise.tsx):
- **Beginner:** Wrap the fallback UI in `SafeAreaView` (`react-native-safe-area-context`), replace raw `error.message` with user-friendly messaging, and add accessible roles and minimum 48px touch targets.
- **Intermediate:** Add a `__DEV__`-only collapsible "Show Technical Details" panel (`accessibilityState={{ expanded }}`) inside a `ScrollView`.
- **Challenge:** Implement `buildDiagnosticReport(error, componentStack)` with timestamp, `Platform.OS`/`Platform.Version`, and truncated component stack, and wire a one-shot "Report Issue" button.

## Solutions
Complete the Beginner, Intermediate, and Challenge tasks in [`./exercises/ErrorFallbackExercise.tsx`](./exercises/ErrorFallbackExercise.tsx) before checking the reference implementation.

<details>
<summary>Click to view solution notes & links</summary>

Review the full, strictly typed solution in [`./solutions/ErrorFallbackSolution.tsx`](./solutions/ErrorFallbackSolution.tsx):
- `buildDiagnosticReport` builds a clean, bounded diagnostic snapshot (ISO timestamp, `Platform.OS`/`Platform.Version`, `error.name: error.message`, and `componentStack` truncated to 1200 characters) ready for issue trackers or support emails.
- `ErrorFallbackSolution` wraps the screen in `SafeAreaView` from `react-native-safe-area-context`, cleanly separates user-facing recovery actions from `__DEV__`-gated collapsible developer details (`accessibilityState={{ expanded }}`), and disables the **Report Issue** button once diagnostics are submitted.

</details>

## Mini Project
**Debug & Bulletproof a Screen End-to-End**
Take a data-driven screen from your Task Manager ([Day 21](../day-21-task-manager/README.md)) or Weather App ([Day 14](../day-14-weather-app/README.md)):
1. Wrap the screen in `AppErrorBoundary` using your `ErrorFallbackSolution` as the `fallback` prop.
2. Temporarily add a `__DEV__`-only `"Simulate Render Crash"` button that triggers a thrown error during render, verify the fallback UI appears, and confirm `"Try Again"` recovers cleanly.
3. Open **React Native DevTools** (`j`), set a conditional breakpoint in your list filter logic, inspect an API request in the **Network** tab, and record a 5-second **Profiler** trace while scrolling.
4. Attach `useRenderTracker` to a list row component, identify one unnecessary re-render cause, fix it, and verify the render count drops.

## Key Takeaways
- **React Native DevTools** (`j` in Expo CLI) unifies Console, Breakpoints, Network, Components, and Profiler for Hermes.
- Use native log tools (`adb logcat`, Xcode Console, `Console.app`) when investigating native crashes or startup failures.
- **Error Boundaries** protect users from render crashes; pair them with `try/catch` for async/event errors and symbolication (source maps, `.dSYM`, `mapping.txt`) for production triage.
- Distinguish **JS thread** vs. **UI thread** bottlenecks using the Perf Monitor and React Profiler — and always verify performance on release builds.

## Further Reading
- [React Native DevTools Documentation](https://reactnative.dev/docs/react-native-devtools)
- [Expo Debugging Tools Guide](https://docs.expo.dev/debugging/tools/)
- [Expo Runtime Issues & Native Logs](https://docs.expo.dev/debugging/runtime-issues/)
- [React Documentation — Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Native Performance Overview](https://reactnative.dev/docs/performance)

## Progress Checklist
- [ ] Opened React Native DevTools via `j` and set a breakpoint in a `.tsx` file
- [ ] Inspected live logs via `adb logcat` or Xcode Console / `Console.app`
- [ ] Reviewed `examples/AppErrorBoundary.tsx` and `examples/useRenderTracker.ts`
- [ ] Completed Beginner, Intermediate, and Challenge tasks in `./exercises/ErrorFallbackExercise.tsx`
- [ ] Compared my implementation with `./solutions/ErrorFallbackSolution.tsx`

## Next Day
Continue to [Day 25: Notifications and Background Tasks](../day-25-notifications-and-background-tasks/README.md) to schedule local reminders, configure push notifications, handle app lifecycle transitions, and understand mobile background execution constraints.
