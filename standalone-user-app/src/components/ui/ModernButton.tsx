import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[size]];
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);
    return baseStyle;
  };

  const getTextStyle = () => {
    return [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#0057FF' : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <>
          {icon && (
            <Feather 
              name={icon} 
              size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
              color={variant === 'outline' ? '#0057FF' : '#FFFFFF'} 
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity 
        style={getButtonStyle()} 
        onPress={onPress} 
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[getButtonStyle(), styles[variant]]} 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  
  // Variants
  secondary: {
    backgroundColor: '#F5F7FA',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0057FF',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#1A1A1A',
  },
  outlineText: {
    color: '#0057FF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

export default ModernButton;
