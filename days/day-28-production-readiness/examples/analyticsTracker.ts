/**
 * Day 28 Example: Privacy-Respecting Analytics & Structured PII-Free Logger
 *
 * Demonstrates:
 * - Strongly typed event taxonomy (prevents typoed event names and inconsistent properties)
 * - Explicit user consent gating before tracking
 * - Automatic PII scrubbing for logs and analytics properties
 * - Pluggable transport abstraction for Sentry, PostHog, Amplitude, or custom backends
 */

export interface AnalyticsEventMap {
  readonly screen_viewed: {
    readonly screenName: string;
    readonly source?: string;
  };
  readonly habit_completed: {
    readonly habitCategory: string;
    readonly currentStreak: number;
  };
  readonly focus_session_finished: {
    readonly durationMinutes: number;
    readonly completed: boolean;
  };
  readonly onboarding_completed: {
    readonly stepsCompleted: number;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export interface AnalyticsEnvelope {
  readonly event: AnalyticsEventName;
  readonly properties: Record<string, string | number | boolean>;
  readonly timestampIso: string;
  readonly appVersion: string;
}

export interface AnalyticsTransport {
  send(envelope: AnalyticsEnvelope): void;
}

const BLOCKED_PII_KEYS = new Set<string>([
  'email',
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'phone',
  'phonenumber',
  'ssn',
  'creditcard',
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function sanitizeProperties(
  raw: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(raw)) {
    const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
    if (BLOCKED_PII_KEYS.has(normalizedKey)) {
      safe[key] = '[REDACTED]';
      continue;
    }

    if (typeof value === 'string') {
      safe[key] = value.replace(EMAIL_PATTERN, '[REDACTED_EMAIL]');
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      safe[key] = value;
    }
  }

  return safe;
}

export class AnalyticsTracker {
  private consentGranted = false;
  private readonly appVersion: string;
  private readonly transport: AnalyticsTransport;

  constructor(appVersion: string, transport: AnalyticsTransport) {
    this.appVersion = appVersion;
    this.transport = transport;
  }

  public setConsentGranted(granted: boolean): void {
    this.consentGranted = granted;
  }

  public isConsentGranted(): boolean {
    return this.consentGranted;
  }

  public track<TEvent extends AnalyticsEventName>(
    event: TEvent,
    properties: AnalyticsEventMap[TEvent],
  ): boolean {
    if (!this.consentGranted) {
      return false;
    }

    const envelope: AnalyticsEnvelope = {
      event,
      properties: sanitizeProperties(properties as Record<string, unknown>),
      timestampIso: new Date().toISOString(),
      appVersion: this.appVersion,
    };

    this.transport.send(envelope);
    return true;
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: Record<string, string | number | boolean>;
  readonly timestampIso: string;
}

export interface StructuredLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export function createStructuredLogger(
  sink: (entry: StructuredLogEntry) => void,
  minLevel: LogLevel = 'info',
): StructuredLogger {
  const severityRank: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  function emit(level: LogLevel, message: string, context: Record<string, unknown> = {}): void {
    if (severityRank[level] < severityRank[minLevel]) {
      return;
    }

    sink({
      level,
      message: message.replace(EMAIL_PATTERN, '[REDACTED_EMAIL]'),
      context: sanitizeProperties(context),
      timestampIso: new Date().toISOString(),
    });
  }

  return {
    debug: (message, context) => emit('debug', message, context),
    info: (message, context) => emit('info', message, context),
    warn: (message, context) => emit('warn', message, context),
    error: (message, context) => emit('error', message, context),
  };
}
