const BASE = '/api';

export interface UploadResult {
  job_id: string;
  content_hash: string;
  filename: string;
  message: string;
}

export interface UploadError {
  error: string;
  message: string;
}

/** Supported text-based file extensions and their MIME types */
export const SUPPORTED_TYPES: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
};

export const UNSUPPORTED_BINARY = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.mp4', '.wav']);

export function getFileExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : '';
}

export function isSupportedFile(filename: string): boolean {
  return getFileExtension(filename) in SUPPORTED_TYPES;
}

export function isUnsupportedBinary(filename: string): boolean {
  return UNSUPPORTED_BINARY.has(getFileExtension(filename));
}

/** Read a File object as UTF-8 text */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file, 'utf-8');
  });
}

/** Upload a single document to the brain */
export async function uploadDocument(
  filename: string,
  content: string,
  mimeType: string,
): Promise<UploadResult> {
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'upload_failed', message: res.statusText })) as UploadError;
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<UploadResult>;
}
