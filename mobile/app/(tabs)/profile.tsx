import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator,
} from 'react-native';
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
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text.primary }}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* Avatar card */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            padding: 20,
            borderRadius: 16,
            backgroundColor: Colors.bg.secondary,
            borderWidth: 1,
            borderColor: Colors.border.default,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.accent.bg,
              borderWidth: 2,
              borderColor: Colors.accent.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 26 }}>
              {user.avatarUrl ? '👤' : user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text.primary }}>
              {user.name}
            </Text>
            {user.email && (
              <Text style={{ fontSize: 13, color: Colors.text.secondary, marginTop: 2 }}>
                {user.email}
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 6,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: Colors.accent.bg,
                  borderWidth: 1,
                  borderColor: Colors.accent.border,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.accent.light, textTransform: 'capitalize' }}>
                  {user.provider}
                </Text>
              </View>
            </View>
          </View>
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
                letterSpacing: 0.5,
                marginBottom: 8,
                paddingHorizontal: 4,
              }}
            >
              {section.title}
            </Text>
            <View
              style={{
                borderRadius: 14,
                backgroundColor: Colors.bg.secondary,
                borderWidth: 1,
                borderColor: Colors.border.default,
                overflow: 'hidden',
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
                    paddingVertical: 13,
                    borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.border.subtle,
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, flexShrink: 0 }}>
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: item.mono ? 11 : 13,
                      color: item.value.startsWith('●') ? Colors.success : Colors.text.primary,
                      fontFamily: item.mono ? 'monospace' : undefined,
                      textTransform: item.capitalize ? 'capitalize' : undefined,
                      textAlign: 'right',
                      flex: 1,
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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 15,
            borderRadius: 14,
            backgroundColor: 'rgba(239,68,68,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.3)',
            marginTop: 4,
          }}
          activeOpacity={0.75}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <>
              <Text style={{ fontSize: 16 }}>🚪</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.error }}>Sign out</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
