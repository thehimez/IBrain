import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { completeMobileLogin, fetchMe } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const { refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawCode = params.code;
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    if (!code) {
      setError('The Google login response did not include a code.');
      return;
    }

    let active = true;
    (async () => {
      let user = await completeMobileLogin(code);
      if (!active) return;
      if (!user) {
        // The AuthSession promise may have exchanged the same one-time code
        // first. Refresh once before treating the callback as failed.
        user = await fetchMe();
      }
      if (!user) {
        setError('Google login could not be completed. Please try again.');
        return;
      }
      await refetchUser();
      if (active) router.replace('/(tabs)');
    })().catch(() => {
      if (active) setError('Google login could not be completed. Please try again.');
    });

    return () => {
      active = false;
    };
  }, [params.code, refetchUser]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={styles.text}>Finishing Google sign-in…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#0f172a',
  },
  text: { color: '#e2e8f0', fontSize: 16 },
  error: { color: '#fca5a5', fontSize: 16, textAlign: 'center' },
});
