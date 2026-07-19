/**
 * Shared types for the GBrain authentication layer.
 *
 * The rest of the application only ever sees AuthenticatedUser.
 * It never deals with provider-specific details.
 */

/**
 * The normalised identity returned by any auth provider.
 * All downstream code (chat, graph, uploads, files) receives only this.
 */
export interface AuthenticatedUser {
  /** Stable DB primary key in the users table. */
  id: string;
  /** Which provider authenticated this user: 'replit' | 'google' | … */
  provider: string;
  /** The provider's own user identifier (Replit numeric ID, Google sub, …). */
  providerUserId: string;
  /** Display name. */
  name: string;
  /** Email address — null for Replit (proxy headers don't carry it). */
  email: string | null;
  /** Avatar URL. */
  avatar: string | null;
  /**
   * The isolation boundary used by every engine query.
   * Replit:  'user:<replit_user_id>'
   * Google:  'user:google:<google_sub>'
   * Never changes once created for a given account.
   */
  sourceId: string;
}
