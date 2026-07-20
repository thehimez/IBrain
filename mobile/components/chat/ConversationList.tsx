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
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 18,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary }}>
          Conversations
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: Colors.accent.default, fontSize: 15, fontWeight: '500' }}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* New conversation */}
      <TouchableOpacity
        onPress={() => { onNew(); onClose(); }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.orange,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, lineHeight: 24 }}>+</Text>
        </View>
        <Text style={{ color: Colors.text.primary, fontSize: 15, fontWeight: '500' }}>
          New conversation
        </Text>
      </TouchableOpacity>

      {/* List */}
      {conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
          <Text style={{ color: Colors.text.muted, fontSize: 15 }}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { onSelect(item.id); onClose(); }}
              onLongPress={() => handleDelete(item.id, item.title)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border.subtle,
                backgroundColor: item.id === currentId
                  ? Colors.accent.bg
                  : Colors.bg.secondary,
              }}
            >
              {/* Active indicator */}
              <View
                style={{
                  width: 3,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: item.id === currentId ? Colors.accent.default : 'transparent',
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: item.id === currentId ? '600' : '400',
                    color: item.id === currentId ? Colors.accent.dim : Colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.muted, marginTop: 2 }}>
                  {item.messages.length} msg{item.messages.length !== 1 ? 's' : ''} · {formatRelativeTime(item.updatedAt)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
