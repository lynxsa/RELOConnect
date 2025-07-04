import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  text,
  overlay = false,
  style,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    }),
    ...style,
  };

  const textStyle: TextStyle = {
    marginTop: 16,
    fontSize: 16,
    color: overlay ? '#FFFFFF' : colors.text,
    textAlign: 'center',
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={size}
        color={overlay ? '#FFFFFF' : colors.primary}
      />
      {text && <Text style={textStyle}>{text}</Text>}
    </View>
  );
};
