# Day 28: Production Readiness

## Learning Objectives

By the end of Day 28, you will be able to:

- Audit mobile app startup speed, bundle size, Hermes bytecode precompilation, and Android R8 minification.
- Integrate crash reporting (Sentry / Firebase Crashlytics) with readable stack traces via uploaded source maps and dSYMs.
- Design a privacy-respecting analytics event taxonomy with explicit consent gating and PII-free structured logging.
- Maintain dependency hygiene and automated code quality gates (`npx expo-doctor`, lockfiles, strict TypeScript, ESLint, Prettier, Jest).
- Execute a thorough Pre-Release and App Store / Google Play Store Submission Checklist without preventable review rejections.

## Prerequisites

- [Day 16: Lists and Performance](../day-16-lists-and-performance/README.md)
- [Day 20: Testing](../day-20-testing/README.md)
- [Day 23: Security](../day-23-security/README.md)
- [Day 24: Debugging and DevTools](../day-24-debugging-and-devtools/README.md)
- [Day 27: CI/CD and App Deployment](../day-27-cicd-and-deployment/README.md)

## Why This Concept Matters

On the web, if a production bug slips out, you can revert a deploy and fix everyone's session in two minutes. On mobile, a crash at startup, a leaked token in logs, or a missing account-deletion screen can cause App Store rejections, 1-star reviews, and broken binaries sitting on users' phones for weeks. Production readiness is the engineering discipline that catches performance regressions, observability blind spots, privacy violations, and store-policy blockers **before** real users ever tap your app icon.

## Introduction

Passing unit tests and running smoothly on a developer's M-series MacBook Simulator does not mean an app is production-ready. Real production apps run on 4-year-old Android phones with low memory, encounter unexpected server payloads, must protect user privacy under GDPR/CCPA, and must satisfy strict Apple App Store and Google Play review guidelines.

Today is your pre-flight engineering inspection. You will learn how to measure what matters before launch, catch crashes the moment they happen in the wild, keep user data clean and private, and clear Apple and Google store reviews on your very first submission.

## Concepts

### 1. Web Launch vs. Mobile Production Launch

| Readiness Area | React Web | React Native / Expo |
| --- | --- | --- |
| **Runtime profiling** | Chrome DevTools against production build | Always profile a **release build** on a physical mid-range Android phone and an iPhone (never `__DEV__` mode) |
| **Crash debugging** | Browser source maps | Upload both JS/Hermes source maps and native debug symbols (iOS dSYMs, Android ProGuard/R8 mappings) |
| **Store compliance** | No central app reviewer | Mandatory Apple App Store & Google Play checks: in-app account deletion, privacy nutrition labels, demo credentials, clear permission copy |
| **Rollout safety** | Instant rollback | Phased releases (iOS 7-day rollout) and staged rollouts (Android 10% → 100%) to catch spikes early |

### 2. App Performance Auditing

Before submitting to the stores, always measure a **release build** (never debug mode!) on a physical mid-range Android phone and an iPhone:

- **Cold Start Time**: Aim for under 2 seconds from tap to interactive first screen. Defer heavy non-critical work (analytics SDK warm-up, background syncing, large image prefetches) until after the first screen renders.
- **Hermes Bytecode Precompilation**: React Native 0.88 and Expo SDK 58 use **Hermes**, a lightweight mobile JavaScript engine that **precompiles JavaScript into compact Hermes bytecode (`.hbc`) at build time**, which is then executed by the Hermes bytecode virtual machine on the device. Because the device loads precompiled `.hbc` bytecode directly instead of parsing and compiling raw JS source at startup, cold start time and memory usage drop substantially (note that Hermes executes `.hbc` bytecode in its VM rather than compiling JavaScript into native CPU machine code like a conventional native AOT compiler).
- **Android R8 Minification**: Enabled by default in React Native 0.88 / Expo SDK 58 release builds, R8 shrinks unused Java/Kotlin bytecode and obfuscates native classes, reducing `.aab` download size significantly. Always test your release `.aab` / `.apk` to ensure third-party native SDKs don't require custom ProGuard/R8 keep rules.
- **Bundle Size Auditing**: Run `npx expo export --platform ios` (or inspect source-map-explorer / `npx react-native-bundle-visualizer`) to spot accidental giant dependencies (e.g., importing an entire icon set or full date/locale library when you only needed one helper).

