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
- Familiarity with running your Expo app via `npx expo start`.

## Introduction
Writing features is only half of mobile engineering — the other half is finding out **why** something broke, slowed down, or crashed on a user's device. Because a React Native app spans both a JavaScript runtime (**Hermes**) and native iOS/Android runtimes, effective debugging means knowing which tool looks into which layer.

In modern React Native (0.88) and Expo SDK 58, the debugging story has been dramatically simplified around **React Native DevTools**, a single built-in debugger modeled on Chrome DevTools that connects directly to Hermes without legacy proxy hacks or third-party Flipper plugins.

## Concepts

### 1. Expo CLI & Dev Menu Shortcuts
When you run `npx expo start`, keep these terminal shortcuts at your fingertips:

| Key | Action |
| --- | --- |
| `j` | Open **React Native DevTools** attached to the running app |
| `r` | Reload the JavaScript bundle |
| `m` | Toggle the in-app **Developer Menu** on connected devices/simulators |
| `i` / `a` | Open on iOS Simulator / Android Emulator |
| `shift + m` | Open extra DevTools plugins (e.g., React Query / SQLite inspectors) |
| `c` | Show the QR code again |

On a physical device, shake the phone (or press `Cmd + D` on iOS Simulator / `Cmd + M` or `Ctrl + M` on Android Emulator) to open the **Developer Menu**, where you can toggle the **Element Inspector**, **Performance Monitor**, and Fast Refresh.

### 2. React Native DevTools (Unified Debugger)
**React Native DevTools** is the official, built-in debugger for React Native and Expo (replacing both legacy Chrome remote JS debugging and Flipper). Press `j` in your Expo terminal to launch it. It includes:
- **Console:** Live logs with clickable stack traces mapped back to your TypeScript source files, plus interactive expression evaluation in the paused stack frame.
- **Sources (Breakpoints):** Open any `.ts`/`.tsx` file (`Cmd/Ctrl + P`), click a line gutter to set a breakpoint, right-click for **conditional breakpoints** (e.g., `item.id === 'task-42'`), inspect closure variables, and step over/into functions.
- **Network:** Inspect `fetch` and `axios` HTTP requests, status codes, headers, timings, and JSON payloads directly without setting up an external proxy.
- **Components (React DevTools):** Inspect the live React component hierarchy, edit props/state on the fly, and highlight renders visually.
- **Profiler (React DevTools):** Record an interaction (such as scrolling a list or typing in a form) and view a **flamegraph** showing which components rendered, how many milliseconds each took, and *why* they re-rendered.

> **LogBox (In-App Warnings & RedBox):** Unhandled JS exceptions appear as a full-screen **RedBox** in development, while `console.warn` / `console.error` appear as collapsible **LogBox** banners at the bottom. Never blindly call `LogBox.ignoreAllLogs()` — fix root warnings instead.

### 3. Inspecting Native Logs (`adb logcat`, Xcode Console, `Console.app`)
When a native module fails (permissions crash, mismatched native SDK, out-of-memory kill), the app closes before React Native's JavaScript LogBox can appear. Use native system logs:

- **Android (`adb logcat`):**
  ```bash
  # Filter React Native JS logs and AndroidRuntime native crashes
  adb logcat "*:S" ReactNative:V ReactNativeJS:V AndroidRuntime:E
  ```
- **iOS (Xcode Console):** Run your development build from Xcode (`npx expo run:ios`) to view native Objective-C/Swift exceptions, Auto Layout warnings, and `NSLog`/`os_log` output live in the debug console.
- **iOS Simulator / Physical Device (`Console.app` on macOS):** Open macOS **Console.app**, select your simulator or USB-connected iPhone in the sidebar, click **Start**, and filter by your app's process name or bundle identifier.

### 4. React Error Boundaries
An uncaught JavaScript error during rendering unmounts the entire React tree, leaving users staring at a frozen or blank screen. A **React Error Boundary** catches rendering, lifecycle, and constructor errors in any child component below it and displays a safe recovery screen instead.

Error Boundaries must be implemented as React class components defining:
- `static getDerivedStateFromError(error)` — updates state so the next render shows the fallback UI.
- `componentDidCatch(error, errorInfo)` — logs the error and `errorInfo.componentStack` to your crash reporter (Sentry, Bugsnag, Crashlytics).

**Important limitation:** Error Boundaries do **not** catch errors thrown inside:
- Event handlers (`onPress`, `onChangeText`) — wrap those in `try/catch`.
- Asynchronous callbacks (`setTimeout`, rejected Promises) — handle with `try/catch` or TanStack Query `isError` states.
- Native crashes (Objective-C/Swift/Java/Kotlin) — caught by native crash SDKs like Sentry or Firebase Crashlytics.

### 5. Crash Investigation & Symbolication
In production builds, JavaScript is compiled to minified Hermes bytecode and native binaries are stripped of debug symbols to shrink app download size. Raw production stack traces therefore look unreadable (e.g., `index.android.bundle:1:48291` or raw memory addresses `0x0000000104a8f2c0`).

