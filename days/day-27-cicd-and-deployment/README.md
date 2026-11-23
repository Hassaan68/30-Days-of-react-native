# Day 27: CI/CD and App Deployment

## Learning Objectives

By the end of Day 27, you will be able to:

- Configure EAS Build profiles (`development`, `preview`, `production`) in `eas.json` for iOS and Android.
- Distinguish between Development builds, internal Preview builds (APK / TestFlight), and Production store binaries (IPA / AAB).
- Manage dynamic build environments with `app.config.ts` and EAS Environment Variables.
- Automate semantic versioning and native build numbers (`ios.buildNumber`, `android.versionCode`, `autoIncrement`).
- Ship rapid JavaScript and asset fixes with EAS Update using channels, branches, and `fingerprint` runtime versions—while respecting OTA limitations.
- Automate quality checks, builds, and OTA updates using GitHub Actions.

## Prerequisites

- [Day 19: Native Modules and Platform Differences](../day-19-native-modules-and-platform-differences/README.md)
- [Day 20: Testing](../day-20-testing/README.md)
- [Day 23: Security](../day-23-security/README.md)
- [Day 26: Backend Integration and Real-Time Features](../day-26-backend-and-realtime/README.md)

## Why This Concept Matters

Writing working React Native code on your laptop is only half of mobile engineering. Unlike a website where pushing to `main` updates every visitor in seconds, mobile apps must be compiled into signed iOS and Android binaries, tested on real devices, incremented with strict build numbers, reviewed by Apple and Google, and safely maintained for users running older versions. A repeatable CI/CD and deployment workflow prevents broken signing certificates, accidental staging URLs in production, and stressful manual release nights.

## Introduction

Expo Application Services (EAS) eliminates most of the brittle Xcode and Gradle boilerplate that used to consume days of mobile release engineering. Today you will learn how to structure `eas.json`, generate environment-specific configs with `app.config.ts`, submit builds to App Store Connect and Google Play Console, publish safe over-the-air updates, and wire everything into GitHub Actions.

> **Free to Learn & Practise**: You can complete this entire course without paying for any cloud CI or build tools. EAS offers a **free tier** suitable for learning and hobby builds, and you can also compile native apps completely locally for free using `npx expo run:ios` (macOS + Xcode) and `npx expo run:android` (Android Studio). Paid Apple Developer ($99/year) or Google Play Console ($25 one-time) accounts are only required when you are ready to publish publicly to the official App Store or Google Play Store.

## Concepts

### 1. Web Deployment vs. Mobile App Store Deployment

If you have deployed React web apps (Vercel, Netlify, Cloudflare), mobile deployment introduces a few important differences:

| Aspect | React Web Deployment | React Native / Expo Deployment |
| --- | --- | --- |
| **Build artifact** | Static HTML/CSS/JS bundle | Signed native binaries (`.ipa` for iOS, `.aab` or `.apk` for Android) |
| **Release speed** | Instant on deploy | Store binaries require App Store / Google Play review; JS-only fixes can ship quickly via **EAS Update (OTA)** |
| **Rollbacks** | Redeploy previous commit immediately | You cannot force-downgrade installed native binaries; use staged rollouts and `eas update:republish` for JS rollbacks |
| **Versioning** | Optional git SHA or semver | Strict store rules on both user-facing `version` and monotonically increasing native build numbers |

### 2. EAS Build Profiles (`eas.json`)

An Expo project uses `eas.json` at the project root to define three standard build tracks:

| Profile | Artifact | Distribution | Purpose |
| --- | --- | --- | --- |
| **`development`** | Dev Client (`.app` / `.apk`) | Internal (Simulator / Test Device) | Local development with custom native modules (`expo-dev-client`) |
| **`preview`** | Release-mode `.apk` / TestFlight `.ipa` | Internal (QA, Stakeholders) | Testing realistic production-like builds before store submission |
| **`production`** | Signed `.ipa` / `.aab` (Android App Bundle) | Store (App Store / Google Play) | End-user releases with `autoIncrement: true` |

Key commands:
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Initialize EAS project config
eas build:configure

# Trigger cloud builds (free tier available)
eas build --platform all --profile preview
eas build --platform all --profile production

