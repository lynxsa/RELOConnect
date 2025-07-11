import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: any;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

const Card = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
  shadow = true,
  borderRadius = 12,
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
  borderWidth = 1,
}: CardProps) => {
  const getContainerStyle = () => {
    const baseStyle = [
      styles.card,
      styles[`padding_${padding}`],
      { borderRadius },
      shadow && styles.shadow,
      style,
    ];

    switch (variant) {
      case 'elevated':
        return [...baseStyle, styles.elevated];
      case 'outlined':
        return [...baseStyle, styles.outlined, { borderColor, borderWidth }];
      case 'gradient':
        return [...baseStyle, styles.gradient];
      default:
        return [...baseStyle, { backgroundColor }];
    }
  };

  const CardContent = () => (
    <View style={getContainerStyle()}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          style={[
            styles.gradientBackground,
            styles[`padding_${padding}`],
            { borderRadius },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </Component>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: 8,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 20,
  },
  padding_xl: {
    padding: 24,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  gradient: {
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
});

export default Card;
