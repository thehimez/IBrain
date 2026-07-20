import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  size?: 'small' | 'large';
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'large', label, fullScreen = false }: Props) {
  const content = (
    <View className="items-center gap-3">
      <ActivityIndicator size={size} color={Colors.accent.default} />
      {label && <Text className="text-slate-400 text-sm">{label}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-navy-900">
        {content}
      </View>
    );
  }

  return content;
}
