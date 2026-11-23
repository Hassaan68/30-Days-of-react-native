# Environment Setup Guide

This guide walks you through setting up a modern React Native **0.88.0** and **Expo SDK 58** development environment on **macOS**, **Windows**, or **Linux**.

> **Verified:** November 23, 2026 — Node.js `>=22.13.0` (`24` LTS recommended via `.nvmrc`), Expo SDK `~58.0.0`, React Native `0.88.0`, TypeScript `~5.8.3`.

---

## Prerequisites Overview

| Requirement | Minimum / Recommended | Notes |
| --- | --- | --- |
| **Node.js** | `>=22.13.0` (Node `24.3+` LTS recommended) | `.nvmrc` in this repo is set to `24` |
| **Git** | Latest stable | Needed to clone the repo and run EAS builds |
| **Code Editor** | VS Code (recommended) | Extensions listed below |
| **Mobile Runtime** | Physical phone with **Expo Go**, iOS Simulator (macOS), or Android Emulator | You can start Day 01 with just your phone + Expo Go |

---

## Step 1: Install Node.js (macOS, Windows & Linux)

Using a Node version manager makes switching between Node 22 LTS and Node 24 LTS effortless.

### macOS & Linux (`nvm` or `fnm`)

**Option A — `fnm` (fast Rust-based version manager):**

```bash
# macOS (Homebrew)
brew install fnm

# Linux
curl -fsSL https://fnm.vercel.app/install | bash

# Install and activate Node 24 LTS (matches .nvmrc)
fnm install 24
fnm use 24
```

**Option B — `nvm`:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart your terminal, then:
nvm install 24
nvm use 24
```

### Windows (`fnm` or `nvm-windows`)

**Option A — `fnm` via `winget` (PowerShell):**

```powershell
winget install Schniz.fnm
# Restart PowerShell, then:
fnm install 24
fnm use 24
```

**Option B — `nvm-windows`:**
Download the latest installer from the `coreybutler/nvm-windows` GitHub releases page, then run in an Administrator terminal:

```powershell
nvm install 24
nvm use 24
```

### Verify Your Installation

```bash
node -v   # Expected: v24.x.x (or >= v22.13.0)
npm -v    # Expected: 10.x or 11.x
git --version
```

---

## Step 2: OS-Specific Native Tooling

> **Tip for Beginners:** You do **not** need Xcode or Android Studio on Day 01 if you have an iPhone or Android phone with the **Expo Go** app installed. Install the native SDKs whenever you are ready to use simulators/emulators or Development Builds.

### macOS Setup (iOS Simulator + Android Emulator)

1. **Install Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **Install Watchman** (improves Metro file-watching reliability on macOS):
   ```bash
   brew install watchman
   ```
3. **Install Xcode (for iOS Simulator):**
   - Install **Xcode** from the Mac App Store (or Apple Developer portal).
   - Open Xcode once to accept the license agreement and install the latest **iOS Simulator** runtime under **Xcode → Settings → Components**.
   - Configure Xcode Command Line Tools:
     ```bash
     sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
     sudo xcodebuild -runFirstLaunch
     ```
4. **Install Android Studio (optional on macOS, required for local Android Emulator):**
   - Follow the Android Emulator section below.
   - Add Android SDK paths to `~/.zshrc`:
     ```bash
     export ANDROID_HOME="$HOME/Library/Android/sdk"
     export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
     ```
   - Reload your shell: `source ~/.zshrc`.

### Windows Setup (Android Emulator + Physical iOS/Android Testing)

> **Note:** Apple only ships the iOS Simulator for macOS. On Windows, you can test iOS on a physical iPhone with **Expo Go** or build iOS binaries in the cloud with **EAS Build** (covered in [Day 27](../days/day-27-cicd-and-deployment/README.md)).

1. **Install Git for Windows** and enable **Developer Mode** (Windows Settings → System → For developers) so symlinks work cleanly.
2. **Install Android Studio** (see Android Emulator section below).
3. **Set Windows Environment Variables** (System Properties → Environment Variables → User variables):
   - Add `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
   - Append `%LOCALAPPDATA%\Android\Sdk\platform-tools` and `%LOCALAPPDATA%\Android\Sdk\emulator` to your `Path`.
4. Restart your terminal and verify:
   ```powershell
   adb --version
   ```

### Linux Setup (Ubuntu / Debian / Fedora)

1. **Install Watchman (optional but helpful)** and ensure `inotify` file watch limits are high enough for Metro:
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```
2. **Enable KVM hardware acceleration** (dramatically speeds up the Android Emulator):
   ```bash
   # Ubuntu / Debian
   sudo apt install -y qemu-kvm libvirt-daemon-system
   sudo adduser "$USER" kvm
   ```
   Log out and back in for group changes to apply.
3. **Install Android Studio** and add SDK environment variables to `~/.bashrc` or `~/.zshrc`:
   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
   ```

---

## Step 3: Setting Up Android Emulator (All Operating Systems)

1. Download and install **Android Studio**.
2. Open **Settings / Preferences → Languages & Frameworks → Android SDK**:
   - **SDK Platforms tab:** Install the latest stable Android API level (Android 15 / API 35 or Android 16 / API 36).
   - **SDK Tools tab:** Ensure **Android SDK Build-Tools**, **Android Emulator**, and **Android SDK Platform-Tools** are checked and installed.