# Or compile completely locally without cloud build minutes
npx expo run:ios
npx expo run:android
```

### 3. App Store Connect & Google Play Submission (`eas submit`)

Once a production `.ipa` (iOS) and `.aab` (Android App Bundle—required by Google Play instead of `.apk`) finish compiling, `eas submit` uploads them directly to Apple and Google:

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

- **iOS**: Uses an App Store Connect API Key (recommended for CI) or Apple ID credentials to push directly to TestFlight, where you select the build for App Store review.
- **Android**: Uses a Google Play Service Account JSON key (stored as a CI secret, never committed to Git) to upload to the `internal`, `alpha`, `beta`, or `production` track.

### 4. Dynamic Config (`app.config.ts`) & EAS Environment Variables

Static `app.json` cannot easily switch bundle identifiers or API URLs between staging and production. Replacing it with `app.config.ts` lets you read `APP_VARIANT` at build time:

- **Side-by-side installs**: Giving dev (`com.example.app.dev`), preview (`com.example.app.preview`), and production (`com.example.app`) distinct bundle IDs and app names lets QA keep all three versions installed on the same phone simultaneously.
- **EAS Environment Variables**: Store non-secret variables (`EXPO_PUBLIC_API_URL`) and build-time secrets (`SENTRY_AUTH_TOKEN`, `GOOGLE_SERVICES_JSON`) in Expo's dashboard scoped per environment (`development`, `preview`, `production`). Remember: anything prefixed with `EXPO_PUBLIC_` is embedded inside the client bundle—never put private API secrets in `EXPO_PUBLIC_*`.

### 5. Mobile Versioning Rules

Mobile stores enforce strict rules on two distinct version numbers:

1. **User-facing Version (`version`)**: Semantic string like `"1.2.0"` shown in the App Store and Google Play listings.
2. **Native Build Number**:
   - **iOS (`ios.buildNumber` / `CFBundleVersion`)**: String such as `"42"`. Must increase for every upload sharing the same `version`.
   - **Android (`android.versionCode`)**: Strictly increasing positive integer (`42`). Google Play permanently rejects any upload whose `versionCode` was ever used before—even across deleted tracks!

Setting `"appVersionSource": "remote"` and `"autoIncrement": true` in `eas.json` lets EAS track and increment native build numbers automatically in the cloud so teammates never collide on version codes.

### 6. EAS Update (Over-the-Air Updates) & Limitations

**EAS Update** lets you push JavaScript bundle and static asset updates directly to existing users without waiting for App Store or Play Store review:

- **Channels** live inside compiled native binaries (`"channel": "production"`).
- **Branches** hold published JS updates (`eas update --branch production --message "Fix streak banner"`).
- **`runtimeVersion` with `"policy": "fingerprint"`**: Automatically hashes your native dependencies, Expo SDK version, and config plugins. An OTA update is ONLY downloaded by binaries whose native fingerprint matches—preventing crashes from mismatched native modules!

**Strict OTA Limitations (What EAS Update CANNOT Change):**
- Upgrading Expo SDK or React Native versions
- Adding, removing, or upgrading libraries with native iOS/Android code
- Changing native permissions (`Info.plist`, `AndroidManifest.xml`), app icons, splash screen native config, or URL schemes

Any native change requires a fresh `eas build` (or local native rebuild).

### 7. GitHub Actions CI/CD Pipeline

A clean CI workflow validates every Pull Request and automates deployments on merges to `main`:

```yaml
name: Mobile CI & Release
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --ci

  ota-preview:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas update --branch preview --message "${{ github.event.head_commit.message }}" --non-interactive
