/**
 * Multi-user support — user management and Replit auth header resolution.
 *
 * Each Replit user gets:
 *   - A row in `users` (created by migration 123)
 *   - A dedicated `sources` row with id = `user:{replit_user_id}`
 *
 * The user's sourceId is the isolation boundary for all user data (pages,
 * chunks, facts, etc.), reusing the existing source-scoped architecture.
 */

import type { BrainEngine } from './engine.ts';

export interface GBrainUser {
  id: string;
  replitUserId: string;
  name: string;
  avatarUrl: string | null;
  sourceId: string;
}

/** Derive the sources.id for a given Replit user. */
export function userSourceId(replitUserId: string): string {
  return `user:${replitUserId}`;
}

/**
 * Create or update the user row and ensure their sources entry exists.
 * Safe to call on every request — all operations are ON CONFLICT DO NOTHING/UPDATE.
 */
export async function upsertUser(
  engine: BrainEngine,
  info: { replit_user_id: string; name: string; avatar_url?: string | null },
): Promise<GBrainUser> {
  const { replit_user_id, name, avatar_url } = info;
  const sourceId = userSourceId(replit_user_id);

  const rows = await engine.executeRaw<{
    id: string;
    replit_user_id: string;
    name: string;
    avatar_url: string | null;
  }>(
    `INSERT INTO users (id, replit_user_id, name, avatar_url, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (replit_user_id) DO UPDATE
       SET name       = EXCLUDED.name,
           avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
           updated_at = NOW()
     RETURNING id, replit_user_id, name, avatar_url`,
    [replit_user_id, replit_user_id, name, avatar_url ?? null],
  );

  // Ensure the user's sources row exists (idempotent)
  await engine.executeRaw(
    `INSERT INTO sources (id, name, config)
     VALUES ($1, $2, '{}'::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    [sourceId, `${name}'s Brain`],
  );

  const user = rows[0];
  return {
    id: user.id,
    replitUserId: user.replit_user_id,
    name: user.name,
    avatarUrl: user.avatar_url,
    sourceId,
  };
}

/**
 * Parse Replit auth headers injected by the Replit proxy.
 * Returns null if the user is not authenticated.
 */
export function readReplitAuthHeaders(
  headers: Record<string, string | string[] | undefined>,
): { replit_user_id: string; name: string; avatar_url: string } | null {
  const userId = headers['x-replit-user-id'];
  if (!userId || typeof userId !== 'string' || !userId.trim()) return null;

  const rawName = headers['x-replit-user-name'];
  const rawImage = headers['x-replit-user-image'];

  let name = typeof rawName === 'string' ? rawName : '';
  try { name = decodeURIComponent(name); } catch { /* keep raw */ }

  return {
    replit_user_id: userId.trim(),
    name,
    avatar_url: typeof rawImage === 'string' ? rawImage : '',
  };
}
