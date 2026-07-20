import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { loadSessionCookie } from '../utils/storage';
import type { XandaCrossFile, UploadResult } from '../types';

export const documentsService = {
  async list(): Promise<XandaCrossFile[]> {
    const cookie = await loadSessionCookie();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.files}`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to load files (${res.status})`);
    return res.json() as Promise<XandaCrossFile[]>;
  },

  async upload(
    filename: string,
    content: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const cookie = await loadSessionCookie();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.upload}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ filename, content, mimeType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
      throw new Error(err.message ?? `Upload failed (${res.status})`);
    }
    return res.json() as Promise<UploadResult>;
  },

  async getContent(fileId: string): Promise<XandaCrossFile> {
    const cookie = await loadSessionCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.files}/${fileId}`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to load file (${res.status})`);
    return res.json() as Promise<XandaCrossFile>;
  },

  /** Resolve a citation page_slug → full file record with content */
  async getBySlug(slug: string): Promise<XandaCrossFile> {
    const cookie = await loadSessionCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers['Cookie'] = cookie;

    // Step 1: resolve slug → id + filename
    const slugRes = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.files}/by-slug?slug=${encodeURIComponent(slug)}`,
      { headers, credentials: 'include' },
    );
    if (!slugRes.ok) throw new Error(`File not found for slug: ${slug}`);
    const meta = await slugRes.json() as { id: string; filename: string };

    // Step 2: fetch full record with content
    return documentsService.getContent(String(meta.id));
  },
};
