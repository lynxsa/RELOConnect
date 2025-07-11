import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface RELOCareScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export default function RELOCareScreen({ navigation, onBack }: RELOCareScreenProps) {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              navigation?.goBack();
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>❤️ RELOCare</Text>
          <Text style={styles.subtitle}>Community donations and item sharing</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.content}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📦</Text>
          <Text style={styles.featureTitle}>Donate Items</Text>
          <Text style={styles.featureDesc}>Share unused furniture, appliances, and household items with people moving in</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>List Items</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🛍️</Text>
          <Text style={styles.featureTitle}>Community Marketplace</Text>
          <Text style={styles.featureDesc}>Browse available items in your area for your new home</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Browse Items</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🌱</Text>
          <Text style={styles.featureTitle}>Eco-Friendly Moving</Text>
          <Text style={styles.featureDesc}>Reduce waste and help the environment while moving</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>🚧 Coming Soon</Text>
        <Text style={styles.comingSoonDesc}>Full RELOCare functionality will be available in the next update</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ef4444',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fecaca',
  },
  content: {
    padding: 20,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  comingSoon: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
