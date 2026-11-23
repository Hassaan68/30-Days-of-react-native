# Day 27 Exercises: CI/CD and App Deployment

## How to Practise

1. Open the starter file [`VersionBumpExercise.ts`](./VersionBumpExercise.ts) and complete each `// TODO:` without changing the exported types or function signatures.
2. Verify strict TypeScript compilation and linting from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   ```
3. Optional: Write a small Jest test or release dry-run script importing your functions to verify invalid version strings, build number increments, and Windows vs. Unix file paths.

---

## Beginner: Semantic Version Bumper

### Requirements

Implement `bumpSemanticVersion(currentVersion, releaseType)` so that:
- It trims and parses a `MAJOR.MINOR.PATCH` string (for example, `'1.4.2'`).
- `'patch'` increments patch (`'1.4.3'`).
- `'minor'` increments minor and resets patch to `0` (`'1.5.0'`).
- `'major'` increments major and resets minor and patch to `0` (`'2.0.0'`).
- Throws an `Error` if `currentVersion` is not a valid 3-part non-negative semantic version (for example, `'1.2'`, `'v1.2.3'`, or `'-1.0.0'`).

### Acceptance Criteria

- [ ] `'1.4.2'` + `'patch'` returns `'1.4.3'`.
- [ ] `'1.4.2'` + `'minor'` returns `'1.5.0'`.
- [ ] `'1.4.2'` + `'major'` returns `'2.0.0'`.
- [ ] Throws an `Error` for malformed inputs such as `'1.2'`, `'1.2.3.4'`, `'abc'`, or `''`.

### Expected Behavior

```ts
bumpSemanticVersion('1.4.2', 'patch') // -> '1.4.3'
bumpSemanticVersion('1.4.2', 'minor') // -> '1.5.0'
bumpSemanticVersion('1.4.2', 'major') // -> '2.0.0'
bumpSemanticVersion('v1.4.2', 'patch') // -> throws Error
```

<details>
<summary>Hint</summary>

Match `currentVersion.trim()` against `/^(\d+)\.(\d+)\.(\d+)$/`. Convert capture groups `match[1]`, `match[2]`, and `match[3]` with `Number(...)`, then branch on `releaseType`.

</details>

---

## Intermediate: Native Build Number Incrementer

### Requirements

Implement `incrementNativeBuildNumbers(current)` so that:
- `iosBuildNumber` (a positive integer string like `'14'`) is incremented by `1` and returned as a string (`'15'`).
- `androidVersionCode` (a positive integer like `14`) is incremented by `1` (`15`).
- Throws an `Error` if `iosBuildNumber` is not a positive integer string (`'0'`, `'-2'`, `'1.5'`, `'abc'`) or if `androidVersionCode` is not an integer `>= 1`.

### Acceptance Criteria

- [ ] Returns `{ iosBuildNumber: '15', androidVersionCode: 15 }` for `{ iosBuildNumber: '14', androidVersionCode: 14 }`.
- [ ] Throws an `Error` when `iosBuildNumber` is `'0'`, `'1.2'`, or non-numeric.
- [ ] Throws an `Error` when `androidVersionCode` is `0`, `-1`, or `1.5`.
- [ ] Does not mutate the input object.

### Expected Behavior

```ts
incrementNativeBuildNumbers({ iosBuildNumber: '14', androidVersionCode: 14 })
// -> { iosBuildNumber: '15', androidVersionCode: 15 }

incrementNativeBuildNumbers({ iosBuildNumber: '0', androidVersionCode: 14 })
// -> throws Error
```

<details>
<summary>Hint</summary>

Validate `iosBuildNumber` with `/^\d+$/.test(current.iosBuildNumber.trim())` and confirm `Number(current.iosBuildNumber) >= 1`. Validate `androidVersionCode` with `Number.isInteger(current.androidVersionCode) && current.androidVersionCode >= 1`.

</details>

---

## Challenge: OTA vs. Native Build Classifier

### Requirements

Implement `determineReleaseStrategy(changedFiles)` so that:
- If `changedFiles` is empty, return `'none'`.
- Normalize Windows backslashes (`\`) to forward slashes (`/`) and strip any leading `./`.
- Return `'native-build'` if **any** path touches native configuration, dependencies, or native directories:
  - Root files: `app.json`, `app.config.ts`, `app.config.js`, `eas.json`, `package.json`, `package-lock.json`
  - Directories: any path starting with `ios/`, `android/`, or `plugins/`
- Otherwise (pure TypeScript/JavaScript/asset changes), return `'ota-update'`.

### Acceptance Criteria

- [ ] Returns `'none'` for `[]`.
- [ ] Returns `'ota-update'` when only files like `src/screens/HomeScreen.tsx` or `assets/logo.png` changed.
- [ ] Returns `'native-build'` when `package.json`, `./app.config.ts`, `eas.json`, `ios/AppDelegate.swift`, or `android\\build.gradle` is present in `changedFiles`.

### Expected Behavior

```ts
determineReleaseStrategy([]) // -> 'none'
determineReleaseStrategy(['src/screens/HomeScreen.tsx', 'assets/icon.png']) // -> 'ota-update'
determineReleaseStrategy(['src/screens/HomeScreen.tsx', 'package.json']) // -> 'native-build'
determineReleaseStrategy(['.\\plugins\\withCustomPlist.ts']) // -> 'native-build'
```

<details>
<summary>Hint</summary>

Normalize each path with `rawPath.replace(/\\/g, '/').replace(/^\.\//, '')`. Check membership against a `Set` of root native filenames and `['ios/', 'android/', 'plugins/'].some((prefix) => normalized.startsWith(prefix))`.

</details>

---

## Solutions (Open Only After Trying)

<details>
<summary>Click to reveal solution link</summary>

Compare your answers with [`../solutions/VersionBumpSolution.ts`](../solutions/VersionBumpSolution.ts), then re-run `npm run typecheck && npm run lint`.

</details>
