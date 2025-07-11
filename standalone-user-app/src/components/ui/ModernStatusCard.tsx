import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface ModernStatusCardProps {
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  imageSource?: ImageSourcePropType;
  iconName?: keyof typeof Feather.glyphMap;
  value?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ModernStatusCard: React.FC<ModernStatusCardProps> = ({
  title,
  status,
  description,
  imageSource,
  iconName,
  value,
  onPress,
  style,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'in-progress':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'in-progress':
        return 'loader';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'info';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Feather
              name={iconName || getStatusIcon()}
              size={24}
              color={getStatusColor()}
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </Text>
          </View>
        </View>
        
        {value && (
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{value}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0057FF',
  },
});
