/**
 * Day 27 Starter Exercise: Release Versioning & OTA Classification
 *
 * Fill in each TODO below while keeping all exported types and signatures intact.
 */

export type ReleaseBumpType = 'major' | 'minor' | 'patch';

export interface NativeBuildNumbers {
  readonly iosBuildNumber: string;
  readonly androidVersionCode: number;
}

export type ReleaseStrategy = 'none' | 'ota-update' | 'native-build';

/**
 * Beginner Exercise:
 * Bump a MAJOR.MINOR.PATCH semantic version string.
 * Throw an Error if `currentVersion` is invalid.
 */
export function bumpSemanticVersion(
  currentVersion: string,
  _releaseType: ReleaseBumpType,
): string {
  // TODO: Parse MAJOR.MINOR.PATCH, validate non-negative integers, and bump according to releaseType.
  return currentVersion;
}

/**
 * Intermediate Exercise:
 * Increment both iOS CFBundleVersion (string) and Android versionCode (integer) by 1.
 * Throw an Error if either current value is invalid.
 */
export function incrementNativeBuildNumbers(
  current: NativeBuildNumbers,
): NativeBuildNumbers {
  // TODO: Validate and increment iosBuildNumber and androidVersionCode.
  return current;
}

/**
 * Challenge Exercise:
 * Inspect changed repository paths to decide whether a CI pipeline can publish
 * an EAS Update (`'ota-update'`) or must trigger an EAS Build (`'native-build'`).
 * Return `'none'` if `changedFiles` is empty.
 */
export function determineReleaseStrategy(_changedFiles: readonly string[]): ReleaseStrategy {
  // TODO: Return 'none', 'native-build', or 'ota-update' based on changed file paths.
  return 'none';
}
