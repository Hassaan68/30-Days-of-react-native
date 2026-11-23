import AsyncStorage from '@react-native-async-storage/async-storage';

export type MutationOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface QueuedMutation<TPayload = Record<string, unknown>> {
  id: string;
  idempotencyKey: string;
  entity: string;
  operation: MutationOperation;
  payload: TPayload;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface FlushReport {
  succeeded: number;
  failed: number;
  remaining: number;
}

export interface VersionedEntity {
  id: string;
  updatedAt: string;
  version: number;
}

export type ConflictStrategy = 'client-wins' | 'server-wins' | 'last-write-wins';

const QUEUE_STORAGE_KEY = 'offline:mutation_queue:v1';
const MAX_ATTEMPTS = 5;

function createUniqueId(prefix: string): string {
  const randomSegment = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${randomSegment}`;
}

function isQueuedMutation(value: unknown): value is QueuedMutation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.idempotencyKey === 'string' &&
    typeof candidate.entity === 'string' &&
    (candidate.operation === 'CREATE' ||
      candidate.operation === 'UPDATE' ||
      candidate.operation === 'DELETE') &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.attempts === 'number' &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null
  );
}

/**
 * Durable FIFO offline mutation queue backed by `@react-native-async-storage/async-storage`.
 * Queues mutations while offline (or when requests fail due to transient network drops)
 * and replays them in order with idempotency keys once connectivity returns.
 */
export class OfflineMutationQueue {
  private readonly storageKey: string;

  constructor(storageKey = QUEUE_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  async getAll(): Promise<QueuedMutation[]> {
    const raw = await AsyncStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isQueuedMutation);
    } catch {
      return [];
    }
  }

  private async saveAll(items: readonly QueuedMutation[]): Promise<void> {
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async enqueue<TPayload extends Record<string, unknown>>(params: {
    entity: string;
    operation: MutationOperation;
    payload: TPayload;
    idempotencyKey?: string;
  }): Promise<QueuedMutation<TPayload>> {
    const current = await this.getAll();
    const mutation: QueuedMutation<TPayload> = {
      id: createUniqueId('mut'),
      idempotencyKey: params.idempotencyKey ?? createUniqueId('idem'),
      entity: params.entity,
      operation: params.operation,
      payload: params.payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    await this.saveAll([...current, mutation]);
    return mutation;
  }

  /**
   * Replays queued mutations in FIFO order.
   * Stops early if `isOnline()` returns false so we don't burn retry attempts while offline.
   */
  async flush(
    executor: (mutation: QueuedMutation) => Promise<void>,
    isOnline: () => boolean = () => true,
  ): Promise<FlushReport> {
    const queue = await this.getAll();
    const remaining: QueuedMutation[] = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < queue.length; i += 1) {
      const mutation = queue[i];
      if (!mutation) {
        continue;
      }

      if (!isOnline()) {
        remaining.push(...queue.slice(i));
        break;
      }

      try {
        await executor(mutation);
        succeeded += 1;
      } catch (error: unknown) {
        failed += 1;
        const nextAttempts = mutation.attempts + 1;
        const message = error instanceof Error ? error.message : 'Unknown sync error';

        if (nextAttempts < MAX_ATTEMPTS) {
          remaining.push({
            ...mutation,
            attempts: nextAttempts,
            lastError: message,
          });
        }
      }
    }

    await this.saveAll(remaining);

    return {
      succeeded,
      failed,
      remaining: remaining.length,
    };
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(this.storageKey);
  }
}

/**
 * Pure conflict-resolution helper for synchronizing a locally edited record
 * with a newer server record.
 */
export function resolveConflict<T extends VersionedEntity>(
  localRecord: T,
  serverRecord: T,
  strategy: ConflictStrategy = 'last-write-wins',
): T {
  if (strategy === 'client-wins') {
    return {
      ...localRecord,
      version: Math.max(localRecord.version, serverRecord.version) + 1,
    };
  }

  if (strategy === 'server-wins') {
    return serverRecord;
  }

  const localTime = Date.parse(localRecord.updatedAt);
  const serverTime = Date.parse(serverRecord.updatedAt);

  if (Number.isNaN(localTime) || Number.isNaN(serverTime)) {
    return serverRecord.version >= localRecord.version ? serverRecord : localRecord;
  }

  return localTime >= serverTime ? localRecord : serverRecord;
}
