import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export interface ApiErrorOptions {
  status: number | null;
  code: string;
  isNetworkError: boolean;
  isCanceled: boolean;
}

/**
 * Normalized application error returned by both `fetchJson` and `apiClient`.
 */
export class ApiError extends Error {
  public readonly status: number | null;
  public readonly code: string;
  public readonly isNetworkError: boolean;
  public readonly isCanceled: boolean;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.isNetworkError = options.isNetworkError;
    this.isCanceled = options.isCanceled;
  }
}

function extractMessageFromUnknown(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const candidate = (data as { message?: unknown }).message;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

/**
 * Converts unknown fetch/Axios/runtime exceptions into a predictable `ApiError`.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const isCanceled = axios.isCancel(error) || error.code === 'ERR_CANCELED';
    const isNetworkError = !error.response && !isCanceled;
    const serverMessage = extractMessageFromUnknown(error.response?.data);

    const message = isCanceled
      ? 'Request was canceled.'
      : serverMessage ??
        (isNetworkError
          ? 'Network error. Please check your internet connection.'
          : error.message || 'Request failed. Please try again.');

    return new ApiError(message, {
      status,
      code: error.code ?? (status ? `HTTP_${status}` : 'UNKNOWN_AXIOS_ERROR'),
      isNetworkError,
      isCanceled,
    });
  }

  if (error instanceof Error) {
    const isCanceled = error.name === 'AbortError';
    return new ApiError(isCanceled ? 'Request timed out or was canceled.' : error.message, {
      status: null,
      code: isCanceled ? 'ABORT_ERR' : 'RUNTIME_ERROR',
      isNetworkError: false,
      isCanceled,
    });
  }

  return new ApiError('An unexpected error occurred.', {
    status: null,
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
    isCanceled: false,
  });
}

export interface FetchJsonOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Typed `fetch` helper with AbortController timeout and normalized error handling.
 */
export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, signal, timeoutMs = 10_000 } = options;

  const controller = new AbortController();
  const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const handleExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', handleExternalAbort);
    }
  }

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

    if (!response.ok) {
      let errorPayload: unknown = null;
      try {
        errorPayload = await response.json();
      } catch {
        // Non-JSON error body
      }
      const message =
        extractMessageFromUnknown(errorPayload) ??
        `Request failed with status ${response.status}`;

      throw new ApiError(message, {
        status: response.status,
        code: `HTTP_${response.status}`,
        isNetworkError: false,
        isCanceled: false,
      });
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    throw normalizeApiError(error);
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', handleExternalAbort);
  }
}

// Pluggable auth token getter so the API layer stays decoupled from auth storage
type TokenProvider = () => Promise<string | null> | string | null;
let authTokenProvider: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null): void {
  authTokenProvider = provider;
}

/**
 * Shared Axios instance with request auth header injection and error normalization.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (authTokenProvider) {
    const token = await authTokenProvider();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PaginatedPostsResponse {
  items: Post[];
  page: number;
  nextPage: number | null;
}

export interface CreatePostInput {
  title: string;
  body: string;
  userId: number;
}

const TOTAL_DEMO_PAGES = 5;

export async function fetchPostsPage(
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<PaginatedPostsResponse> {
  const response = await apiClient.get<Post[]>('/posts', {
    params: { _page: page, _limit: limit },
    signal,
  });

  const items = response.data;
  const hasMore = page < TOTAL_DEMO_PAGES && items.length === limit;

  return {
    items,
    page,
    nextPage: hasMore ? page + 1 : null,
  };
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await apiClient.post<Post>('/posts', input);
  return response.data;
}
