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
};
