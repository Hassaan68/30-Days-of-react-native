/**
 * Day 28 Example: Pre-Release & Store Submission Audit Model
 *
 * Demonstrates a programmatic release readiness checklist covering:
 * - Performance & bundle optimization (Hermes, Android R8 minification, cold start)
 * - Observability (crash reporting, uploaded source maps)
 * - Security & dependency hygiene (expo-doctor, audit, secrets)
 * - App Store & Google Play compliance (privacy labels, account deletion, review credentials)
 */

export type ChecklistCategory =
  | 'performance'
  | 'observability'
  | 'quality'
  | 'security'
  | 'store-compliance';

export interface ReleaseCheckItem {
  readonly id: string;
  readonly category: ChecklistCategory;
  readonly title: string;
  readonly required: boolean;
  readonly passed: boolean;
}

export interface ReleaseAuditSummary {
  readonly readyToSubmit: boolean;
  readonly passedCount: number;
  readonly totalCount: number;
  readonly completionPercent: number;
  readonly blockingItems: readonly ReleaseCheckItem[];
  readonly optionalWarnings: readonly ReleaseCheckItem[];
}

export const DEFAULT_PRODUCTION_CHECKLIST: readonly ReleaseCheckItem[] = [
  {
    id: 'perf-hermes-r8',
    category: 'performance',
    title: 'Verified release build uses Hermes bytecode and Android R8 minification',
    required: true,
    passed: true,
  },
  {
    id: 'perf-cold-start',
    category: 'performance',
    title: 'Cold start time measured under 2.0 seconds on mid-range physical Android & iOS devices',
    required: true,
    passed: true,
  },
  {
    id: 'obs-sourcemaps',
    category: 'observability',
    title: 'Crash reporting (Sentry / Crashlytics) configured with automatic source map uploads',
    required: true,
    passed: true,
  },
  {
    id: 'quality-gates',
    category: 'quality',
    title: 'Strict TypeScript, ESLint, Prettier, Jest tests, and npx expo-doctor all pass',
    required: true,
    passed: true,
  },
  {
    id: 'security-secrets',
    category: 'security',
    title: 'Zero secrets in client bundle; auth tokens stored in expo-secure-store',
    required: true,
    passed: true,
  },
  {
    id: 'store-account-deletion',
    category: 'store-compliance',
    title: 'In-app account deletion flow implemented and tested (required by Apple & Google)',
    required: true,
    passed: true,
  },
  {
    id: 'store-privacy-labels',
    category: 'store-compliance',
    title: 'App Store Privacy Nutrition Labels & Google Play Data Safety form completed accurately',
    required: true,
    passed: true,
  },
  {
    id: 'store-demo-account',
    category: 'store-compliance',
    title: 'Working demo credentials provided in App Review Notes for gated features',
    required: true,
    passed: true,
  },
  {
    id: 'store-localized-screenshots',
    category: 'store-compliance',
    title: 'Localized store screenshots prepared for all supported languages',
    required: false,
    passed: false,
  },
];

export function evaluateReleaseReadiness(
  items: readonly ReleaseCheckItem[],
): ReleaseAuditSummary {
  const totalCount = items.length;
  const passedCount = items.filter((item) => item.passed).length;
  const blockingItems = items.filter((item) => item.required && !item.passed);
  const optionalWarnings = items.filter((item) => !item.required && !item.passed);
  const completionPercent = totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);

  return {
    readyToSubmit: totalCount > 0 && blockingItems.length === 0,
    passedCount,
    totalCount,
    completionPercent,
    blockingItems,
    optionalWarnings,
  };
}
