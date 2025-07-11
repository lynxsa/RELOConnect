import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
}

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
  size = 'md',
  variant = 'default',
  ...props
}: InputProps) => {
  const getInputStyle = () => {
    const baseStyle = [
      styles.input,
      styles[`input_${size}`],
      disabled && styles.disabled,
      error && styles.error,
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      multiline && styles.multiline,
      inputStyle,
    ].filter(Boolean);

    switch (variant) {
      case 'outline':
        return [...baseStyle, styles.outline];
      case 'filled':
        return [...baseStyle, styles.filled];
      default:
        return baseStyle;
    }
  };

  const getContainerStyle = () => [
    styles.container,
    containerStyle,
  ];

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Feather 
              name={leftIcon} 
              size={getIconSize()} 
              color={error ? '#ef4444' : disabled ? '#94a3b8' : '#64748b'} 
            />
          </View>
        )}
        
        <TextInput
          style={getInputStyle() as any}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={disabled}
          >
            <Feather 
              name={rightIcon} 
              size={getIconSize()} 
              color={error ? '#ef4444' : disabled ? '#94a3b8' : '#64748b'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  labelError: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 16,
    fontWeight: '400',
  },
  input_sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  input_md: {
    height: 44,
    paddingHorizontal: 16,
  },
  input_lg: {
    height: 52,
    paddingHorizontal: 20,
  },
  inputWithLeftIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  multiline: {
    height: 'auto',
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  disabled: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
  },
  error: {
    borderColor: '#ef4444',
  },
  outline: {
    borderWidth: 2,
    borderColor: '#0057FF',
    backgroundColor: 'transparent',
  },
  filled: {
    borderWidth: 0,
    backgroundColor: '#f1f5f9',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});

export default Input;
