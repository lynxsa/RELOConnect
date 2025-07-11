import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading = ({
  size = 'large',
  color = '#0057FF',
  text = 'Loading...',
  style,
  textStyle,
  fullScreen = false,
  overlay = false,
}: LoadingProps) => {
  const getContainerStyle = () => {
    const baseStyle = [
      styles.container,
      style,
    ];

    if (fullScreen) {
      return [...baseStyle, styles.fullScreen];
    }

    if (overlay) {
      return [...baseStyle, styles.overlay];
    }

    return baseStyle;
  };

  const getTextStyle = () => [
    styles.text,
    textStyle,
  ];

  return (
    <View style={getContainerStyle()}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={getTextStyle()}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default Loading;
