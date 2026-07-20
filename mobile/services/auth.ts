import * as WebBrowser from 'expo-web-browser';
<<<<<<< HEAD
import * as Linking from 'expo-linking';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { apiGet } from './api';
import { saveUser, loadUser, clearUser, saveSessionCookie } from '../utils/storage';
=======
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { apiGet } from './api';
import { saveUser, loadUser, clearUser } from '../utils/storage';
>>>>>>> origin/main
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

<<<<<<< HEAD
/** Complete the native OAuth callback using its short-lived, single-use code. */
export async function completeMobileLogin(code: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE_URL}/api/auth/mobile-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return null;
  const { sessionToken } = await res.json() as { sessionToken?: string };
  if (!sessionToken) return null;
  await saveSessionCookie(`gbrain_session=${sessionToken}`);
  return fetchMe();
}

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  const returnUrl = Linking.createURL('auth');
  console.log("RETURN URL:", returnUrl);
  const authUrl = `${API_BASE_URL}${API_ENDPOINTS.googleAuth}?mobile=1&mobile_return=${encodeURIComponent(returnUrl)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

  if (result.type === 'success') {
    const code = new URL(result.url).searchParams.get('code');
    if (!code) return null;
    return completeMobileLogin(code);
=======
  const authUrl = `${API_BASE_URL}${API_ENDPOINTS.googleAuth}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, 'gbrain://');

  // Regardless of result type, check if a session was established
  if (result.type === 'success' || result.type === 'dismiss') {
    // Give the server a moment to finalize the session
    await new Promise(r => setTimeout(r, 300));
    return fetchMe();
>>>>>>> origin/main
  }

  return null;
}

/**
 * Replit login uses a popup in browsers; for mobile we open the
 * auth page in the system browser. Session handling is the same as Google.
 */
export async function loginWithReplit(devDomain: string): Promise<AuthUser | null> {
  const replitUrl = `https://replit.com/auth_with_repl_site?domain=${devDomain}`;
<<<<<<< HEAD
  const result = await WebBrowser.openAuthSessionAsync(replitUrl, 'xandacross://');
=======
  const result = await WebBrowser.openAuthSessionAsync(replitUrl, 'gbrain://');
>>>>>>> origin/main

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
