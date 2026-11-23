export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SafeLoggerOptions {
  /** Override environment detection (defaults to React Native's `__DEV__` flag). */
  isDev?: boolean;
  /** Additional lowercase key fragments to redact beyond the built-in defaults. */
  extraSensitiveKeys?: readonly string[];
}

const DEFAULT_SENSITIVE_KEY_FRAGMENTS: readonly string[] = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'creditcard',
  'cardnumber',
  'cvv',
  'ssn',
  'pin',
];

const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

function isSensitiveKey(key: string, patterns: readonly string[]): boolean {
  const normalized = key.toLowerCase();
  return patterns.some((fragment) => normalized.includes(fragment));
}

function redactString(value: string): string {
  return value.replace(BEARER_PATTERN, 'Bearer [REDACTED]').replace(JWT_PATTERN, '[REDACTED_JWT]');
}

/**
 * Recursively clones and redacts sensitive fields, bearer headers, and JWTs
 * while safely handling circular object references and Error instances.
 */
export function redactValue(
  value: unknown,
  sensitiveFragments: readonly string[] = DEFAULT_SENSITIVE_KEY_FRAGMENTS,
  seen: WeakSet<object> = new WeakSet(),
): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
    };
  }

  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, sensitiveFragments, seen));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isSensitiveKey(key, sensitiveFragments)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = redactValue(entry, sensitiveFragments, seen);
    }
  }

  return sanitized;
}

export interface SafeLogger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * Creates a structured logger that:
 * - Redacts tokens, passwords, headers, and secrets automatically.
 * - Suppresses noisy `debug` and `info` output in production builds.
 */
export function createSafeLogger(options: SafeLoggerOptions = {}): SafeLogger {
  const isDev = options.isDev ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);
  const sensitiveFragments = [
    ...DEFAULT_SENSITIVE_KEY_FRAGMENTS,
    ...(options.extraSensitiveKeys ?? []).map((item) => item.toLowerCase()),
  ];

  const emit = (level: LogLevel, message: string, context?: Record<string, unknown>): void => {
    if (!isDev && (level === 'debug' || level === 'info')) {
      return;
    }

    const safeMessage = redactString(message);
    const safeContext = context ? redactValue(context, sensitiveFragments) : undefined;

    const sink =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'info'
            ? console.info
            : console.debug;

    if (safeContext !== undefined) {
      sink(`[${level.toUpperCase()}] ${safeMessage}`, safeContext);
    } else {
      sink(`[${level.toUpperCase()}] ${safeMessage}`);
    }
  };

  return {
    debug: (message, context) => emit('debug', message, context),
    info: (message, context) => emit('info', message, context),
    warn: (message, context) => emit('warn', message, context),
    error: (message, context) => emit('error', message, context),
  };
}

export const safeLogger = createSafeLogger();