### 3. Crash Reporting & Source Maps

Without crash reporting, your first warning of a production crash is a 1-star App Store review.

- **Sentry (`@sentry/react-native`)** or **Firebase Crashlytics** capture unhandled JavaScript exceptions, native Objective-C/Swift/Kotlin crashes, breadcrumbs (navigation history, network requests), and device metadata.
- **Source Maps & Debug Symbols (dSYMs / ProGuard mappings)**: Production JavaScript is minified and precompiled into Hermes `.hbc` bytecode. Configure the Sentry Expo plugin (or EAS Build hooks) to automatically upload source maps and native symbols on every release build so stack traces show exact TypeScript file names and line numbers instead of `index.android.bundle:1:482910`.
- **Release Tagging**: Tag every crash event with `appVersion + buildNumber` and EAS Update ID so you can immediately tell whether a hotfix resolved the spike.

### 4. Privacy-Respecting Analytics & Structured Logging

Collect only the minimum product metrics needed to improve the user experience:

- **Typed Event Taxonomy**: Define a central `AnalyticsEventMap` using consistent `object_action` naming (e.g., `habit_completed`, `screen_viewed`, `focus_session_finished`) so dashboards never fragment into `HabitDone`, `habit_complete`, and `completedHabit`.
- **Consent Gating**: Respect user opt-out preferences and iOS App Tracking Transparency (ATT) rules. Gate tracking inside your wrapper so individual screens cannot bypass consent.
- **Zero PII in Logs & Analytics**: Automatically strip or redact keys like `email`, `password`, `token`, `phone`, and `authorization`—and regex-scrub email addresses from free-form log strings. Never log raw JWTs or request headers.

### 5. Dependency Hygiene & Quality Gates

Run these checks automatically in CI before cutting every release:

```bash
# Check Expo SDK alignment, native config issues, and mismatched packages
npx expo-doctor

# Inspect known security vulnerabilities in dependencies
npm audit --omit=dev

# Enforce strict types, lint rules, formatting, and unit tests
npm run typecheck
npm run lint
npm run format:check
npm test
```

- Commit `package-lock.json` so every developer and CI runner installs identical dependency trees.
- Avoid abandoned packages that have not been updated for React Native's New Architecture.

### 6. Pre-Release & App Store / Google Play Submission Checklist

Apple and Google reject thousands of apps every week for avoidable administrative omissions. Verify every item below before clicking **Submit for Review**:

#### Technical Pre-Release
- [ ] Tested release (`preview`) builds on physical iOS and Android devices (not just simulators)
- [ ] Tested offline mode, slow 3G connections, and empty/error states
- [ ] Verified deep links, push notifications, and permission denial flows ("Don't Allow" gracefully degrades)
- [ ] Confirmed Error Boundary catches unexpected render errors and offers a "Reload" recovery action
- [ ] Verified screen readers (VoiceOver / TalkBack) and dynamic font scaling (200% text size)

#### App Store & Google Play Compliance
- [ ] **Account Deletion**: If your app lets users create an account, both Apple and Google **mandate** an easy-to-find in-app account deletion flow (not just "email support").
- [ ] **Privacy Nutrition Labels & Data Safety Form**: Accurately declare every data type collected by your app *and* its third-party SDKs (analytics, crash reporters).
- [ ] **Privacy Policy & Support URLs**: Hosted on live HTTPS pages linked both in store metadata and inside app Settings.
- [ ] **Review Test Credentials**: Provide a working demo email/password (or bypass OTP code) in App Store Review Notes / Play Console App Access so reviewers can test authenticated screens.
- [ ] **Accurate Permission Strings**: Explain *why* you need Camera, Location, or Notifications in plain English (`NSCameraUsageDescription`, etc.)—generic strings like `"Camera access"` get rejected by Apple.
- [ ] **Store Assets**: High-resolution screenshots matching required iPhone/iPad/Android aspect ratios, clean app icon without alpha transparency on iOS, and accurate age rating questionnaire.

## Code Examples

> **How to use today's examples**: Both files below are **reusable TypeScript observability & release-audit modules** (not standalone screens). Place `analyticsTracker.ts` in `src/services/` and wire it into your app shell and screens, and use `releaseChecklist.ts` in `scripts/release/` or CI pre-flight checks. To preview interactive screens in this repository, run `npm start` from the repo root.

