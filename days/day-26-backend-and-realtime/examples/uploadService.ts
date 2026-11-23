/**
 * Day 26 Example: Multipart File Upload Service for React Native
 *
 * Demonstrates:
 * - Client-side file validation (MIME allowlist, size limits, safe filenames)
 * - React Native FormData construction using { uri, name, type }
 * - Timeout handling via AbortController and typed upload responses
 * - Sequential batch uploading with progress callbacks
 */

export interface LocalMediaAsset {
  readonly uri: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
}

export interface UploadValidationRules {
  readonly maxFileSizeBytes: number;
  readonly allowedMimeTypes: readonly string[];
}

export interface ValidationOutcome {
  readonly valid: boolean;
  readonly reason?: string;
}

export interface UploadResult {
  readonly id: string;
  readonly url: string;
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface UploadOptions {
  readonly endpointUrl: string;
  readonly authToken: string;
  readonly fieldName?: string;
  readonly metadata?: Record<string, string>;
  readonly timeoutMs?: number;
  readonly rules?: UploadValidationRules;
}

export interface BatchProgress {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly currentFileName: string;
}

interface ReactNativeFilePart {
  readonly uri: string;
  readonly name: string;
  readonly type: string;
}

interface NativeFormData {
  append(name: string, value: string | ReactNativeFilePart): void;
}

export const DEFAULT_IMAGE_UPLOAD_RULES: UploadValidationRules = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

export function sanitizeFileName(rawName: string): string {
  const trimmed = rawName.trim();
  const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safe.length > 0 ? safe : `upload_${Date.now()}.jpg`;
}

export function validateMediaAsset(
  asset: LocalMediaAsset,
  rules: UploadValidationRules = DEFAULT_IMAGE_UPLOAD_RULES,
): ValidationOutcome {
  if (!asset.uri.trim()) {
    return { valid: false, reason: 'File URI is missing.' };
  }

  if (asset.fileSizeBytes <= 0) {
    return { valid: false, reason: 'File appears to be empty.' };
  }

  if (asset.fileSizeBytes > rules.maxFileSizeBytes) {
    const maxMb = (rules.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
    return { valid: false, reason: `File exceeds the ${maxMb} MB size limit.` };
  }

  if (!rules.allowedMimeTypes.includes(asset.mimeType)) {
    return {
      valid: false,
      reason: `Unsupported file type "${asset.mimeType}". Allowed: ${rules.allowedMimeTypes.join(', ')}.`,
    };
  }

  return { valid: true };
}

export async function uploadMediaFile(
  asset: LocalMediaAsset,
  options: UploadOptions,
): Promise<UploadResult> {
  const {
    endpointUrl,
    authToken,
    fieldName = 'file',
    metadata = {},
    timeoutMs = 30_000,
    rules = DEFAULT_IMAGE_UPLOAD_RULES,
  } = options;

  const validation = validateMediaAsset(asset, rules);
  if (!validation.valid) {
    throw new Error(validation.reason ?? 'Invalid file.');
  }

  // Note: Do NOT manually set the 'Content-Type' header when sending FormData.
  // React Native's networking layer automatically sets 'multipart/form-data'
  // along with the correct boundary string.
  const rawFormData = new FormData();
  const formData = rawFormData as unknown as NativeFormData;

  formData.append(fieldName, {
    uri: asset.uri,
    name: sanitizeFileName(asset.fileName),
    type: asset.mimeType,
  });

  for (const [key, value] of Object.entries(metadata)) {
    formData.append(key, value);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: rawFormData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with HTTP ${response.status}.`);
    }

    return (await response.json()) as UploadResult;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function uploadMediaBatch(
  assets: readonly LocalMediaAsset[],
  options: UploadOptions,
  onProgress?: (progress: BatchProgress) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalCount = assets.length;

  for (let index = 0; index < totalCount; index += 1) {
    const asset = assets[index];
    if (!asset) {
      continue;
    }

    const uploaded = await uploadMediaFile(asset, options);
    results.push(uploaded);

    const completedCount = index + 1;
    onProgress?.({
      completedCount,
      totalCount,
      percentage: Math.round((completedCount / totalCount) * 100),
      currentFileName: asset.fileName,
    });
  }

  return results;
}