3. Open **Virtual Device Manager (AVD Manager)** → **Create Device**:
   - Pick a modern phone profile (e.g., Pixel 8 or Pixel 9).
   - Select a system image with **Google Play** or **Google APIs** matching your CPU architecture (`arm64-v8a` on Apple Silicon Macs, `x86_64` on Intel/AMD machines).
4. Launch the AVD once from Android Studio or via CLI:
   ```bash
   emulator -list-avds
   emulator -avd <Your_AVD_Name>
   ```

---

## Step 4: Physical Device Testing

Testing on a real phone catches gesture, keyboard, camera, haptic, and performance issues that simulators cannot replicate.

1. **Install Expo Go:**
   - **iOS:** Install **Expo Go** from the Apple App Store.
   - **Android:** Install **Expo Go** from Google Play.
2. **Connect on the same Wi-Fi network:**
   - Start Metro with `npm start`.
   - **iOS:** Open the built-in Camera app and scan the QR code in your terminal.
   - **Android:** Open Expo Go and tap **Scan QR code**.
3. **Behind a corporate firewall or guest Wi-Fi?**
   Use Expo's tunnel mode:
   ```bash
   npx expo start --tunnel
   ```
4. **USB Debugging (Android):**
   - Enable **Developer Options** on your Android phone (Settings → About phone → tap **Build number** 7 times).
   - Enable **USB debugging**, plug in via USB, and verify with `adb devices`.
   - Run `npm run android` to launch directly over USB.

---

## Expo Go vs. Development Builds

Understanding when to use **Expo Go** versus a **Development Build** (`expo-dev-client`) is one of the most important skills in modern Expo development.

| Capability | Expo Go | Development Build (`expo-dev-client`) |
| --- | --- | --- |
| **Setup Speed** | Instant (install from App Store / Play Store) | Takes a few minutes for first native build (local or via EAS Build) |
| **Pre-installed Native Modules** | Fixed set of standard Expo SDK 58 modules | Any native library, custom Swift/Kotlin code, and Config Plugins |
| **Push Notifications (Full Production Config)** | Limited sandbox behavior | Full FCM / APNs support |
| **Custom URL Schemes & Universal Links** | Uses `exp://` scheme | Uses your own app scheme (`myapp://`) |
| **App Icon, Splash Screen & Permissions** | Expo Go defaults | Exact production native configuration |
| **Best Used For** | Days 01–18, rapid prototyping, learning fundamentals | Days 19+, custom native modules, third-party native SDKs, production apps |

### When to Switch to a Development Build

Switch from Expo Go to a Development Build as soon as you need:
- A third-party library with native code that is not bundled in Expo Go.
- Custom native permissions or Expo Config Plugins (e.g., custom push notification entitlements, background modes, widgets).
- Exact parity with your production App Store / Play Store binary.

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Build locally (requires Xcode on macOS or Android SDK)
npx expo run:ios
npx expo run:android

# Or build in the cloud with EAS Build (works on macOS, Windows, and Linux)
eas build --profile development --platform all
```

---

## Step 5: Clone and Run This Repository

```bash
# 1. Clone the repository
git clone https://github.com/your-username/30days-of-react-native.git
cd 30days-of-react-native

# 2. Switch to Node 24 LTS (if using nvm or fnm)
nvm use || fnm use

# 3. Install dependencies
npm install

# 4. Run the full verification suite
npm run validate:all
```

### Useful NPM Scripts

| Command | What It Does |
| --- | --- |
| `npm start` | Starts the Expo / Metro dev server |
| `npm run ios` | Starts Expo and opens the iOS Simulator (macOS) |
| `npm run android` | Starts Expo and opens the Android Emulator / USB device |
| `npm run typecheck` | Runs strict TypeScript verification (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint across all TypeScript/JavaScript files |
| `npm test` | Runs Jest + React Native Testing Library test suite |
| `npm run validate:curriculum` | Verifies all 30 days and 5 projects follow the repo structure |
| `npm run validate:links` | Verifies all internal Markdown links resolve cleanly |
| `npm run validate:all` | Runs curriculum, link, typecheck, lint, and test checks together |
| `npm run progress` | Prints your current curriculum checklist progress |

---

## Recommended VS Code Extensions

Install these extensions for the best TypeScript and React Native authoring experience:

1. **Expo Tools** (`expo.vscode-expo-tools`) — Autocomplete and diagnostics for `app.json`, EAS config, and Expo debugging.
2. **ESLint** (`dbaeumer.vscode-eslint`) — Live lint feedback matching this repo's `eslint.config.js`.
3. **Prettier - Code formatter** (`esbenp.prettier-vscode`) — Automatic formatting on save matching `prettier.config.js`.
4. **Error Lens** (`usernamehw.errorlens`) — Inline TypeScript and lint error messages.
5. **Pretty TypeScript Errors** (`yoavbls.pretty-ts-errors`) — Makes complex TypeScript generics and React Native style errors easy to read.

---

## Need Help?

If you hit an error during installation or running Metro, check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or [FAQ](./FAQ.md).
