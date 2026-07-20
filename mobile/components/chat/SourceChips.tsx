import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { documentsService } from '../../services/documents';
import { formatBytes } from '../../utils/format';
import type { Citation } from '../../types';

interface Props {
  citations: Citation[];
  gaps?: string[];
}

interface FilePreview {
  filename: string;
  mime_type?: string;
  size_bytes?: number;
  content?: string | null;
}

export default function SourceChips({ citations, gaps }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [errorSlug, setErrorSlug] = useState<string | null>(null);

  if (!citations.length && (!gaps || gaps.length === 0)) return null;

  // Deduplicate by slug
  const unique = citations.filter(
    (c, i, arr) => arr.findIndex(x => x.page_slug === c.page_slug) === i,
  );

  const openSource = async (slug: string) => {
    setLoading(true);
    setErrorSlug(null);
    setPreview(null);
    try {
      const file = await documentsService.getBySlug(slug);
      setPreview({
        filename: file.filename ?? slug.split('/').pop() ?? slug,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        // backend returns content (not content_raw) for /api/files/:id
        content: (file as any).content ?? file.content_raw ?? null,
      });
    } catch {
      setErrorSlug(slug);
      // Still open the modal to show the error
      setPreview({ filename: slug.split('/').pop() ?? slug, content: null });
    } finally {
      setLoading(false);
    }
  };

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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {unique.map((c, i) => (
              <TouchableOpacity
                key={c.page_slug}
                onPress={() => openSource(c.page_slug)}
                activeOpacity={0.75}
                disabled={loading}
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
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.accent.light} style={{ width: 14, height: 14 }} />
                ) : (
                  <Text style={{ fontSize: 10, color: Colors.accent.light, fontWeight: '600' }}>
                    [{i + 1}]
                  </Text>
                )}
                <Text
                  style={{ fontSize: 11, color: Colors.accent.light, maxWidth: 160 }}
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

      {/* Document content modal */}
      <Modal
        visible={preview !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPreview(null)}
      >
        {preview && (
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.default,
              backgroundColor: Colors.bg.secondary,
            }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary }}
                  numberOfLines={1}
                >
                  {preview.filename}
                </Text>
                {preview.size_bytes != null && (
                  <Text style={{ fontSize: 11, color: Colors.text.muted }}>
                    {preview.mime_type ?? 'text'} · {formatBytes(preview.size_bytes)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setPreview(null)}
                style={{ paddingLeft: 16 }}
              >
                <Text style={{ color: Colors.accent.default, fontSize: 15, fontWeight: '500' }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {errorSlug ? (
                <View style={{ marginTop: 40, alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>⚠️</Text>
                  <Text style={{ fontSize: 14, color: Colors.text.muted, textAlign: 'center' }}>
                    Could not load document.{'\n'}The source may not be available yet.
                  </Text>
                </View>
              ) : preview.content ? (
                <Text style={{
                  fontSize: 13,
                  color: Colors.text.secondary,
                  fontFamily: 'monospace',
                  lineHeight: 21,
                }}>
                  {preview.content}
                </Text>
              ) : (
                <Text style={{ color: Colors.text.muted, fontSize: 14, textAlign: 'center', marginTop: 40 }}>
                  No preview available
                </Text>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}
