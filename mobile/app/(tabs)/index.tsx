import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { Colors } from '../../constants/colors';
import ChatBubble from '../../components/chat/ChatBubble';
import MessageInput from '../../components/chat/MessageInput';
import ConversationList from '../../components/chat/ConversationList';
import type { Message } from '../../types';

const SUGGESTIONS = [
  'What are the key insights from my documents?',
  'Summarize my most recent uploads',
  'Show relationships between my knowledge pages',
  'What knowledge gaps exist in my brain?',
];

export default function ChatScreen() {
  const { user, logout } = useAuth();
  const {
    conversations, currentConversation, currentId, isSending,
    createConversation, deleteConversation, selectConversation, sendMessage,
  } = useChat(user?.id ?? null);

  const [showConversations, setShowConversations] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const messages = currentConversation?.messages ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const greeting = user?.name ? `Good day, ${user.name.split(' ')[0]}.` : 'Ask anything.';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowConversations(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
        >
          {/* Teal orb logo */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Colors.orange,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.orange,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 3,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary }}
              numberOfLines={1}
            >
              {currentConversation?.title ?? 'XandaCross'}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.text.muted }}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} ▾
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={createConversation}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: Colors.accent.bg,
              borderWidth: 1,
              borderColor: Colors.accent.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.accent.default, fontSize: 20, lineHeight: 24 }}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => logout()}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: Colors.bg.primary,
              borderWidth: 1,
              borderColor: Colors.border.default,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.text.muted, fontSize: 14 }}>⏻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages / empty state */}
      {messages.length === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 36 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '300',
              color: Colors.text.primary,
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {greeting}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.muted, marginBottom: 28 }}>
            Tap a suggestion or type a question.
          </Text>

          <View style={{ gap: 10 }}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => sendMessage(s)}
                activeOpacity={0.7}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: Colors.bg.secondary,
                  borderWidth: 1,
                  borderColor: Colors.border.default,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === 0 ? Colors.orange : Colors.accent.default,
                  }}
                />
                <Text style={{ fontSize: 14, color: Colors.text.secondary, flex: 1, lineHeight: 19 }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Sending indicator */}
      {isSending && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <ActivityIndicator size="small" color={Colors.accent.default} />
          <Text style={{ fontSize: 12, color: Colors.text.muted }}>Thinking…</Text>
        </View>
      )}

      <MessageInput onSend={sendMessage} disabled={isSending} />

      {/* Conversation drawer */}
      <Modal
        visible={showConversations}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConversations(false)}
      >
        <ConversationList
          conversations={conversations}
          currentId={currentId}
          onSelect={selectConversation}
          onDelete={deleteConversation}
          onNew={createConversation}
          onClose={() => setShowConversations(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}