**Symbolication** turns those cryptic addresses back into human-readable file names and line numbers:
- **JavaScript / Hermes:** Upload **source maps** (`*.map`) generated during `eas build` / Metro bundling to your crash reporting service (e.g., Sentry via the `@sentry/react-native` Expo plugin).
- **iOS Native Crashes:** Upload **`.dSYM`** debug symbol bundles generated by Xcode / EAS Build.
- **Android Native Crashes:** Upload the **ProGuard / R8 `mapping.txt`** file generated when code shrinking/obfuscation is enabled.

### 6. Performance Profiling (JS Thread vs. UI Thread)
Smooth mobile apps render at **60 FPS** (**16.6 ms** per frame) — or **120 FPS** (**8.3 ms** per frame) on ProMotion / high-refresh-rate screens.

When scrolling stutters or taps feel sluggish, open the in-app **Performance Monitor** (`Dev Menu → Show Perf Monitor`) and compare the two FPS counters:
- **Low JS FPS (UI FPS stays ~60):** The JavaScript thread is blocked by expensive synchronous work — heavy `JSON.parse`, large array filtering during render, unmemoized `FlatList` item re-renders, or excessive `console.log` calls in dev mode. Use the **React Profiler** and `useRenderTracker` to find wasted renders.
- **Low UI FPS (JS FPS stays ~60):** The native main thread is overwhelmed — oversized uncompressed images, deep shadow/opacity hierarchies, or unvirtualized `ScrollView`s with hundreds of views. Move gesture animations to the UI thread with **Reanimated** worklets and use `FlatList` / `expo-image`.

> **Always profile performance in a Release build!** Development mode runs extra checks, unoptimized bundles, and DevTools hooks that can make an app appear 3–5× slower than production.

## Code Examples
Explore the complete, strictly typed examples in [`./examples/`](./examples/):
1. [`examples/AppErrorBoundary.tsx`](./examples/AppErrorBoundary.tsx) — Reusable class-based React Error Boundary with `onError` reporting hook, `onReset` callback, custom `fallback` render prop, accessible "Try Again" recovery UI, and `__DEV__`-only stack trace viewer.
2. [`examples/useRenderTracker.ts`](./examples/useRenderTracker.ts) — Development-only diagnostic hook (`useRenderTracker`) and pure prop-diff helper (`diffTrackedProps`) that log render counts, commit intervals, and changed prop keys to React Native DevTools without violating React 19 hook rules.

## Step-by-Step Explanation
Let's walk through how `AppErrorBoundary.tsx` and `useRenderTracker.ts` work under the hood:
1. **Two-phase capture in `AppErrorBoundary`:** When a child component throws during render, React calls `getDerivedStateFromError(error)` synchronously to flip `hasError: true` before painting. Immediately afterward, `componentDidCatch(error, errorInfo)` captures `errorInfo.componentStack` and forwards both arguments to `this.props.onError` (where you wire Sentry or your `safeLogger`).
2. **Safe reset without reloading the whole app:** Tapping **Try Again** resets boundary state back to `INITIAL_STATE` and invokes `onReset?.()`, letting parent screens clear broken state or re-run a React Query fetch.
3. **Never exposing internals to production users:** The dark developer stack panel is gated behind `typeof __DEV__ !== 'undefined' && __DEV__`, ensuring end users see calm recovery guidance instead of frightening stack traces.
4. **Pure effect-based render tracking (`useRenderTracker.ts`):** Instead of mutating refs during the render phase (which breaks under React 19 Strict Mode), `useRenderTracker` updates `commitCountRef`, `lastCommitTimeRef`, and `previousPropsRef` inside `useEffect`, then delegates prop comparison to the pure `diffTrackedProps` utility using `Object.is`.

## Common Mistakes
- **Profiling performance in Debug mode:** Seeing 35 FPS in Expo Go dev mode does not automatically mean your production app is slow — always benchmark release builds before micro-optimizing.
- **Expecting an Error Boundary to catch `async` or `onPress` errors:** Unhandled promise rejections inside an `onPress` handler bypass Error Boundaries completely; handle them with `try/catch`.
- **Leaving `console.log` inside `renderItem` or scroll handlers:** Logging hundreds of objects per second can saturate the JS thread and DevTools bridge.
- **Showing raw stack traces to production users:** Looks broken and can leak internal file paths or state details. Always gate debug panels behind `__DEV__`.
- **Forgetting to upload source maps / dSYMs on release builds:** Without symbolication files, production crash reports are nearly impossible to trace back to your TypeScript code.

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
Review the full, strictly typed solution in [`./solutions/ErrorFallbackSolution.tsx`](./solutions/ErrorFallbackSolution.tsx).
- `buildDiagnosticReport` builds a clean, bounded diagnostic snapshot ready for issue trackers or support emails.
- `ErrorFallbackSolution` cleanly separates user-facing recovery actions from `__DEV__`-gated developer details and disables the **Report Issue** button once diagnostics are submitted.

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
