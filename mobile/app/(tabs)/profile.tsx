import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { brainService } from '../../services/chat';
import { Colors } from '../../constants/colors';
import { API_BASE_URL } from '../../constants/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: brainStatus } = useQuery({
    queryKey: ['brainStatus'],
    queryFn: () => brainService.getStatus(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email ?? '—' },
        { label: 'Provider', value: user.provider, capitalize: true },
        { label: 'Source ID', value: user.sourceId, mono: true },
      ],
    },
    brainStatus
      ? {
          title: 'Brain',
          items: [
            { label: 'Pages indexed', value: String(brainStatus.pageCount) },
            { label: 'Engine', value: brainStatus.engine },
            { label: 'Version', value: brainStatus.version },
            { label: 'Status', value: brainStatus.connected ? '● Connected' : '○ Offline' },
          ],
        }
      : null,
    {
      title: 'App',
      items: [
        { label: 'API URL', value: API_BASE_URL, mono: true },
      ],
    },
  ].filter(Boolean) as { title: string; items: { label: string; value: string; capitalize?: boolean; mono?: boolean }[] }[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Avatar hero card */}
        <View
          style={{
            alignItems: 'center',
            padding: 28,
            borderRadius: 20,
            backgroundColor: Colors.bg.secondary,
            borderWidth: 1,
            borderColor: Colors.border.default,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          {/* Avatar circle */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: Colors.accent.default,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              shadowColor: Colors.accent.default,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '600', color: '#fff' }}>{initials}</Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.text.primary }}>{user.name}</Text>
          {user.email && (
            <Text style={{ fontSize: 13, color: Colors.text.muted, marginTop: 4 }}>{user.email}</Text>
          )}

          {/* Provider badge */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: Colors.orangeLight,
              borderWidth: 1,
              borderColor: Colors.orangeBorder,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.orange, textTransform: 'capitalize' }}>
              {user.provider}
            </Text>
          </View>

          {/* Brain status dot */}
          {brainStatus && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: brainStatus.connected ? Colors.success : Colors.border.default,
                }}
              />
              <Text style={{ fontSize: 12, color: Colors.text.muted }}>
                {brainStatus.connected ? `${brainStatus.pageCount} pages indexed` : 'Offline'}
              </Text>
            </View>
          )}
        </View>

        {/* Info sections */}
        {sections.map(section => (
          <View key={section.title}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: Colors.text.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              {section.title}
            </Text>
            <View
              style={{
                borderRadius: 16,
                backgroundColor: Colors.bg.secondary,
                borderWidth: 1,
                borderColor: Colors.border.default,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {section.items.map((item, i) => (
                <View
                  key={item.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.border.subtle,
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, color: Colors.text.muted, flexShrink: 0 }}>
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: item.mono ? 11 : 14,
                      color: item.value.startsWith('●') ? Colors.success : Colors.text.primary,
                      fontFamily: item.mono ? 'monospace' : undefined,
                      textTransform: item.capitalize ? 'capitalize' : undefined,
                      textAlign: 'right',
                      flex: 1,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: 'rgba(239,68,68,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.2)',
            marginTop: 4,
          }}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.error }}>Sign out</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
