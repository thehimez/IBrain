import '../global.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { fetchMe, loginWithGoogle, loginWithReplit, logout } from '../services/auth';
import { loadUser } from '../utils/storage';
import { AuthContext } from '../hooks/useAuth';
import { API_BASE_URL } from '../constants/api';
import type { AuthUser } from '../types';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        // First try cached user for instant display
        const cached = await loadUser();
        if (cached) setUser(cached);

        // Then validate with server
        const live = await fetchMe();
        setUser(live);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  const handleLoginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await loginWithGoogle();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoginWithReplit = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use the dev domain so Replit auth popup resolves correctly
      const domain = API_BASE_URL.replace('https://', '').replace('http://', '');
      const u = await loginWithReplit(domain);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    queryClient.clear();
  }, []);

  const refetchUser = useCallback(async () => {
    const u = await fetchMe();
    setUser(u);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user,
            isLoading,
            loginWithGoogle: handleLoginWithGoogle,
            loginWithReplit: handleLoginWithReplit,
            logout: handleLogout,
            refetchUser,
          }}
        >
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthContext.Provider>
      </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
