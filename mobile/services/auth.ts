import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { apiGet } from './api';
import { saveUser, loadUser, clearUser } from '../utils/storage';
import type { AuthUser } from '../types';

WebBrowser.maybeCompleteAuthSession();

/**
 * Fetch the current user from /api/auth/me.
 * Returns null if unauthenticated (401) rather than throwing.
 */
export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const user = await apiGet<AuthUser>(API_ENDPOINTS.me);
    await saveUser(user);
    return user;
  } catch {
    return null;
  }
}

/**
 * Begin Google OAuth flow using the system browser.
 *
 * On iOS, ASWebAuthenticationSession shares cookies with URLSession,
 * so the session cookie set by the callback is available to fetch() calls.
 * On Android, Chrome Custom Tabs do not share cookies; the user may need
 * a development build with react-native-webview for full cookie support.
 *
 * After the browser closes, we call /api/auth/me to confirm the session.
 */
export async function loginWithGoogle(): Promise<AuthUser | null> {
  const authUrl = `${API_BASE_URL}${API_ENDPOINTS.googleAuth}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, 'gbrain://');

  // Regardless of result type, check if a session was established
  if (result.type === 'success' || result.type === 'dismiss') {
    // Give the server a moment to finalize the session
    await new Promise(r => setTimeout(r, 300));
    return fetchMe();
  }

  return null;
}

/**
 * Replit login uses a popup in browsers; for mobile we open the
 * auth page in the system browser. Session handling is the same as Google.
 */
export async function loginWithReplit(devDomain: string): Promise<AuthUser | null> {
  const replitUrl = `https://replit.com/auth_with_repl_site?domain=${devDomain}`;
  const result = await WebBrowser.openAuthSessionAsync(replitUrl, 'gbrain://');

  if (result.type === 'success' || result.type === 'dismiss') {
    await new Promise(r => setTimeout(r, 300));
    return fetchMe();
  }

  return null;
}

/**
 * Log out: POST /api/auth/logout then clear local storage.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.logout}`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network errors on logout
  }
  await clearUser();
}

export { saveUser, loadUser };
