import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

/** Orange + teal orb — pure RN, no extra deps */
function Orb() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 40 }}>
      {/* Teal halo */}
      <View
        style={{
          width: 120,
          height: 40,
          borderRadius: 60,
          backgroundColor: 'rgba(73,126,126,0.22)',
          position: 'absolute',
          bottom: -8,
          transform: [{ scaleX: 1.1 }],
        }}
      />
      {/* Main orange sphere */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: Colors.orange,
          shadowColor: Colors.orange,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        {/* Highlight */}
        <View
          style={{
            width: 36,
            height: 24,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.30)',
            position: 'absolute',
            top: 14,
            left: 16,
            transform: [{ rotate: '-20deg' }],
          }}
        />
      </View>
    </View>
  );
}

/** Minimal Google "G" SVG-free badge */
function GoogleBadge() {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { user, isLoading, loginWithGoogle, loginWithReplit } = useAuth();

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg.primary} />

      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 }}>
        {/* Headline */}
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Text
            style={{
              fontSize: 56,
              fontWeight: '200',
              color: Colors.text.primary,
              letterSpacing: -1.5,
              lineHeight: 64,
            }}
          >
            Hello.
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '400',
              color: Colors.text.secondary,
              marginTop: 16,
              lineHeight: 26,
            }}
          >
            I am XandaCross,{'\n'}
            your personal knowledge brain.
          </Text>

          {/* Orb centered */}
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <Orb />
          </View>

          {/* Feature pills */}
          <View style={{ gap: 10, marginTop: 8 }}>
            {[
              { dot: Colors.accent.default, label: 'Hybrid vector + keyword search' },
              { dot: Colors.orange, label: 'AI synthesis with citations' },
              { dot: Colors.accent.dim, label: 'Private — your data only' },
            ].map(f => (
              <View
                key={f.label}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: f.dot,
                  }}
                />
                <Text style={{ fontSize: 14, color: Colors.text.secondary }}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA buttons */}
        <View style={{ gap: 12 }}>
          {/* Primary — Google */}
          <TouchableOpacity
            onPress={loginWithGoogle}
            disabled={isLoading}
            activeOpacity={0.82}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              height: 56,
              borderRadius: 16,
              backgroundColor: Colors.text.primary,
              opacity: isLoading ? 0.6 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <GoogleBadge />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 0.2 }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Secondary — Replit */}
          <TouchableOpacity
            onPress={loginWithReplit}
            disabled={isLoading}
            activeOpacity={0.82}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              height: 52,
              borderRadius: 16,
              backgroundColor: Colors.bg.secondary,
              borderWidth: 1.5,
              borderColor: Colors.border.default,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16, color: Colors.text.secondary }}>⚡</Text>
            <Text style={{ fontSize: 15, fontWeight: '500', color: Colors.text.secondary }}>
              Sign in with Replit
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 4 }}>
            Your knowledge is private and only visible to you.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
