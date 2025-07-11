import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'minimal';
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  showBackButton = false,
  rightComponent,
  style,
}) => {
  const renderHeader = () => (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={['#0057FF', '#00B2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, style]}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, styles.gradientTitle]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, styles.gradientSubtitle]}>{subtitle}</Text>}
          </View>
          {rightComponent && (
            <View style={styles.rightComponent}>
              {rightComponent}
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }

  return renderHeader();
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  } as TextStyle,
  gradientTitle: {
    color: '#FFFFFF',
  },
  gradientSubtitle: {
    color: '#E0F2FF',
  },
  rightComponent: {
    marginLeft: 16,
  },
});
