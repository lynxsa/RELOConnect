import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Loading } from '../components/ui';

export default function SplashScreen() {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.gradient.primary as [string, string]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>RELOConnect</Text>
        <Text style={styles.tagline}>Revolutionising Relocations</Text>
        <Text style={styles.subtitle}>Smart. Safe. Seamless.</Text>
        
        <View style={styles.loadingContainer}>
          <Loading size="large" overlay={false} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 48,
  },
  loadingContainer: {
    marginTop: 32,
  },
});
