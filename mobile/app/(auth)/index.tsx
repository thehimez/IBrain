import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  SafeAreaView, ScrollView,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

const FEATURES = [
  { icon: '🔍', title: 'Hybrid Search', desc: 'Vector + BM25 across your knowledge' },
  { icon: '✨', title: 'AI Synthesis', desc: 'Answers with citations from your docs' },
  { icon: '🔒', title: 'Private by Design', desc: 'Your data is completely isolated' },
];

export default function LoginScreen() {
  const { user, isLoading, loginWithGoogle, loginWithReplit } = useAuth();

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: Colors.accent.bg,
            borderWidth: 1,
            borderColor: Colors.accent.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 36 }}>🧠</Text>
        </View>

        {/* Title */}
        <Text
          style={{ fontSize: 28, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 }}
        >
          GBrain
        </Text>
        <Text
          style={{ fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 }}
        >
          Your personal knowledge brain — upload documents, extract insights, ask anything.
        </Text>

        {/* Feature list */}
        <View style={{ width: '100%', gap: 12, marginBottom: 40 }}>
          {FEATURES.map(f => (
            <View
              key={f.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 14,
                backgroundColor: Colors.bg.secondary,
                borderWidth: 1,
                borderColor: Colors.border.default,
              }}
            >
              <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary }}>
                  {f.title}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 1 }}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign-in buttons */}
        <View style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            onPress={loginWithGoogle}
            disabled={isLoading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#ffffff',
              opacity: isLoading ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.bg.primary} />
            ) : (
              <>
                <Text style={{ fontSize: 18 }}>🔵</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loginWithReplit}
            disabled={isLoading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              height: 52,
              borderRadius: 14,
              backgroundColor: Colors.bg.secondary,
              borderWidth: 1,
              borderColor: Colors.border.default,
              opacity: isLoading ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary }}>
              Sign in with Replit
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{ fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 24 }}
        >
          Your knowledge is private and only visible to you.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
