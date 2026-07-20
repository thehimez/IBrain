import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        paddingVertical: 6,
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar dot */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isUser ? Colors.orange : Colors.accent.bg,
          borderWidth: 1.5,
          borderColor: isUser ? Colors.orangeBorder : Colors.accent.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginBottom: 2,
        }}
      >
        <Text style={{ fontSize: 12 }}>{isUser ? '●' : '✦'}</Text>
      </View>

      {/* Bubble */}
      <View
        style={{
          maxWidth: '80%',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          gap: 4,
        }}
      >
        {/* Timestamp */}
        <Text style={{ fontSize: 10, color: Colors.text.muted, marginHorizontal: 4 }}>
          {copied ? '✓ Copied' : formatRelativeTime(message.timestamp)}
        </Text>

        {/* Content bubble */}
        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.88}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            borderTopRightRadius: isUser ? 4 : 18,
            borderTopLeftRadius: isUser ? 18 : 4,
            backgroundColor: isUser ? Colors.text.primary : Colors.bg.secondary,
            borderWidth: isUser ? 0 : 1,
            borderColor: Colors.border.default,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <MarkdownRenderer
              content={message.content}
              textStyle={isUser ? { color: '#ffffff' } : { color: Colors.text.primary }}
            />
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