```

## Code Examples

> **How to use today's examples**: Both files below are **reusable TypeScript configuration & release-helper modules** (not interactive UI screens). Use `dynamicAppConfig.ts` as the pattern for your Expo project's root `app.config.ts`, and mirror `PRODUCTION_EAS_CONFIG` in your root `eas.json`. To preview interactive screens elsewhere in this repository, run `npm start` from the repo root.

### Example 1: Typed EAS Config & Delivery Strategy Helper

- **Type**: Reusable configuration reference & release-helper module
- **Where to place in an Expo project**: Mirror `PRODUCTION_EAS_CONFIG` as JSON in root `eas.json`; place `recommendDeliveryStrategy()` in `scripts/release/` or `src/release/easConfigReference.ts`
- **Full source**: [`./examples/easConfigReference.ts`](./examples/easConfigReference.ts)

Key highlights:
- `PRODUCTION_EAS_CONFIG` models a complete `eas.json` with `development`, `preview`, and `production` profiles plus `submit.production`.
- `recommendDeliveryStrategy()` inspects a release summary and decides whether it can ship via `eas-update` or requires a full `eas-build`.

### Example 2: Dynamic `app.config.ts` Factory

- **Type**: Reusable Expo configuration factory module
- **Where to place in an Expo project**: Root `app.config.ts` (exporting `export default () => createDynamicAppConfig(process.env)`)
- **Full source**: [`./examples/dynamicAppConfig.ts`](./examples/dynamicAppConfig.ts)

Key highlights:
- `createDynamicAppConfig(env)` reads `APP_VARIANT`, appends `.dev` or `.preview` suffixes to bundle IDs and app names, configures `runtimeVersion: { policy: 'fingerprint' }`, and blocks non-HTTPS API URLs in production builds.

## Step-by-Step Explanation

1. **Separate profiles by audience**: Developers use `development` (with `developmentClient: true`), testers install `preview` (`.apk` on Android, internal/TestFlight on iOS), and end users receive `production` (`.aab` + `.ipa`).
2. **Use `fingerprint` runtime versions**: In `dynamicAppConfig.ts`, setting `runtimeVersion: { policy: 'fingerprint' }` guarantees that an OTA update built with a new native library will never accidentally download onto older store binaries and crash them at startup.
3. **Validate production invariants at build time**: Throwing an error in `app.config.ts` if `EXPO_PUBLIC_API_URL` is not `https://` catches misconfigured CI variables before the build even starts.
4. **Automate build number increments**: With `appVersionSource: 'remote'` and `autoIncrement: true`, CI pipelines never fail due to duplicate `versionCode` submissions.

## Expected Output

When you invoke `createDynamicAppConfig()` and `recommendDeliveryStrategy()` during a build or release script, you get deterministic, environment-specific outputs like:

```text
# APP_VARIANT=preview
name: "PulseTrack (Preview)"
ios.bundleIdentifier: "com.example.pulsetrack.preview"
android.package: "com.example.pulsetrack.preview"
scheme: "pulsetrack-preview"
runtimeVersion: { policy: "fingerprint" }

# APP_VARIANT=production + EXPO_PUBLIC_API_URL=http://insecure.local
Error: Production builds must use an HTTPS EXPO_PUBLIC_API_URL.

# recommendDeliveryStrategy({ ..., modifiedJavaScriptOrAssetsOnly: true })
{ strategy: "eas-update", reason: "Pure JavaScript, TypeScript, and static asset changes can ship safely via EAS Update." }

# recommendDeliveryStrategy({ ..., addedNativeDependency: true })
{ strategy: "eas-build", reason: "Adding a library with native iOS/Android modules requires compiling a new binary." }
```

## Common Mistakes

- **Shipping native changes via `eas update`**: Adding a new Expo native module (like `expo-camera`) and publishing an OTA update will crash existing users because the compiled binary lacks that native code. **Fix**: Check whether native dependencies/plugins changed and run `eas build` whenever they do.
- **Committing signing keys or service accounts to Git**: Never commit `.p12`, `.keystore`, `.jks`, or Google Play JSON keys. **Fix**: Let EAS Manage Credentials securely in the cloud and store tokens in GitHub Secrets.
- **Putting private secrets in `EXPO_PUBLIC_*` variables**: Any `EXPO_PUBLIC_` value is inlined into the JavaScript bundle and can be extracted in seconds. **Fix**: Keep private API secrets strictly on your backend.
- **Shipping `.apk` to Google Play production**: Google Play requires `.aab` (`"buildType": "app-bundle"`) for production store releases. **Fix**: Reserve `.apk` for internal `preview` builds and set `"buildType": "app-bundle"` under `production`.
- **Forgetting to test release builds locally**: Debug mode runs with Metro and slower dev checks. **Fix**: Always install and test a `preview` release build on physical iOS and Android devices before submitting to stores.

