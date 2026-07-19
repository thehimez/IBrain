import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser, Conversation } from '../types';

// ─── Secure storage (auth) ────────────────────────────────────────────────────

const SECURE_KEY_USER = 'gbrain_user';
const SECURE_KEY_COOKIE = 'gbrain_session_cookie';

export async function saveUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(user));
}

export async function loadUser(): Promise<AuthUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_KEY_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEY_USER);
  await SecureStore.deleteItemAsync(SECURE_KEY_COOKIE);
}

export async function saveSessionCookie(cookie: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY_COOKIE, cookie);
}

export async function loadSessionCookie(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY_COOKIE);
}

// ─── Conversation storage (AsyncStorage) ──────────────────────────────────────

function conversationKey(userId: string) {
  return `gbrain_conversations_${userId}`;
}

export async function saveConversations(
  userId: string,
  conversations: Conversation[],
): Promise<void> {
  await AsyncStorage.setItem(conversationKey(userId), JSON.stringify(conversations));
}

export async function loadConversations(userId: string): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(conversationKey(userId));
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}
