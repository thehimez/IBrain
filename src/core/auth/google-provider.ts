/**
 * Google OAuth 2.0 Authorization Code Flow.
 *
 * This module handles the three Google-specific steps:
 *   1. buildGoogleAuthUrl  — construct the redirect URL to Google
 *   2. exchangeGoogleCode  — POST to Google token endpoint for access token
 *   3. fetchGoogleUserInfo — GET user profile using the access token
 *
 * No external auth libraries. Uses the Bun/Node global `fetch`.
 */

import { randomBytes } from 'crypto';

const GOOGLE_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO  = 'https://www.googleapis.com/oauth2/v3/userinfo';
const SCOPES           = ['openid', 'profile', 'email'];

export interface GoogleUserInfo {
  /** Stable Google account ID — use this as the providerUserId. */
  sub:     string;
  email:   string;
  name:    string;
  picture: string;
}

/** Cookie name for the short-lived CSRF state nonce. */
export const STATE_COOKIE = 'gbrain_oauth_state';

/** Generate a random CSRF state nonce. */
export function generateOAuthState(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Construct the Google authorization URL.
 * The browser should be redirected here to start the OAuth dance.
 */
export function buildGoogleAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         SCOPES.join(' '),
    state,
    access_type:   'online',
    prompt:        'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange the authorization code for an access token.
 * Called from the /api/auth/google/callback route.
 */
export async function exchangeGoogleCode(
  code:        string,
  redirectUri: string,
): Promise<{ accessToken: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID     ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { access_token: string };
  if (!data.access_token) {
    throw new Error('Google token response missing access_token');
  }
  return { accessToken: data.access_token };
}

/**
 * Fetch the user's profile from Google using the access token.
 * Returns the normalised GoogleUserInfo.
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status}`);
  }

  const data = await res.json() as GoogleUserInfo;
  if (!data.sub) {
    throw new Error('Google userinfo response missing sub field');
  }
  return data;
}

/**
 * Derive the redirect URI from the current request.
 * Reads GOOGLE_REDIRECT_URI env var first; falls back to constructing from
 * request headers so it works in Replit dev without extra configuration.
 */
export function getGoogleRedirectUri(req: { protocol: string; headers: Record<string, string | string[] | undefined>; get(h: string): string | undefined }): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const proto = String(req.headers['x-forwarded-proto'] ?? req.protocol ?? 'https');
  const host  = String(req.headers['x-forwarded-host'] ?? req.headers['host'] ?? req.get('host') ?? '');
  return `${proto}://${host}/api/auth/google/callback`;
}
