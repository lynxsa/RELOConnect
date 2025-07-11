import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  type?: 'default' | 'email' | 'password' | 'phone' | 'numeric';
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  type = 'default',
  icon,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'numeric':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getSecureTextEntry = () => {
    return type === 'password' && !showPassword;
  };

  const getInputStyle = () => {
    const baseStyle: any[] = [styles.input];
    if (isFocused) baseStyle.push(styles.inputFocused);
    if (error) baseStyle.push(styles.inputError);
    if (disabled) baseStyle.push(styles.inputDisabled);
    if (multiline) baseStyle.push(styles.inputMultiline);
    return baseStyle;
  };

  const getContainerStyle = () => {
    const baseStyle: any[] = [styles.inputContainer];
    if (icon || type === 'password') baseStyle.push(styles.inputWithIcon);
    return baseStyle;
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View style={getContainerStyle()}>
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={isFocused ? '#0057FF' : '#8F9BB3'} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          placeholderTextColor="#8F9BB3"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={getKeyboardType()}
          secureTextEntry={getSecureTextEntry()}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        
        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Feather 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color="#8F9BB3" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={16} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    position: 'relative',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: 'transparent',
  },
  inputMultiline: {
    height: 96,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: '#0057FF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputDisabled: {
    backgroundColor: '#E4E9F2',
    color: '#8F9BB3',
  },
  leftIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  rightIcon: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default ModernInput;
