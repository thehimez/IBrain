import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen label="Loading…" />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)" />;
}
