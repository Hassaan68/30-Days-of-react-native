/**
 * Day 27 Example: Typed EAS Build & Submit Configuration Reference
 *
 * Mirrors a production-ready `eas.json` configuration for Expo SDK 58+
 * with development, preview (internal distribution), and production profiles,
 * plus a helper that determines whether a change can ship via EAS Update (OTA)
 * or requires a new native binary build.
 */

export type BuildProfileName = 'development' | 'preview' | 'production';
export type DistributionType = 'internal' | 'store';
export type AndroidBuildType = 'apk' | 'app-bundle';

export interface EasBuildProfile {
  readonly developmentClient?: boolean;
  readonly distribution: DistributionType;
  readonly channel: string;
  readonly autoIncrement?: boolean;
  readonly environment?: 'development' | 'preview' | 'production';
  readonly ios?: {
    readonly simulator?: boolean;
    readonly resourceClass?: 'm-medium' | 'm-large';
  };
  readonly android?: {
    readonly buildType: AndroidBuildType;
  };
}

export interface EasSubmitProfile {
  readonly ios: {
    readonly ascAppId: string;
    readonly appleTeamId: string;
  };
  readonly android: {
    readonly serviceAccountKeyPath: string;
    readonly track: 'internal' | 'alpha' | 'beta' | 'production';
  };
}

export interface EasConfig {
  readonly cli: {
    readonly version: string;
    readonly appVersionSource: 'remote' | 'local';
  };
  readonly build: Record<BuildProfileName, EasBuildProfile>;
  readonly submit: {
    readonly production: EasSubmitProfile;
  };
}

export const PRODUCTION_EAS_CONFIG: EasConfig = {
  cli: {
    version: '>= 16.0.0',
    appVersionSource: 'remote',
  },
  build: {
    development: {
      developmentClient: true,
      distribution: 'internal',
      channel: 'development',
      environment: 'development',
      ios: {
        simulator: true,
      },
      android: {
        buildType: 'apk',
      },
    },
    preview: {
      distribution: 'internal',
      channel: 'preview',
      environment: 'preview',
      android: {
        buildType: 'apk',
      },
    },
    production: {
      distribution: 'store',
      channel: 'production',
      environment: 'production',
      autoIncrement: true,
      android: {
        buildType: 'app-bundle',
      },
    },
  },
  submit: {
    production: {
      ios: {
        ascAppId: '1234567890',
        appleTeamId: 'ABCD1234EF',
      },
      android: {
        serviceAccountKeyPath: './secrets/google-play-service-account.json',
        track: 'internal',
      },
    },
  },
};

export interface ReleaseChangeSummary {
  readonly modifiedNativePlugins: boolean;
  readonly upgradedExpoSdk: boolean;
  readonly modifiedPermissions: boolean;
  readonly addedNativeDependency: boolean;
  readonly modifiedJavaScriptOrAssetsOnly: boolean;
}

export interface DeliveryRecommendation {
  readonly strategy: 'eas-update' | 'eas-build';
  readonly reason: string;
}

/**
 * Determines whether a release can be delivered over-the-air via `eas update`
 * or must be compiled as a new native binary via `eas build`.
 */
export function recommendDeliveryStrategy(
  changes: ReleaseChangeSummary,
): DeliveryRecommendation {
  if (changes.upgradedExpoSdk) {
    return {
      strategy: 'eas-build',
      reason: 'Upgrading the Expo SDK changes native runtime code and invalidates the runtime fingerprint.',
    };
  }
  if (changes.addedNativeDependency) {
    return {
      strategy: 'eas-build',
      reason: 'Adding a library with native iOS/Android modules requires compiling a new binary.',
    };
  }
  if (changes.modifiedNativePlugins || changes.modifiedPermissions) {
    return {
      strategy: 'eas-build',
      reason: 'Config plugins and Info.plist / AndroidManifest.xml permissions are baked into the native binary.',
    };
  }
  if (changes.modifiedJavaScriptOrAssetsOnly) {
    return {
      strategy: 'eas-update',
      reason: 'Pure JavaScript, TypeScript, and static asset changes can ship safely via EAS Update.',
    };
  }
  return {
    strategy: 'eas-build',
    reason: 'Defaulting to a full native build when change scope is uncertain.',
  };
}
