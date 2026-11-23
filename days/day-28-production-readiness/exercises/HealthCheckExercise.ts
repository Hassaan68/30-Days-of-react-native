/**
 * Day 28 Starter Exercise: Production Readiness Health Checks
 *
 * Complete each TODO while preserving all exported types and signatures.
 */

export interface AppPerformanceMetrics {
  readonly coldStartMs: number;
  readonly jsBundleSizeKb: number;
  readonly crashFreeRatePercent: number;
}

export interface PerformanceBudget {
  readonly maxColdStartMs: number;
  readonly maxJsBundleSizeKb: number;
  readonly minCrashFreeRatePercent: number;
}

export interface BudgetEvaluation {
  readonly withinBudget: boolean;
  readonly violations: readonly string[];
}

export interface StoreGateCheck {
  readonly id: string;
  readonly required: boolean;
  readonly passed: boolean;
}

export interface StoreGateResult {
  readonly approved: boolean;
  readonly blockerIds: readonly string[];
  readonly completionPercent: number;
}

/**
 * Beginner Exercise:
 * Return a shallow copy of `payload` where sensitive keys
 * ('password', 'token', 'email', 'phone', 'authorization' - case-insensitive)
 * are replaced with '[REDACTED]'.
 */
export function scrubSensitiveFields(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  // TODO: Copy payload and redact sensitive keys case-insensitively.
  return { ...payload };
}

/**
 * Intermediate Exercise:
 * Compare runtime performance metrics against the target budget and list any violations.
 */
export function evaluatePerformanceBudget(
  _metrics: AppPerformanceMetrics,
  _budget: PerformanceBudget,
): BudgetEvaluation {
  // TODO: Check coldStartMs, jsBundleSizeKb, and crashFreeRatePercent against budget limits.
  return {
    withinBudget: false,
    violations: ['Not implemented yet'],
  };
}

/**
 * Challenge Exercise:
 * Determine if an app release is approved for store submission based on required checks.
 */
export function canShipToStore(_checks: readonly StoreGateCheck[]): StoreGateResult {
  // TODO: Compute blockerIds, completionPercent, and approved flag.
  return {
    approved: false,
    blockerIds: [],
    completionPercent: 0,
  };
}
