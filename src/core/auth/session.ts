/**
 * DB-backed HTTP-only cookie sessions.
 *
 * Design:
 *  - Session token: 32 random bytes as hex (opaque, not a JWT).
 *  - Stored in the `sessions` table (created by migration v125).
 *  - Cookie: HttpOnly, Secure (when TLS), SameSite=Lax, 7-day rolling expiry.
 *  - Logout: DELETE the session row + clear the cookie.
 */

import { randomBytes } from 'crypto';
import type { Request } from 'express';
import type { BrainEngine } from '../engine.ts';

export const COOKIE_NAME = 'gbrain_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface Session {
  userId: string;
  provider: string;
  expiresAt: Date;
}

/** Generate a cryptographically random opaque session token. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/** Insert a new session row and return its token. */
export async function createSession(
  engine: BrainEngine,
  userId: string,
  provider: string,
  meta: { ip?: string; userAgent?: string } = {},
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await engine.executeRaw(
    `INSERT INTO sessions (id, user_id, provider, expires_at, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [token, userId, provider, expiresAt.toISOString(), meta.ip ?? null, meta.userAgent ?? null],
  );
  return token;
}

/**
 * Validate a token from the cookie.
 * Returns null if the token is absent, expired, or not found.
 */
export async function validateSession(
  engine: BrainEngine,
  token: string,
): Promise<Session | null> {
  try {
    const rows = await engine.executeRaw<{
      user_id: string; provider: string; expires_at: string;
    }>(
      `SELECT user_id, provider, expires_at
       FROM sessions
       WHERE id = $1 AND expires_at > NOW()
       LIMIT 1`,
      [token],
    );
    if (rows.length === 0) return null;
    return {
      userId: rows[0].user_id,
      provider: rows[0].provider,
      expiresAt: new Date(rows[0].expires_at),
    };
  } catch {
    // sessions table may not exist yet if migration hasn't run
    return null;
  }
}

/** Rolling expiry: push the session expiry forward by another 7 days. */
export async function extendSession(
  engine: BrainEngine,
  token: string,
): Promise<void> {
  const newExpiry = new Date(Date.now() + SESSION_DURATION_MS);
  await engine.executeRaw(
    `UPDATE sessions SET expires_at = $1 WHERE id = $2`,
    [newExpiry.toISOString(), token],
  );
}

/** Delete a session (logout). */
export async function deleteSession(
  engine: BrainEngine,
  token: string,
): Promise<void> {
  await engine.executeRaw(`DELETE FROM sessions WHERE id = $1`, [token]);
}

/** Cookie options matching the request's TLS context. */
export function sessionCookieOptions(req: Request) {
  const isSecure =
    req.secure ||
    String((req.headers as Record<string, string | string[] | undefined>)['x-forwarded-proto'] ?? '') === 'https';
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION_MS,
    path: '/',
  };
}

/** Options to immediately expire the cookie (logout). */
export function clearCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure:
      req.secure ||
      String((req.headers as Record<string, string | string[] | undefined>)['x-forwarded-proto'] ?? '') === 'https',
    sameSite: 'lax' as const,
    path: '/',
  };
}
