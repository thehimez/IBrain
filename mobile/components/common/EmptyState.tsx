import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {icon && (
        <View className="w-16 h-16 rounded-2xl bg-navy-800 border border-navy-600 items-center justify-center mb-4">
          {icon}
        </View>
      )}
      <Text className="text-base font-semibold text-slate-300 text-center mb-2">{title}</Text>
      {description && (
        <Text className="text-sm text-slate-500 text-center leading-relaxed mb-4">
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
