import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface ModernCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  variant?: 'default' | 'gradient' | 'bordered' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  title,
  subtitle,
  image,
  icon,
  onPress,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = () => {
    const baseStyle: any[] = [styles.card, styles[padding]];
    if (variant !== 'gradient') baseStyle.push(styles[variant]);
    return baseStyle;
  };

  const renderHeader = () => {
    if (!title && !subtitle && !image && !icon) return null;

    return (
      <View style={styles.header}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {icon && !image && (
          <View style={styles.iconContainer}>
            <Feather name={icon} size={24} color="#0057FF" />
          </View>
        )}
        <View style={styles.headerText}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  };

  const renderContent = () => (
    <View style={getCardStyle()}>
      {renderHeader()}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={!onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles[padding], styles.gradient]}
        >
          {renderHeader()}
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  
  // Variants
  default: {
    backgroundColor: '#FFFFFF',
  },
  bordered: {
    borderWidth: 1,
    borderColor: '#E4E9F2',
  },
  elevated: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    // Gradient styles handled by LinearGradient
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 24,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  content: {
    flex: 1,
  },
});

export default ModernCard;
