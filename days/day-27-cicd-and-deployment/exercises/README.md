# Day 27 Exercises: CI/CD and App Deployment

Complete the functions in [`VersionBumpExercise.ts`](./VersionBumpExercise.ts). These helpers mirror real release automation scripts run inside GitHub Actions pipelines.

## Beginner: Semantic Version Bumper

Implement `bumpSemanticVersion(currentVersion, releaseType)` so that:
- It parses a `MAJOR.MINOR.PATCH` string (for example, `'1.4.2'`).
- `'patch'` increments patch (`1.4.3`).
- `'minor'` increments minor and resets patch to `0` (`1.5.0`).
- `'major'` increments major and resets minor and patch to `0` (`2.0.0`).
- Throws an `Error` if `currentVersion` is not a valid 3-part non-negative semantic version.

## Intermediate: Native Build Number Incrementer

Implement `incrementNativeBuildNumbers(current)` so that:
- `iosBuildNumber` (a numeric string like `'14'`) is incremented by `1` and returned as a string (`'15'`).
- `androidVersionCode` (a positive integer like `14`) is incremented by `1` (`15`).
- Throws an `Error` if `iosBuildNumber` is not a valid positive integer string or `androidVersionCode` is `< 1`.

## Challenge: OTA vs Native Build Classifier

Implement `determineReleaseStrategy(changedFiles)` so that:
- Given an array of changed repository file paths, it returns `'native-build'` if **any** file touches native configuration or dependencies:
  - `app.json`, `app.config.ts`, `app.config.js`, `eas.json`, `package.json`, `package-lock.json`
  - Any path starting with `ios/`, `android/`, or `plugins/`
- Otherwise, if at least one file changed, it returns `'ota-update'`.
- If `changedFiles` is empty, return `'none'`.

## Checking Your Work

Compare your answers with [`../solutions/VersionBumpSolution.ts`](../solutions/VersionBumpSolution.ts) and run `npm run typecheck`.
