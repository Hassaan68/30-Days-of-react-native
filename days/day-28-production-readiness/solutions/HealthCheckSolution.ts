/**
 * Day 28 Solution: Production Readiness Health Checks
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

const SENSITIVE_KEYS = new Set<string>([
  'password',
  'token',
  'email',
  'phone',
  'authorization',
]);

export function scrubSensitiveFields(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function evaluatePerformanceBudget(
  metrics: AppPerformanceMetrics,
  budget: PerformanceBudget,
): BudgetEvaluation {
  const violations: string[] = [];

  if (metrics.coldStartMs > budget.maxColdStartMs) {
    violations.push(
      `Cold start ${metrics.coldStartMs}ms exceeds budget of ${budget.maxColdStartMs}ms.`,
    );
  }

  if (metrics.jsBundleSizeKb > budget.maxJsBundleSizeKb) {
    violations.push(
      `JS bundle size ${metrics.jsBundleSizeKb}KB exceeds budget of ${budget.maxJsBundleSizeKb}KB.`,
    );
  }

  if (metrics.crashFreeRatePercent < budget.minCrashFreeRatePercent) {
    violations.push(
      `Crash-free rate ${metrics.crashFreeRatePercent}% is below minimum ${budget.minCrashFreeRatePercent}%.`,
    );
  }

  return {
    withinBudget: violations.length === 0,
    violations,
  };
}

export function canShipToStore(checks: readonly StoreGateCheck[]): StoreGateResult {
  if (checks.length === 0) {
    return {
      approved: false,
      blockerIds: [],
      completionPercent: 0,
    };
  }

  const blockerIds: string[] = [];
  let passedCount = 0;

  for (const check of checks) {
    if (check.passed) {
      passedCount += 1;
    } else if (check.required) {
      blockerIds.push(check.id);
    }
  }

  return {
    approved: blockerIds.length === 0,
    blockerIds,
    completionPercent: Math.round((passedCount / checks.length) * 100),
  };
}
