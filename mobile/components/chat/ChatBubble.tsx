import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import type { Message } from '../../types';
import MarkdownRenderer from './MarkdownRenderer';
import SourceChips from './SourceChips';
import TypingIndicator from './TypingIndicator';
import { formatRelativeTime } from '../../utils/format';

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleLongPress = async () => {
    if (message.content) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Clipboard.setStringAsync(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View
      style={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 4,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: isUser ? Colors.accent.bg : Colors.bg.secondary,
          borderWidth: 1,
          borderColor: isUser ? Colors.accent.border : Colors.border.default,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 14 }}>{isUser ? '👤' : '🧠'}</Text>
      </View>

      {/* Bubble */}
      <View
        style={{
          flex: 1,
          maxWidth: '85%',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          gap: 4,
        }}
      >
        {/* Timestamp */}
        <Text style={{ fontSize: 10, color: Colors.text.muted }}>
          {copied ? '✓ Copied' : formatRelativeTime(message.timestamp)}
        </Text>

        {/* Content bubble */}
        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.85}
          style={{
            maxWidth: '100%',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            borderTopRightRadius: isUser ? 4 : 14,
            borderTopLeftRadius: isUser ? 14 : 4,
            backgroundColor: isUser ? Colors.accent.bg : Colors.bg.secondary,
            borderWidth: 1,
            borderColor: isUser ? Colors.accent.border : Colors.border.default,
          }}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </TouchableOpacity>

        {/* Source chips */}
        {!message.isStreaming && message.citations && message.citations.length > 0 && (
          <SourceChips citations={message.citations} gaps={message.gaps} />
        )}
      </View>
    </View>
  );
}
