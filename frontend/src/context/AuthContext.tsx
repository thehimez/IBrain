import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  provider: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  sourceId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: () => void;
  loginWithReplit: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json() as AuthUser;
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /** Primary login: full-page redirect to Google OAuth. */
  const loginWithGoogle = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  /** Legacy Replit login (popup, kept for backward compat during Phase 1). */
  const loginWithReplit = useCallback(() => {
    const domain = window.location.host;
    const popup = window.open(
      `https://replit.com/auth_with_repl_site?domain=${domain}`,
      '_blank',
      'width=400,height=600,menubar=no,toolbar=no,location=no',
    );
    const handler = async (e: MessageEvent) => {
      if (e.data === 'authed') {
        window.removeEventListener('message', handler);
        popup?.close();
        setIsLoading(true);
        await fetchMe();
      }
    };
    window.addEventListener('message', handler);
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore network errors */ }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginWithReplit, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
