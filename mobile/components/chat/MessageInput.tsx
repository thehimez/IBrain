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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: Colors.border.default,
          backgroundColor: Colors.bg.secondary,
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
            minHeight: 42,
            maxHeight: 120,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 21,
            backgroundColor: Colors.bg.primary,
            borderWidth: 1.5,
            borderColor: text.length > 0 ? Colors.border.focus : Colors.border.default,
            color: Colors.text.primary,
            fontSize: 15,
            lineHeight: 20,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.75}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: canSend ? Colors.orange : Colors.bg.primary,
            borderWidth: 1.5,
            borderColor: canSend ? Colors.orange : Colors.border.default,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: canSend ? Colors.orange : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: canSend ? 4 : 0,
          }}
        >
          <Text style={{ fontSize: 18, color: canSend ? '#fff' : Colors.text.disabled }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