## Best Practices

- **Gate every PR with CI**: Run `typecheck`, `lint`, and `jest` on every pull request before merging.
- **Promote through tracks**: Upload Android builds to the `internal` track first, verify on real devices, and promote to `production` inside Play Console (or via staged rollouts: 10% → 25% → 50% → 100%).
- **Keep `main` always releasable**: Use feature flags for unfinished work so emergency hotfixes can ship cleanly at any moment.
- **Pin Node and Expo versions**: Use `.nvmrc` (`24`) and commit `package-lock.json` so CI matches local environments identically.
- **Monitor OTA adoption**: After publishing an `eas update`, verify crash-free sessions in your crash reporter before rolling out broadly.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for full requirements, acceptance criteria, and hints, then complete [`./exercises/VersionBumpExercise.ts`](./exercises/VersionBumpExercise.ts):

- **Beginner**: Implement `bumpSemanticVersion()` for `major`, `minor`, and `patch` bumps with strict input validation.
- **Intermediate**: Implement `incrementNativeBuildNumbers()` to bump both `iosBuildNumber` (string) and `androidVersionCode` (positive integer).
- **Challenge**: Implement `determineReleaseStrategy()` to classify a list of changed file paths into `'none'`, `'ota-update'`, or `'native-build'`.

## Solutions

Try implementing all three release helpers in [`./exercises/VersionBumpExercise.ts`](./exercises/VersionBumpExercise.ts) and verifying with `npm run typecheck` before peeking below.

<details>
<summary>Click to view solution notes &amp; links</summary>

Review the full reference implementation in [`./solutions/VersionBumpSolution.ts`](./solutions/VersionBumpSolution.ts):

- `bumpSemanticVersion` validates input against `^(\d+)\.(\d+)\.(\d+)$` and resets lower segments cleanly on `major`/`minor` bumps.
- `incrementNativeBuildNumbers` verifies positive numeric strings for iOS and positive integers for Android before incrementing.
- `determineReleaseStrategy` normalizes Windows/Unix slashes and leading `./`, then checks root native config files (`package.json`, `package-lock.json`, `app.json`, `app.config.ts`, `app.config.js`, `eas.json`) and native directories (`ios/`, `android/`, `plugins/`).

</details>

## Mini Project

**Automated Release Plan Generator**

Combine `dynamicAppConfig.ts` and your `VersionBumpSolution.ts` helpers to write a small TypeScript utility that:
1. Accepts a target `APP_VARIANT`, current semantic version, current native build numbers, and a mock list of changed files.
2. Determines whether the release should run `eas update` or `eas build`.
3. Prints the exact CLI command, bumped version numbers, and generated bundle identifier for the release.

## Key Takeaways

- EAS Build separates `development`, `preview`, and `production` builds cleanly through `eas.json`—and you can practise with EAS's free tier or local `npx expo run:ios` / `npx expo run:android` builds at zero cost.
- `app.config.ts` enables side-by-side environment installs and build-time validation of environment variables.
- Always pair `eas update` with `runtimeVersion: { policy: 'fingerprint' }` and reserve OTA exclusively for JS and asset updates.
- Automated GitHub Actions pipelines turn stressful manual releases into predictable, repeatable engineering workflows.

## Further Reading

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update & Runtime Versions](https://docs.expo.dev/eas-update/introduction/)
- [Environment Variables in EAS](https://docs.expo.dev/eas/environment-variables/)

## Progress Checklist

- [ ] Understood `development`, `preview`, and `production` profiles in `eas.json`
- [ ] Reviewed dynamic `app.config.ts` generation for multi-variant side-by-side installs
- [ ] Learned the exact rules separating `eas update` (OTA) from `eas build` (native binary)
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `VersionBumpExercise.ts`
- [ ] Reviewed the GitHub Actions workflow pattern for CI/CD

## Next Day

Continue to [Day 28: Production Readiness](../day-28-production-readiness/README.md).
