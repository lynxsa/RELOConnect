import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface HomeScreenProps {
  navigation?: any;
  onNavigate?: (screen: string) => void;
}

export default function HomeScreen({ navigation, onNavigate }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RELOConnect</Text>
        <Text style={styles.subtitle}>Revolutionising Relocations – Smart. Safe. Seamless.</Text>
      </View>

      {/* Core Modules */}
      <View style={styles.modulesContainer}>
        <Text style={styles.sectionTitle}>Core Modules</Text>
        
        {/* RELOConnect Main */}
        <TouchableOpacity 
          style={[styles.moduleCard, styles.primaryModule]}
          onPress={() => {
            if (onNavigate) {
              onNavigate('Booking');
            } else {
              navigation?.navigate('Booking');
            }
          }}
        >
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleIcon}>🚚</Text>
            <Text style={styles.moduleTitle}>RELOConnect</Text>
          </View>
          <Text style={styles.moduleDesc}>Main relocation booking system with smart vehicle matching and real-time tracking</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• GPS tracking & mapping</Text>
            <Text style={styles.feature}>• Multiple vehicle types</Text>
            <Text style={styles.feature}>• AI-powered pricing</Text>
            <Text style={styles.feature}>• Full N2 coverage (0-2255km)</Text>
          </View>
        </TouchableOpacity>

        {/* RELOCare */}
        <TouchableOpacity 
          style={[styles.moduleCard, styles.careModule]}
          onPress={() => {
            if (onNavigate) {
              onNavigate('RELOCare');
            } else {
              navigation?.navigate('RELOCare');
            }
          }}
        >
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleIcon}>❤️</Text>
            <Text style={styles.moduleTitle}>RELOCare</Text>
          </View>
          <Text style={styles.moduleDesc}>Community donations and item sharing platform for sustainable relocations</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Donate unused items</Text>
            <Text style={styles.feature}>• Community marketplace</Text>
            <Text style={styles.feature}>• Eco-friendly moving</Text>
          </View>
        </TouchableOpacity>

        {/* RELONews */}
        <TouchableOpacity 
          style={[styles.moduleCard, styles.newsModule]}
          onPress={() => {
            if (onNavigate) {
              onNavigate('RELONews');
            } else {
              navigation?.navigate('RELONews');
            }
          }}
        >
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleIcon}>📰</Text>
            <Text style={styles.moduleTitle}>RELONews</Text>
          </View>
          <Text style={styles.moduleDesc}>Industry news and insights for South African logistics sector</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Transport industry updates</Text>
            <Text style={styles.feature}>• Regulatory changes</Text>
            <Text style={styles.feature}>• Market insights</Text>
          </View>
        </TouchableOpacity>

        {/* RELOPorts */}
        <TouchableOpacity 
          style={[styles.moduleCard, styles.portsModule]}
          onPress={() => {
            if (onNavigate) {
              onNavigate('RELOPorts');
            } else {
              navigation?.navigate('RELOPorts');
            }
          }}
        >
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleIcon}>⚓</Text>
            <Text style={styles.moduleTitle}>RELOPorts</Text>
          </View>
          <Text style={styles.moduleDesc}>Port data and shipping schedules for import/export logistics</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Vessel schedules</Text>
            <Text style={styles.feature}>• Port congestion data</Text>
            <Text style={styles.feature}>• Cross-border shipping</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation?.navigate('Booking')}
        >
          <Text style={styles.primaryButtonText}>Start Your Move</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation?.navigate('DriverSignup')}
        >
          <Text style={styles.secondaryButtonText}>Become a Driver</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇿🇦 Made for South Africa</Text>
        <Text style={styles.footerSubtext}>Complete pricing matrix • 0-2255km coverage • AI-powered</Text>
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
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#0057FF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modulesContainer: {
    padding: 20,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
  },
  primaryModule: {
    borderLeftColor: '#0057FF',
  },
  careModule: {
    borderLeftColor: '#ef4444',
  },
  newsModule: {
    borderLeftColor: '#f59e0b',
  },
  portsModule: {
    borderLeftColor: '#06b6d4',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  moduleDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    marginTop: 8,
  },
  feature: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  primaryButton: {
    backgroundColor: '#0057FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#0057FF',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0057FF',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
