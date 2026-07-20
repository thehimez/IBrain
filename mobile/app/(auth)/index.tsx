import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

/** Orange orb with specular highlight */
function Orb() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 28 }}>
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

/** Proper multicolor Google "G" logo via SVG */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { icon: 'search-outline',   title: 'Hybrid Search',     desc: 'Vector + BM25 search across your knowledge' },
  { icon: 'sparkles-outline', title: 'AI Synthesis',      desc: 'Answers with citations from your own docs'  },
  { icon: 'shield-outline',   title: 'Private by Design', desc: 'Your data is completely isolated and secure' },
];

export default function LoginScreen() {
  const { user, isLoading, loginWithGoogle } = useAuth();

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 48, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              <GoogleLogo size={20} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 0.2 }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer — always fully visible inside ScrollView */}
        <Text style={{ fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 16 }}>
          Your knowledge is private and only visible to you.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
