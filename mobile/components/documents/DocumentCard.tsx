import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { XandaCrossFile } from '../../types';
import { formatBytes, formatRelativeTime } from '../../utils/format';

const EXT_CONFIG: Record<string, { color: string; bg: string }> = {
  md:   { color: '#497e7e', bg: 'rgba(73,126,126,0.10)' },
  txt:  { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
  html: { color: '#ef5520', bg: 'rgba(239,85,32,0.10)' },
  json: { color: '#224348', bg: 'rgba(34,67,72,0.10)' },
};

function extFromMime(mime: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext) return ext;
  if (mime.includes('markdown')) return 'md';
  if (mime.includes('html')) return 'html';
  if (mime.includes('json')) return 'json';
  return 'txt';
}

interface Props {
  file: XandaCrossFile;
  onPress: () => void;
}

export default function DocumentCard({ file, onPress }: Props) {
  const ext = extFromMime(file.mime_type, file.filename);
  const cfg = EXT_CONFIG[ext] ?? { color: Colors.accent.default, bg: Colors.accent.bg };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
        backgroundColor: Colors.bg.secondary,
      }}
    >
      {/* Type badge */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: cfg.bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.color, letterSpacing: 0.5 }}>
          {ext.toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ fontSize: 15, fontWeight: '500', color: Colors.text.primary }}
          numberOfLines={1}
        >
          {file.filename}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.text.muted, marginTop: 3 }}>
          {formatBytes(file.size_bytes)} · {formatRelativeTime(file.created_at)}
        </Text>
      </View>

      <Text style={{ color: Colors.border.default, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}
