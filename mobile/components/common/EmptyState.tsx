import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      {icon && (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: Colors.bg.secondary,
            borderWidth: 1,
            borderColor: Colors.border.default,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 1,
          }}
        >
          {icon}
        </View>
      )}
      <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 }}>
        {title}
      </Text>
      {description && (
        <Text style={{ fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
