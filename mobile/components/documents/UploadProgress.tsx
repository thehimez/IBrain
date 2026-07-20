import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { FileUploadEntry } from '../../types';
import { formatBytes } from '../../utils/format';

const STATUS_CONFIG = {
  pending:     { label: 'Ready',      bg: Colors.bg.tertiary,             text: Colors.text.secondary },
  uploading:   { label: 'Uploading',  bg: Colors.accent.bg,               text: Colors.accent.light },
  queued:      { label: 'Queued',     bg: 'rgba(16,185,129,0.15)',        text: Colors.success },
  error:       { label: 'Failed',     bg: 'rgba(239,68,68,0.15)',         text: Colors.error },
  unsupported: { label: 'Unsupported', bg: 'rgba(245,158,11,0.15)',       text: Colors.warning },
};

interface Props {
  entry: FileUploadEntry;
  onRemove?: () => void;
  uploading: boolean;
}

export default function UploadProgress({ entry, onRemove, uploading }: Props) {
  const cfg = STATUS_CONFIG[entry.status];
  const canRemove = !uploading && ['pending', 'error', 'unsupported'].includes(entry.status);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: Colors.border.default,
      }}
    >
      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.text.primary }} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.text.muted, marginTop: 2 }}>
          {formatBytes(entry.size)}
          {entry.error ? ` · ${entry.error}` : ''}
        </Text>

        {/* Progress bar */}
        {entry.status === 'uploading' && (
          <View
            style={{
              height: 3,
              borderRadius: 2,
              backgroundColor: Colors.border.default,
              marginTop: 6,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${entry.progress}%`,
                backgroundColor: Colors.accent.default,
                borderRadius: 2,
              }}
            />
          </View>
        )}
      </View>

      {/* Status badge */}
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          backgroundColor: cfg.bg,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '600', color: cfg.text }}>
          {cfg.label}
        </Text>
      </View>

      {/* Remove */}
      {canRemove && onRemove && (
        <TouchableOpacity onPress={onRemove} style={{ padding: 4 }}>
          <Text style={{ color: Colors.text.disabled, fontSize: 16 }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
