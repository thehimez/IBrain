import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  SafeAreaView, Modal, ActivityIndicator,
} from 'react-native';
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
  const { user } = useAuth();
  const {
    conversations, currentConversation, currentId, isSending,
    createConversation, deleteConversation, selectConversation, sendMessage,
  } = useChat(user?.id ?? null);

  const [showConversations, setShowConversations] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const messages = currentConversation?.messages ?? [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowConversations(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}
        >
          <Text style={{ fontSize: 22 }}>🧠</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary }}
              numberOfLines={1}
            >
              {currentConversation?.title ?? 'GBrain'}
            </Text>
            <Text style={{ fontSize: 10, color: Colors.text.muted }}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={{ color: Colors.text.muted, fontSize: 12 }}>▾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={createConversation}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: Colors.accent.bg,
            borderWidth: 1,
            borderColor: Colors.accent.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 10,
          }}
        >
          <Text style={{ color: Colors.accent.light, fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 }}>
            Ask your brain anything
          </Text>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => sendMessage(s)}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: Colors.bg.secondary,
                borderWidth: 1,
                borderColor: Colors.border.default,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 13, color: Colors.text.secondary, lineHeight: 18 }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Sending indicator */}
      {isSending && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
          <ActivityIndicator size="small" color={Colors.accent.default} />
          <Text style={{ fontSize: 12, color: Colors.text.muted }}>Thinking…</Text>
        </View>
      )}

      {/* Input */}
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
