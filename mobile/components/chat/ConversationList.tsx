import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import type { Conversation } from '../../types';
import { formatRelativeTime, truncate } from '../../utils/format';

interface Props {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export default function ConversationList({
  conversations, currentId, onSelect, onDelete, onNew, onClose,
}: Props) {
  const handleDelete = (id: string, title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete conversation', `Delete "${truncate(title, 40)}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.secondary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text.primary }}>
          Conversations
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: Colors.accent.light, fontSize: 14 }}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* New conversation button */}
      <TouchableOpacity
        onPress={() => { onNew(); onClose(); }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: Colors.accent.bg,
            borderWidth: 1,
            borderColor: Colors.accent.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: Colors.accent.light, fontSize: 16 }}>+</Text>
        </View>
        <Text style={{ color: Colors.accent.light, fontSize: 14, fontWeight: '600' }}>
          New conversation
        </Text>
      </TouchableOpacity>

      {/* List */}
      {conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.text.muted, fontSize: 14 }}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { onSelect(item.id); onClose(); }}
              onLongPress={() => handleDelete(item.id, item.title)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border.subtle,
                backgroundColor: item.id === currentId ? Colors.accent.bg : 'transparent',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: item.id === currentId ? '600' : '400',
                    color: item.id === currentId ? Colors.accent.light : Colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.text.muted, marginTop: 2 }}>
                  {item.messages.length} msg{item.messages.length !== 1 ? 's' : ''} · {formatRelativeTime(item.updatedAt)}
                </Text>
              </View>
              {item.id === currentId && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.accent.default,
                  }}
                />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