### Example 1: Privacy-Respecting Analytics & Structured Logger

- **Type**: Reusable service/observability module
- **Where to place in an Expo project**: `src/services/analyticsTracker.ts`
- **Full source**: [`./examples/analyticsTracker.ts`](./examples/analyticsTracker.ts)

Key highlights:
- `AnalyticsEventMap` enforces exact event names and property shapes at compile time.
- `AnalyticsTracker` blocks all events until `setConsentGranted(true)` is called.
- `sanitizeProperties()` redacts blocked PII keys and scrubs embedded email addresses from string values.
- `createStructuredLogger()` emits level-filtered JSON log entries to any sink (console in dev, crash breadcrumb transport in production).

### Example 2: Programmatic Release Readiness Audit

- **Type**: Reusable release-audit module
- **Where to place in an Expo project**: `scripts/release/releaseChecklist.ts` (or `src/release/releaseChecklist.ts`)
- **Full source**: [`./examples/releaseChecklist.ts`](./examples/releaseChecklist.ts)

Key highlights:
- `DEFAULT_PRODUCTION_CHECKLIST` codifies technical and store-compliance gates.
- `evaluateReleaseReadiness()` distinguishes hard blockers (`required: true`) from optional recommendations (`required: false`).

## Step-by-Step Explanation

1. **Enforce event schemas with TypeScript generics**: `track<TEvent extends AnalyticsEventName>(event: TEvent, properties: AnalyticsEventMap[TEvent])` makes it impossible to fire an unregistered event or omit a required property.
2. **Defense-in-depth PII scrubbing**: Even if a developer accidentally passes `{ email: 'alex@example.com' }` into a log context, `sanitizeProperties` normalizes keys (`access_token` → `accesstoken`) and replaces both blocked keys and email substrings with `[REDACTED]` / `[REDACTED_EMAIL]` before data leaves the device.
3. **Separate hard blockers from warnings**: In `releaseChecklist.ts`, missing localized screenshots produces an `optionalWarning`, while missing account deletion or failing `expo-doctor` sets `readyToSubmit: false`.

## Expected Output

When you run `AnalyticsTracker`, `createStructuredLogger`, and `evaluateReleaseReadiness` against sample inputs, you observe cleanly scrubbed telemetry and a clear pass/block release report:

```text
# AnalyticsTracker before consent:
tracker.track('habit_completed', { habitCategory: 'focus', currentStreak: 5 })
// -> false (blocked until user grants consent)

# StructuredLogger with accidental PII:
logger.warn('Failed login for alex@example.com', { access_token: 'secret-jwt', attempt: 3 })
// -> {
//      level: 'warn',
//      message: 'Failed login for [REDACTED_EMAIL]',
//      context: { access_token: '[REDACTED]', attempt: 3 },
//      timestampIso: '2026-11-23T12:00:00.000Z'
//    }

# evaluateReleaseReadiness(DEFAULT_PRODUCTION_CHECKLIST):
// -> {
//      readyToSubmit: true,
//      passedCount: 8,
//      totalCount: 9,
//      completionPercent: 89,
//      blockingItems: [],
//      optionalWarnings: [{ id: 'store-localized-screenshots', ... }]
//    }
```

## Common Mistakes

- **Benchmarking in `__DEV__` mode**: Debug builds disable optimizations, run dev assertions, and talk to Metro—making startup and animations appear 3–5× slower than reality. **Fix**: Always measure cold start and FPS on a release/`preview` build on physical hardware.
- **Forgetting to upload source maps**: Discovering your first production crash only to see unreadable minified offsets wastes hours during an active incident. **Fix**: Configure the Sentry Expo plugin or EAS build hook to upload source maps and dSYMs automatically on every release build.
- **Skipping the in-app account deletion requirement**: One of the #1 causes of first-time iOS App Store rejections for apps with sign-up flows. **Fix**: Add a clear, tested Delete Account action inside Settings before submitting.
- **Leaving `console.log` statements dumping full API responses**: Logging raw responses slows the JS thread and can leak user tokens into device logs (`logcat` / Xcode console). **Fix**: Route all logging through a sanitized structured logger with `minLevel: 'warn'` in production.
- **Submitting without test credentials**: If reviewers hit a login screen with no demo account, they reject the submission immediately under Guideline 2.1 (App Completeness). **Fix**: Include working demo credentials in App Review Notes and Play Console App Access.

