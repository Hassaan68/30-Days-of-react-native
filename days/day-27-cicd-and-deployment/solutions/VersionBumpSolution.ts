/**
 * Day 27 Solution: Release Versioning & OTA Classification
 */

export type ReleaseBumpType = 'major' | 'minor' | 'patch';

export interface NativeBuildNumbers {
  readonly iosBuildNumber: string;
  readonly androidVersionCode: number;
}

export type ReleaseStrategy = 'none' | 'ota-update' | 'native-build';

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

const NATIVE_ROOT_FILES = new Set<string>([
  'app.json',
  'app.config.ts',
  'app.config.js',
  'eas.json',
  'package.json',
  'package-lock.json',
]);

const NATIVE_PREFIXES = ['ios/', 'android/', 'plugins/'] as const;

export function bumpSemanticVersion(
  currentVersion: string,
  releaseType: ReleaseBumpType,
): string {
  const match = SEMVER_REGEX.exec(currentVersion.trim());
  if (!match) {
    throw new Error(`Invalid semantic version "${currentVersion}". Expected MAJOR.MINOR.PATCH.`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  if (releaseType === 'major') {
    return `${major + 1}.0.0`;
  }
  if (releaseType === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

export function incrementNativeBuildNumbers(
  current: NativeBuildNumbers,
): NativeBuildNumbers {
  if (!/^\d+$/.test(current.iosBuildNumber.trim())) {
    throw new Error(`Invalid iOS build number "${current.iosBuildNumber}".`);
  }

  const parsedIos = Number(current.iosBuildNumber);
  if (parsedIos < 1) {
    throw new Error('iOS build number must be >= 1.');
  }

  if (!Number.isInteger(current.androidVersionCode) || current.androidVersionCode < 1) {
    throw new Error('Android versionCode must be a positive integer.');
  }

  return {
    iosBuildNumber: String(parsedIos + 1),
    androidVersionCode: current.androidVersionCode + 1,
  };
}

export function determineReleaseStrategy(changedFiles: readonly string[]): ReleaseStrategy {
  if (changedFiles.length === 0) {
    return 'none';
  }

  for (const rawPath of changedFiles) {
    const normalized = rawPath.replace(/\\/g, '/').replace(/^\.\//, '');

    if (NATIVE_ROOT_FILES.has(normalized)) {
      return 'native-build';
    }

    if (NATIVE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
      return 'native-build';
    }
  }

  return 'ota-update';
}
