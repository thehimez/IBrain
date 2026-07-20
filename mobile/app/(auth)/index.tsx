import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

/** Orange orb with highlight — no puddle shadow, matches web simulator */
function Orb() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 32 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: Colors.orange,
          shadowColor: Colors.orange,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.40,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        {/* Specular highlight */}
        <View
          style={{
            width: 34,
            height: 22,
            borderRadius: 17,
            backgroundColor: 'rgba(255,255,255,0.32)',
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

/** Google "G" badge */
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

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { icon: 'search-outline',   title: 'Hybrid Search',      desc: 'Vector + BM25 search across your knowledge' },
  { icon: 'sparkles-outline', title: 'AI Synthesis',       desc: 'Answers with citations from your own docs'  },
  { icon: 'shield-outline',   title: 'Private by Design',  desc: 'Your data is completely isolated and secure' },
];

export default function LoginScreen() {
  const { user, isLoading, loginWithGoogle } = useAuth();

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32 }}>

        {/* Headline */}
        <Text
          style={{
            fontSize: 52,
            fontWeight: '300',
            color: Colors.text.primary,
            letterSpacing: -1.5,
            lineHeight: 60,
          }}
        >
          Hello.
        </Text>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '400',
            color: Colors.text.secondary,
            marginTop: 12,
            lineHeight: 25,
          }}
        >
          I am XandaCross,{'\n'}your personal knowledge brain.
        </Text>

        {/* Orb */}
        <Orb />

        {/* Feature cards */}
        <View style={{ gap: 10, marginBottom: 28 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <View
              key={title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: Colors.bg.secondary,
                borderWidth: 1,
                borderColor: Colors.border.default,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 13,
              }}
            >
              {/* Icon box */}
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  backgroundColor: Colors.accent.bg,
                  borderWidth: 1,
                  borderColor: Colors.accent.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Ionicons name={icon} size={16} color={Colors.accent.default} />
              </View>

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary }}>
                  {title}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 2, lineHeight: 17 }}>
                  {desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
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

        <Text style={{ fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 14 }}>
          Your knowledge is private and only visible to you.
        </Text>
      </View>
    </SafeAreaView>
  );
}
