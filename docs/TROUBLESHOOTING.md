# Troubleshooting Guide

Mobile development combines JavaScript tooling (Node, Metro, TypeScript) with native toolchains (Xcode, Gradle, ADB). This guide gives you quick, repeatable fixes for the most common issues you will encounter while working with **Expo SDK 58** and **React Native 0.88**.

---

## 1. Common Metro Bundler Errors

### Error: `Port 8081 already in use`

Another Metro process (or another local service) is holding port `8081`.

```bash
# macOS / Linux: find and stop the process on port 8081
lsof -i :8081
kill -9 <PID>

# Windows (PowerShell): find and stop the process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or launch Expo on a different port
npx expo start --port 8082
```

### Error: `Unable to resolve module ...`

1. Verify the package is actually installed in `package.json`:
   ```bash
   npx expo install <package-name>
   ```
2. Restart Metro with a cleared transform cache:
   ```bash
   npx expo start --clear
   ```
3. Check for case-sensitive typos in import paths (`./ProfileCard` vs `./profileCard`) — macOS is often case-insensitive locally, while CI (Linux) and Metro are strict.
4. Make sure you are not using removed deep imports like `react-native/Libraries/...` (disallowed under React Native 0.88's Strict TypeScript API and package exports).

### Error: Watchman Crawl Failed / `EMFILE: too many open files`

```bash
# macOS: reset Watchman watches
watchman watch-del-all

# macOS: if Watchman is broken after a macOS upgrade, reinstall it
brew reinstall watchman

# Linux: increase inotify watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Error: `Network response timed out` on Physical Device

- Confirm your computer and phone are on the **same Wi-Fi network** (guest networks often block device-to-device traffic).
- Disable any active VPN temporarily.
- Fall back to tunnel mode:
  ```bash
  npx expo start --tunnel
  ```

---

## 2. Clearing Expo, Metro, and Native Caches

When behavior looks stale or inexplicable after upgrading dependencies or switching branches, clear caches from lightest to heaviest:

### Level 1 — Clear Metro & Expo Cache (90% of issues)

```bash
npx expo start -c
```

### Level 2 — Clear Watchman, Node Modules & Temp Caches

```bash
# macOS / Linux
watchman watch-del-all 2>/dev/null || true
rm -rf node_modules .expo
npm cache verify
npm install
npx expo start -c
```

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, .expo -ErrorAction SilentlyContinue
npm cache verify
npm install
npx expo start -c
```

### Level 3 — Clean Native Builds (Development Builds / CNG)

Only needed if you have generated `ios/` or `android/` native folders:

```bash
# Regenerate clean native projects with Continuous Native Generation
npx expo prebuild --clean

# Clean Android Gradle build cache
cd android && ./gradlew clean && cd ..

# Clean iOS CocoaPods and Xcode DerivedData (macOS)
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ios && pod deintegrate && pod install && cd ..
```

---

## 3. Upgrading Expo SDK Safely

Always upgrade one major Expo SDK version at a time and let Expo align native package versions for you:

1. **Commit or stash your work** on a clean Git branch before upgrading.
2. **Read the official Expo SDK release notes** (for example, Expo SDK 58 changelog) to check for breaking changes and removed APIs.
3. **Install the target SDK and align all Expo/RN packages:**
   ```bash
   npx expo install expo@^58.0.0
   npx expo install --fix
   ```
4. **Run Expo Doctor** to catch version mismatches, duplicate dependencies, and invalid `app.json` entries:
   ```bash
   npx expo-doctor
   ```
5. **Run your project verification scripts:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
6. **Rebuild Development Builds** whenever the native runtime version changes (`expo-dev-client` binaries built on an older SDK will not match SDK 58).

---

## 4. Checking React Native Directory Compatibility

Before adding any third-party native library to your app, inspect it on **[React Native Directory](https://reactnative.directory/)**:

1. **New Architecture Support:** React Native 0.88 enables the New Architecture (Fabric + TurboModules) by default. Filter for libraries marked **New Architecture supported**.
2. **Expo Go Compatibility:** Check whether the library works inside **Expo Go** or requires a **Development Build** (`expo-dev-client`) and Config Plugin.
3. **Platform Coverage:** Verify support for iOS, Android, and Web (if you target Web).
4. **Maintenance Signals:** Check recent release dates, open issue velocity, TypeScript definitions, and Expo SDK 58 / RN 0.88 compatibility notes.
5. **Prefer Official Expo Packages First:** Packages in the `expo-*` family (`expo-image`, `expo-camera`, `expo-secure-store`, `expo-sqlite`, `expo-audio`, `expo-video`) are tested together on every SDK release.

---

## 5. Debugging Common TypeScript Errors

This repository uses TypeScript `~5.8.3` with `"strict": true` and `"noUncheckedIndexedAccess": true`, combined with React Native 0.88's **Strict TypeScript API**.

### `Object is possibly 'undefined'` When Indexing Arrays

Because `noUncheckedIndexedAccess` is enabled, `items[0]` has type `Item | undefined`:

```tsx
// Problem:
const first = items[0];
console.log(first.title); // TS Error: 'first' is possibly 'undefined'

// Fix: guard before accessing properties
const first = items[0];
if (!first) {
  return null;
}
console.log(first.title); // Safe!
```

### Wrong Style Prop Type (`ViewStyle` vs `TextStyle` vs `ImageStyle`)

React Native separates style types by component category. Passing a `TextStyle` (such as `fontSize` or `color`) to a `View` causes a compile-time error:

```tsx
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface BadgeProps {
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}
```

### `SafeAreaView` Deprecation / Missing `edges` Prop

If TypeScript complains that `edges` does not exist on `SafeAreaView`, you accidentally imported `SafeAreaView` from `react-native` instead of `react-native-safe-area-context`:

```tsx
// Wrong:
// import { SafeAreaView } from 'react-native';

// Correct:
import { SafeAreaView } from 'react-native-safe-area-context';
```

### Unexpected `any` Lint Error (`@typescript-eslint/no-explicit-any`)

Use `unknown` and narrow with type guards or Zod schemas instead of `any`:

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
```

### Expo Router Typed Routes Mismatch

When using Expo Router typed routes, ensure dynamic route params match the file name (e.g., `app/tasks/[id].tsx` expects `{ pathname: '/tasks/[id]', params: { id: '42' } }`) and restart Metro or your TypeScript server (`Cmd/Ctrl + Shift + P` → **TypeScript: Restart TS Server**) after creating new route files.

### React Native 0.88 Strict TypeScript API Pitfalls

React Native 0.88 enables the Strict TypeScript API by default, which surfaces several common compiler errors if you follow older tutorials:

1. **`Property 'focus' does not exist on type 'TextInputType'`:**
   Use `TextInputInstance` (not `TextInput`) as the generic type for `useRef`:
   ```tsx
   import { TextInput, type TextInputInstance } from 'react-native';

   const emailRef = useRef<TextInputInstance>(null);
   emailRef.current?.focus();
   ```
2. **React Hook Form `handleSubmit(onSubmit)` rejected by `onPress` / `onSubmitEditing`:**
   React Native 0.88 events (`GestureResponderEvent`, `TextInputSubmitEditingEvent`) do not match React web's `BaseSyntheticEvent`. Wrap `handleSubmit` in a zero-arg handler:
   ```tsx
   const submitForm = (): void => {
     void handleSubmit(onSubmit)();
   };
   ```
3. **`AppState.currentState` is `string | null | undefined`:**
   Narrow `AppState.currentState` before assigning it to `AppStateStatus` (see [AppStateMonitor.tsx](../days/day-25-notifications-and-background-tasks/examples/AppStateMonitor.tsx)).
4. **`ListFooterComponent` / `ListHeaderComponent` rejects `null`:**
   Return `undefined` instead of `null` when conditionally omitting list header/footer elements.
5. **`jest-expo` complains about missing `@react-native/jest-preset`:**
   In React Native 0.88, Jest's React Native preset lives in `@react-native/jest-preset`. Install it as a dev dependency: `npx expo install @react-native/jest-preset --dev`.

---

## 6. iOS Simulator & Android Emulator Failures

### iOS Simulator (macOS)

- **`xcrun: error: unable to find utility "simctl"`:**
  Run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer` and verify Xcode Command Line Tools in **Xcode → Settings → Locations**.
- **Simulator frozen or blank screen:**
  In Simulator menu: **Device → Erase All Content and Settings...**, then relaunch with `npm run ios`.
- **Keyboard does not appear in Simulator:**
  Press `Cmd + K` (or **I/O → Keyboard → Toggle Software Keyboard**).

### Android Emulator (macOS, Windows, Linux)

- **`adb: command not found` or `ANDROID_HOME is not set`:**
  Double-check your `ANDROID_HOME` and `PATH` entries in [Environment Setup Guide](./SETUP.md) and open a fresh terminal window.
- **Emulator cannot connect to Metro (`Unable to load script`):**
  Forward port `8081` over ADB:
  ```bash
  adb reverse tcp:8081 tcp:8081
  ```
- **Emulator stuck on boot screen:**
  Open **Android Studio → Device Manager → ⋮ → Cold Boot Now** (or **Wipe Data** if corrupted).
- **Slow emulator on Linux:**
  Verify KVM is enabled (`ls -la /dev/kvm`) and your user belongs to the `kvm` group.

---

## Still Stuck?

- Check the [FAQ](./FAQ.md) and [Glossary](./GLOSSARY.md).
- See [SUPPORT.md](../SUPPORT.md) for community channels and how to share a minimal reproduction.
