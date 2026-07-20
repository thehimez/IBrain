/**
 * AuthService — the single entry point for authentication.
 *
 * Call `authService.getCurrentUser(req, engine)` from any Express handler.
 * It tries providers in order:
 *   1. gbrain_session cookie  → Google (and future providers)
 *   2. Replit proxy headers   → backward compat (active unless GBRAIN_REPLIT_AUTH=disabled)
 *
 * Returns AuthenticatedUser or null (unauthenticated).
 * The caller responds 401 when null is returned.
 */

import type { Request } from 'express';
import type { BrainEngine } from '../engine.ts';
import type { AuthenticatedUser } from './types.ts';
import {
  COOKIE_NAME,
  validateSession,
  extendSession,
} from './session.ts';
import { readReplitAuthHeaders, upsertUser } from '../users.ts';

// ---------------------------------------------------------------------------
// source_id derivation — provider-aware
// ---------------------------------------------------------------------------

/**
 * Compute the sources.id (isolation boundary) for a given provider+userId.
 * Replit users keep their existing 'user:<id>' format unchanged.
 * All other providers use 'user:<provider>:<id>'.
 */
export function computeSourceId(provider: string, providerUserId: string): string {
  if (provider === 'replit') return `user:${providerUserId}`;
  return `user:${provider}:${providerUserId}`;
}

// ---------------------------------------------------------------------------
// Database upsert for provider-authenticated users (Google, etc.)
// ---------------------------------------------------------------------------

/**
 * Upsert a user row using (id PK) as the conflict key.
 *
 * For Google users, id = 'google:<sub>' — never collides with Replit IDs
 * (which are purely numeric strings). Ensures the sources row exists.
 */
export async function upsertProviderUser(
  engine: BrainEngine,
  identity: {
    provider:       string;
    providerUserId: string;
    name:           string;
    email:          string | null;
    avatarUrl:      string | null;
  },
): Promise<AuthenticatedUser> {
  const { provider, providerUserId, name, email, avatarUrl } = identity;

  // Replit users keep id = replit_user_id (existing rows unchanged).
  // All other providers: id = '<provider>:<providerUserId>'.
  const id       = provider === 'replit' ? providerUserId : `${provider}:${providerUserId}`;
  const sourceId = computeSourceId(provider, providerUserId);

  const rows = await engine.executeRaw<{
    id: string;
    provider: string;
    provider_user_id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  }>(
    `INSERT INTO users (id, provider, provider_user_id, name, email, avatar_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (id) DO UPDATE
       SET name             = EXCLUDED.name,
           email            = COALESCE(EXCLUDED.email, users.email),
           avatar_url       = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
           provider         = EXCLUDED.provider,
           provider_user_id = EXCLUDED.provider_user_id,
           updated_at       = NOW()
     RETURNING id, provider, provider_user_id, name, email, avatar_url`,
    [id, provider, providerUserId, name, email, avatarUrl],
  );

  // Ensure the user's sources row exists (idempotent — same pattern as upsertUser).
  await engine.executeRaw(
    `INSERT INTO sources (id, name, config)
     VALUES ($1, $2, '{}'::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    [sourceId, `${name}'s Brain`],
  );

  const u = rows[0];
  return {
    id:             u.id,
    provider:       u.provider,
    providerUserId: u.provider_user_id,
    name:           u.name,
    email:          u.email,
    avatar:         u.avatar_url,
    sourceId,
  };
}

// ---------------------------------------------------------------------------
// AuthService
// ---------------------------------------------------------------------------

export class AuthService {
  /**
   * Extract the authenticated user from the incoming request.
   * Returns null if the request carries no valid credentials.
   */
  async getCurrentUser(
    req:    Request,
    engine: BrainEngine,
  ): Promise<AuthenticatedUser | null> {

    // ── 1. Session cookie (Google and future providers) ────────────────────
    const token = (req.cookies as Record<string, string | undefined>)?.[COOKIE_NAME];
    if (token) {
      const session = await validateSession(engine, token);
      if (session) {
        // Rolling expiry — best-effort, non-blocking
        extendSession(engine, token).catch(() => { /* ignore */ });

        const rows = await engine.executeRaw<{
          id: string;
          provider: string;
          provider_user_id: string;
          name: string;
          email: string | null;
          avatar_url: string | null;
        }>(
          `SELECT id, provider, provider_user_id, name, email, avatar_url
           FROM users WHERE id = $1 LIMIT 1`,
          [session.userId],
        );

        if (rows.length > 0) {
          const u = rows[0];
          return {
            id:             u.id,
            provider:       u.provider,
            providerUserId: u.provider_user_id,
            name:           u.name,
            email:          u.email,
            avatar:         u.avatar_url,
            sourceId:       computeSourceId(u.provider, u.provider_user_id),
          };
        }
        // Session points to a deleted user — fall through
      }
    }

    // ── 2. Replit proxy headers (backward compat) ──────────────────────────
    // Disabled only when GBRAIN_REPLIT_AUTH=disabled (future Phase 3).
    if (process.env.GBRAIN_REPLIT_AUTH !== 'disabled') {
      const authInfo = readReplitAuthHeaders(
        req.headers as Record<string, string | string[] | undefined>,
      );
      if (authInfo) {
        // Use the existing upsertUser which writes to users + sources.
        // It also now writes provider/provider_user_id (updated in users.ts).
        const replitUser = await upsertUser(engine, authInfo);
        return {
          id:             replitUser.id,
          provider:       'replit',
          providerUserId: replitUser.replitUserId,
          name:           replitUser.name,
          email:          null,
          avatar:         replitUser.avatarUrl,
          sourceId:       replitUser.sourceId,
        };
      }
    }

    return null;
  }
}

/** Singleton — import this in serve-http.ts. */
export const authService = new AuthService();
