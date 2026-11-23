/**
 * Day 26 Solution: Reconnection Backoff & Real-Time State Merging
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

const NON_RETRYABLE_CLOSE_CODES = new Set<number>([1000, 1008, 4001]);

export function calculateBackoffDelay(
  attempt: number,
  config: BackoffConfig,
  randomFactor = 0,
): number {
  const normalizedAttempt = Math.max(1, Math.floor(attempt));
  const clampedRandom = Math.min(1, Math.max(0, randomFactor));
  const jitterRatio = Math.max(0, config.jitterRatio ?? 0);

  const exponentialDelay = config.baseDelayMs * Math.pow(2, normalizedAttempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  const jitter = Math.round(cappedDelay * jitterRatio * clampedRandom);

  return cappedDelay + jitter;
}

export function shouldRetryConnection(
  closeCode: number,
  attempt: number,
  maxAttempts: number,
): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  if (NON_RETRYABLE_CLOSE_CODES.has(closeCode)) {
    return false;
  }

  return true;
}

export function mergeChatMessages(
  existing: readonly ChatMessage[],
  incoming: readonly ChatMessage[],
): ChatMessage[] {
  const messagesById = new Map<string, ChatMessage>();

  for (const message of existing) {
    messagesById.set(message.id, message);
  }

  for (const message of incoming) {
    const current = messagesById.get(message.id);
    if (!current || message.updatedAt >= current.updatedAt) {
      messagesById.set(message.id, message);
    }
  }

  return Array.from(messagesById.values()).sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}
