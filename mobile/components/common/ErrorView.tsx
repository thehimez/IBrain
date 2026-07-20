import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-800/40 items-center justify-center mb-4">
        <Text style={{ fontSize: 20 }}>⚠</Text>
      </View>
      <Text className="text-base font-semibold text-red-400 text-center mb-2">Something went wrong</Text>
      <Text className="text-sm text-slate-500 text-center leading-relaxed mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="px-5 py-2.5 rounded-xl bg-navy-700 border border-navy-600"
        >
          <Text className="text-sm font-semibold text-slate-300">Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
