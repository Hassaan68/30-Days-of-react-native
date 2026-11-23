/**
 * Day 26 Example: Typed REST Client + Resilient WebSocket Realtime Client
 *
 * Demonstrates:
 * - Structured ApiError with HTTP/network/timeout classification
 * - Typed fetch wrapper with AbortController timeout and retry logic
 * - WebSocket lifecycle management, heartbeat pings, and exponential backoff
 * - Immutable state merging for live feeds and chat messages
 */

export type ApiErrorCode =
  | 'OFFLINE'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number | null;
  public readonly retryable: boolean;

  constructor(message: string, code: ApiErrorCode, status: number | null, retryable: boolean) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

export function mapHttpStatusToApiError(status: number, serverMessage?: string): ApiError {
  if (status === 401) {
    return new ApiError(
      serverMessage ?? 'Session expired. Please sign in again.',
      'UNAUTHORIZED',
      status,
      false,
    );
  }
  if (status === 403) {
    return new ApiError(
      serverMessage ?? 'You do not have permission to perform this action.',
      'FORBIDDEN',
      status,
      false,
    );
  }
  if (status === 404) {
    return new ApiError(serverMessage ?? 'Requested resource was not found.', 'NOT_FOUND', status, false);
  }
  if (status === 422 || status === 400) {
    return new ApiError(
      serverMessage ?? 'Please check your input and try again.',
      'VALIDATION_ERROR',
      status,
      false,
    );
  }
  if (status === 429) {
    return new ApiError(
      serverMessage ?? 'Too many requests. Retrying shortly.',
      'RATE_LIMITED',
      status,
      true,
    );
  }
  if (status >= 500) {
    return new ApiError(
      serverMessage ?? 'Server encountered an unexpected error.',
      'SERVER_ERROR',
      status,
      true,
    );
  }
  return new ApiError(serverMessage ?? `Unexpected HTTP status ${status}.`, 'UNKNOWN', status, false);
}

export interface ApiRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly baseRetryDelayMs?: number;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export async function apiRequest<TResponse>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 10_000,
    maxRetries = 2,
    baseRetryDelayMs = 400,
  } = options;

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let serverMessage: string | undefined;
        try {
          const payload = (await response.json()) as { message?: unknown };
          if (typeof payload.message === 'string') {
            serverMessage = payload.message;
          }
        } catch {
          // Response body was not JSON; fall back to default status message.
        }
        throw mapHttpStatusToApiError(response.status, serverMessage);
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      return (await response.json()) as TResponse;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const normalizedError =
        error instanceof ApiError
          ? error
          : isAbortError(error)
            ? new ApiError('Request timed out.', 'TIMEOUT', null, true)
            : new ApiError('Network unavailable. Check your connection.', 'OFFLINE', null, true);

      const canRetry = normalizedError.retryable && attempt < maxRetries;
      if (!canRetry) {
        throw normalizedError;
      }

      attempt += 1;
      const delayMs = baseRetryDelayMs * Math.pow(2, attempt - 1);
      await wait(delayMs);
    }
  }
}

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface WebSocketMessageEventLike {
  readonly data: unknown;
}

export interface WebSocketCloseEventLike {
  readonly code: number;
  readonly reason: string;
}

export interface WebSocketLike {
  readonly readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: WebSocketMessageEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onclose: ((event: WebSocketCloseEventLike) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface RealtimeClientConfig<TMessage> {
  readonly url: string;
  readonly parseMessage: (raw: string) => TMessage | null;
  readonly baseReconnectDelayMs?: number;
  readonly maxReconnectDelayMs?: number;
  readonly maxReconnectAttempts?: number;
  readonly heartbeatIntervalMs?: number;
  readonly socketFactory?: (url: string) => WebSocketLike;
}

export class RealtimeClient<TMessage> {
  private readonly url: string;
  private readonly parseMessage: (raw: string) => TMessage | null;
  private readonly baseReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;
  private readonly maxReconnectAttempts: number;
  private readonly heartbeatIntervalMs: number;
  private readonly socketFactory: (url: string) => WebSocketLike;

  private socket: WebSocketLike | null = null;
  private status: ConnectionStatus = 'idle';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private manuallyClosed = false;

  private readonly messageListeners = new Set<(message: TMessage) => void>();
  private readonly statusListeners = new Set<(status: ConnectionStatus) => void>();

  constructor(config: RealtimeClientConfig<TMessage>) {
    this.url = config.url;
    this.parseMessage = config.parseMessage;
    this.baseReconnectDelayMs = config.baseReconnectDelayMs ?? 1_000;
    this.maxReconnectDelayMs = config.maxReconnectDelayMs ?? 30_000;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 8;
    this.heartbeatIntervalMs = config.heartbeatIntervalMs ?? 25_000;
    this.socketFactory =
      config.socketFactory ?? ((targetUrl) => new WebSocket(targetUrl) as unknown as WebSocketLike);
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public subscribeMessages(listener: (message: TMessage) => void): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public connect(): void {
    this.manuallyClosed = false;
    this.clearTimers();
    this.setStatus(this.reconnectAttempts === 0 ? 'connecting' : 'reconnecting');

    const ws = this.socketFactory(this.url);
    this.socket = ws;

    ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus('open');
      this.startHeartbeat();
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        return;
      }
      if (event.data === '{"type":"pong"}') {
        return;
      }
      const parsed = this.parseMessage(event.data);
      if (parsed === null) {
        return;
      }
      for (const listener of this.messageListeners) {
        listener(parsed);
      }
    };

    ws.onerror = () => {
      // onclose always follows onerror and handles scheduling reconnection.
    };

    ws.onclose = (event) => {
      this.stopHeartbeat();
      this.socket = null;

      if (this.manuallyClosed || event.code === 1000) {
        this.setStatus('closed');
        return;
      }

      this.scheduleReconnect();
    };
  }

  public sendJson(payload: Record<string, unknown>): boolean {
    if (!this.socket || this.status !== 'open') {
      return false;
    }
    this.socket.send(JSON.stringify(payload));
    return true;
  }

  public disconnect(): void {
    this.manuallyClosed = true;
    this.clearTimers();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
    this.setStatus('closed');
  }

  private setStatus(nextStatus: ConnectionStatus): void {
    if (this.status === nextStatus) {
      return;
    }
    this.status = nextStatus;
    for (const listener of this.statusListeners) {
      listener(nextStatus);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.status === 'open') {
        this.socket.send(JSON.stringify({ type: 'ping', sentAt: Date.now() }));
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('closed');
      return;
    }

    this.reconnectAttempts += 1;
    const exponential = this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1);
    const capped = Math.min(exponential, this.maxReconnectDelayMs);
    const jitter = Math.round(capped * 0.2 * Math.random());
    const delayMs = capped + jitter;

    this.setStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delayMs);
  }
}

export interface LiveFeedItem {
  readonly id: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Merges incoming real-time updates into an existing list without duplicates,
 * keeping the most recently updated copy of each item and sorting newest-first.
 */
export function mergeRealtimeFeedItems<T extends LiveFeedItem>(
  existing: readonly T[],
  incoming: readonly T[],
): T[] {
  const byId = new Map<string, T>();

  for (const item of existing) {
    byId.set(item.id, item);
  }

  for (const item of incoming) {
    const current = byId.get(item.id);
    if (!current || item.updatedAt >= current.updatedAt) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
