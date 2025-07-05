import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactElement;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 16 };
      case 'large':
        return { height: 50, paddingHorizontal: 24 };
      default:
        return { height: 44, paddingHorizontal: 20 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const buttonStyle: ViewStyle = {
    ...getButtonSize(),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    ...style,
  };

  const textStyleFinal: TextStyle = {
    fontSize: getTextSize(),
    fontWeight: '600',
    marginLeft: icon ? 8 : 0,
    ...textStyle,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradient.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {loading && <ActivityIndicator size="small" color="#FFFFFF" testID="loading-indicator" />}
          {!loading && icon}
          {!loading && (
            <Text style={[textStyleFinal, { color: '#FFFFFF' }]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const variantTextColors = {
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, variantStyles[variant]]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
      {!loading && icon}
      {!loading && (
        <Text style={[textStyleFinal, { color: variantTextColors[variant] }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
