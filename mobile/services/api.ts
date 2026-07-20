import { API_BASE_URL } from '../constants/api';
import { loadSessionCookie } from '../utils/storage';

// ─── HTTP client ──────────────────────────────────────────────────────────────

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const cookie = await loadSessionCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  return headers;
}

function extractSetCookie(response: Response): string | null {
  // React Native fetch does not expose Set-Cookie headers directly,
  // but we capture what we can for session maintenance.
  return response.headers.get('set-cookie');
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, `GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, `POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, `DELETE ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export { extractSetCookie };
