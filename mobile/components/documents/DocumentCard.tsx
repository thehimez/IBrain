import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { GBrainFile } from '../../types';
import { formatBytes, formatRelativeTime } from '../../utils/format';

const EXT_COLORS: Record<string, string> = {
  md:   '#3b82f6',
  txt:  '#10b981',
  html: '#f59e0b',
  json: '#8b5cf6',
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
  file: GBrainFile;
  onPress: () => void;
}

export default function DocumentCard({ file, onPress }: Props) {
  const ext = extFromMime(file.mime_type, file.filename);
  const color = EXT_COLORS[ext] ?? Colors.accent.default;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
        backgroundColor: Colors.bg.primary,
      }}
    >
      {/* Type badge */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          backgroundColor: color + '22',
          borderWidth: 1,
          borderColor: color + '44',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '700', color, fontFamily: 'monospace' }}>
          {ext.toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.text.primary }} numberOfLines={1}>
          {file.filename}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.text.muted, marginTop: 2 }}>
          {formatBytes(file.size_bytes)} · {formatRelativeTime(file.created_at)}
        </Text>
      </View>

      <Text style={{ color: Colors.text.disabled, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
