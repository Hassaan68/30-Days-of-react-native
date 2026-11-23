/**
 * Day 27 Example: Dynamic Expo App Configuration (`app.config.ts`)
 *
 * Demonstrates:
 * - Side-by-side installable app variants (development, preview, production)
 * - Distinct bundle identifiers, Android package names, and display names
 * - Fingerprint runtimeVersion policy for safe EAS Update compatibility
 * - Environment variable validation at build time
 */

export type AppVariant = 'development' | 'preview' | 'production';

export interface BuildEnvVariables {
  readonly APP_VARIANT?: string;
  readonly EXPO_PUBLIC_API_URL?: string;
  readonly EAS_PROJECT_ID?: string;
}

export interface DynamicExpoConfig {
  readonly name: string;
  readonly slug: string;
  readonly version: string;
  readonly scheme: string;
  readonly runtimeVersion: {
    readonly policy: 'fingerprint';
  };
  readonly updates: {
    readonly url: string;
  };
  readonly ios: {
    readonly bundleIdentifier: string;
    readonly supportsTablet: boolean;
  };
  readonly android: {
    readonly package: string;
  };
  readonly extra: {
    readonly appVariant: AppVariant;
    readonly apiUrl: string;
    readonly eas: {
      readonly projectId: string;
    };
  };
}

const BASE_NAME = 'PulseTrack';
const BASE_BUNDLE_ID = 'com.example.pulsetrack';
const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

export function resolveAppVariant(rawVariant: string | undefined): AppVariant {
  if (rawVariant === 'development' || rawVariant === 'preview' || rawVariant === 'production') {
    return rawVariant;
  }
  return 'development';
}

export function getVariantSuffix(variant: AppVariant): {
  readonly nameSuffix: string;
  readonly idSuffix: string;
  readonly schemeSuffix: string;
} {
  if (variant === 'development') {
    return { nameSuffix: ' (Dev)', idSuffix: '.dev', schemeSuffix: '-dev' };
  }
  if (variant === 'preview') {
    return { nameSuffix: ' (Preview)', idSuffix: '.preview', schemeSuffix: '-preview' };
  }
  return { nameSuffix: '', idSuffix: '', schemeSuffix: '' };
}

/**
 * Pure configuration factory suitable for `export default () => createDynamicAppConfig(process.env)`
 * inside an Expo project's `app.config.ts`.
 */
export function createDynamicAppConfig(env: BuildEnvVariables): DynamicExpoConfig {
  const variant = resolveAppVariant(env.APP_VARIANT);
  const { nameSuffix, idSuffix, schemeSuffix } = getVariantSuffix(variant);
  const projectId = env.EAS_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
  const apiUrl = env.EXPO_PUBLIC_API_URL?.trim() || 'https://api.dev.pulsetrack.example';

  if (variant === 'production' && !apiUrl.startsWith('https://')) {
    throw new Error('Production builds must use an HTTPS EXPO_PUBLIC_API_URL.');
  }

  return {
    name: `${BASE_NAME}${nameSuffix}`,
    slug: 'pulsetrack',
    version: '1.0.0',
    scheme: `pulsetrack${schemeSuffix}`,
    runtimeVersion: {
      policy: 'fingerprint',
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      bundleIdentifier: `${BASE_BUNDLE_ID}${idSuffix}`,
      supportsTablet: true,
    },
    android: {
      package: `${BASE_BUNDLE_ID}${idSuffix}`,
    },
    extra: {
      appVariant: variant,
      apiUrl,
      eas: {
        projectId,
      },
    },
  };
}
