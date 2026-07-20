import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import type { Citation } from '../../types';

interface Props {
  citations: Citation[];
  gaps?: string[];
}

export default function SourceChips({ citations, gaps }: Props) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  if (!citations.length && (!gaps || gaps.length === 0)) return null;

  // Deduplicate citations by slug
  const unique = citations.filter(
    (c, i, arr) => arr.findIndex(x => x.page_slug === c.page_slug) === i,
  );

  return (
    <View style={{ gap: 6, marginTop: 4 }}>
      {unique.length > 0 && (
        <View>
          <Text style={{
            fontSize: 10,
            color: Colors.text.muted,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Sources
          </Text>
          {/* Use flexWrap instead of horizontal ScrollView to avoid unconstrained
              height in FlatList items on Android */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {unique.map((c, i) => (
              <TouchableOpacity
                key={c.page_slug}
                onPress={() => setSelectedSlug(c.page_slug)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: Colors.accent.bg,
                  borderWidth: 1,
                  borderColor: Colors.accent.border,
                }}
              >
                <Text style={{ fontSize: 10, color: Colors.accent.light, fontWeight: '600' }}>
                  [{i + 1}]
                </Text>
                <Text
                  style={{ fontSize: 11, color: Colors.accent.light, maxWidth: 140 }}
                  numberOfLines={1}
                >
                  {c.page_slug.split('/').pop() ?? c.page_slug}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {gaps && gaps.length > 0 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 6,
          padding: 8,
          borderRadius: 8,
          backgroundColor: 'rgba(245,158,11,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(245,158,11,0.25)',
        }}>
          <Text style={{ fontSize: 12, color: Colors.warning }}>⚠</Text>
          <Text style={{ flex: 1, fontSize: 11, color: Colors.warning, lineHeight: 16 }}>
            {gaps[0]}
          </Text>
        </View>
      )}

      {/* Slug detail modal */}
      <Modal
        visible={selectedSlug !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSlug(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}
          onPress={() => setSelectedSlug(null)}
        >
          <Pressable onPress={() => {}}>
            <View style={{
              backgroundColor: Colors.bg.secondary,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: Colors.border.default,
            }}>
              <Text style={{ fontSize: 11, color: Colors.text.muted, marginBottom: 4 }}>Source document</Text>
              <Text style={{ fontSize: 14, color: Colors.accent.light, fontFamily: 'monospace' }}>
                {selectedSlug}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedSlug(null)}
                style={{
                  marginTop: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: Colors.bg.tertiary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.text.secondary, fontSize: 14 }}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