## Best Practices

- **Roll out gradually**: Use Google Play Staged Rollouts (10% → 25% → 50% → 100%) and App Store Phased Releases (7-day rollout) so you can pause immediately if crash rates climb.
- **Target >= 99.5% crash-free sessions**: Track crash-free user rate as a first-class engineering health metric.
- **Maintain a runbook**: Document how to pause a phased rollout, roll back an EAS Update (`eas update:republish`), and rotate leaked API keys before launch day.
- **Run `npx expo-doctor` before every SDK upgrade or release cut**: It catches subtle config plugin mismatches and duplicate native module versions early.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) for full requirements, acceptance criteria, and hints, then complete [`./exercises/HealthCheckExercise.ts`](./exercises/HealthCheckExercise.ts):

- **Beginner**: Implement `scrubSensitiveFields()` to redact sensitive keys case-insensitively without mutating the input object.
- **Intermediate**: Implement `evaluatePerformanceBudget()` to validate cold start time, bundle size, and crash-free session rate against production budgets.
- **Challenge**: Implement `canShipToStore()` to verify all required compliance gates and compute completion percentage plus failed blocker IDs.

## Solutions

Try implementing all three audit helpers in [`./exercises/HealthCheckExercise.ts`](./exercises/HealthCheckExercise.ts) and verifying with `npm run typecheck` before revealing the solution notes below.

<details>
<summary>Click to view solution notes &amp; links</summary>

Compare your work with [`./solutions/HealthCheckSolution.ts`](./solutions/HealthCheckSolution.ts):

- `scrubSensitiveFields` uses a lowercase `Set` of blocked keys (`password`, `token`, `email`, `phone`, `authorization`) and builds a clean copied object without mutating the original.
- `evaluatePerformanceBudget` evaluates each threshold independently so engineers receive every violation in one pass instead of fixing them one by one.
- `canShipToStore` handles empty arrays safely (returning `approved: false`, `completionPercent: 0`), aggregates failed required check IDs, and approves submission only when zero blockers remain.

</details>

## Mini Project

**Launch Readiness CLI Report**

Create a TypeScript check script combining `releaseChecklist.ts` and `HealthCheckSolution.ts` that:
1. Evaluates a mock release's performance metrics (`coldStartMs`, `jsBundleSizeKb`, `crashFreeRatePercent`) against a strict production budget.
2. Evaluates `DEFAULT_PRODUCTION_CHECKLIST` with one intentionally failing required check (for example, `store-account-deletion`).
3. Prints a clear human-readable pre-flight report showing `APPROVED` or `BLOCKED` along with every blocker and violation.

## Key Takeaways

- Always profile release builds on physical devices—Hermes bytecode precompilation (`.hbc` executed by the Hermes bytecode VM) and Android R8 minification make a major difference.
- Crash reporting is only useful when source maps and native debug symbols are uploaded automatically for every build.
- Gate analytics behind user consent and scrub PII defensively at the logging boundary.
- Treat App Store and Google Play compliance (account deletion, privacy labels, demo credentials, clear permission copy) as engineering requirements, not last-minute paperwork.

## Further Reading

- [Expo Pre-Submission & App Store Deployment Guide](https://docs.expo.dev/submit/ios/)
- [Expo Doctor & Troubleshooting](https://docs.expo.dev/develop/tools/#expo-doctor)
- [React Native Using Hermes Guide](https://reactnative.dev/docs/hermes)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Sentry for Expo Documentation](https://docs.expo.dev/guides/using-sentry/)

## Progress Checklist

- [ ] Reviewed release performance auditing (cold start, bundle size, Hermes bytecode precompilation, Android R8)
- [ ] Studied typed, consent-gated analytics and PII-free logging in `analyticsTracker.ts`
- [ ] Reviewed every item in the Pre-Release and Store Submission Checklists
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `HealthCheckExercise.ts`
- [ ] Verified solutions against `HealthCheckSolution.ts`

## Next Day

Continue to [Day 29: Build a Complete Production-Style App](../day-29-production-mobile-app/README.md).
