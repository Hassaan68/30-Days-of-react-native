/**
 * Day 26 Starter Exercise: Reconnection Backoff & Real-Time State Merging
 *
 * Fill in each TODO below without changing the exported function signatures.
 */

export interface BackoffConfig {
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitterRatio?: number;
}

export interface ChatMessage {
  readonly id: string;
  readonly senderName: string;
  readonly text: string;
  readonly sentAt: string;
  readonly updatedAt: string;
}

/**
 * Beginner Exercise:
 * Calculate exponential backoff delay with a ceiling and optional jitter.
 *
 * Formula:
 * - normalizedAttempt = Math.max(1, attempt)
 * - capped = Math.min(baseDelayMs * 2^(normalizedAttempt - 1), maxDelayMs)
 * - jitter = Math.round(capped * jitterRatio * randomFactor)
 * - return capped + jitter
 */
export function calculateBackoffDelay(
  _attempt: number,
  config: BackoffConfig,
  _randomFactor = 0,
): number {
  // TODO: Replace this placeholder with exponential backoff + maxDelayMs cap + jitter.
  return config.baseDelayMs;
}

/**
 * Intermediate Exercise:
 * Return true if the WebSocket client should attempt to reconnect after closing.
 *
 * Do NOT reconnect when:
 * - attempt >= maxAttempts
 * - closeCode is 1000 (Normal Closure), 1008 (Policy Violation), or 4001 (Unauthorized)
 */
export function shouldRetryConnection(
  _closeCode: number,
  _attempt: number,
  _maxAttempts: number,
): boolean {
  // TODO: Implement non-retryable close code filtering and maxAttempts check.
  return false;
}

/**
 * Challenge Exercise:
 * Deduplicate and merge incoming chat messages into the existing timeline.
 *
 * Rules:
 * - Never mutate `existing` or `incoming`.
 * - If an id already exists, keep whichever message has the newer `updatedAt`.
 * - Sort the resulting list chronologically by `sentAt` ascending (oldest first).
 */
export function mergeChatMessages(
  existing: readonly ChatMessage[],
  _incoming: readonly ChatMessage[],
): ChatMessage[] {
  // TODO: Deduplicate by id, keep newest updatedAt, and sort by sentAt ascending.
  return [...existing];
}
