import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    setText('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: Colors.border.default,
          backgroundColor: Colors.bg.primary,
        }}
      >
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Ask your brain anything…"
          placeholderTextColor={Colors.text.disabled}
          multiline
          maxLength={4000}
          onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: Colors.bg.secondary,
            borderWidth: 1,
            borderColor: text.length > 0 ? Colors.border.focus : Colors.border.default,
            color: Colors.text.primary,
            fontSize: 15,
            lineHeight: 20,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: canSend ? Colors.accent.default : Colors.bg.secondary,
            borderWidth: 1,
            borderColor: canSend ? Colors.accent.dim : Colors.border.default,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18, opacity: canSend ? 1 : 0.4 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
