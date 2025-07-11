import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface RELOPortsScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export default function RELOPortsScreen({ navigation, onBack }: RELOPortsScreenProps) {
  const portData = [
    {
      id: 1,
      name: "Port of Durban",
      status: "Operational",
      congestion: "Moderate",
      vessels: 23,
      nextArrival: "MV Atlantic Star - 14:30",
      avgDelay: "2.5 hours"
    },
    {
      id: 2,
      name: "Port of Cape Town",
      status: "Operational",
      congestion: "Low",
      vessels: 18,
      nextArrival: "MSC Isabella - 16:00",
      avgDelay: "1.2 hours"
    },
    {
      id: 3,
      name: "Port Elizabeth",
      status: "Operational",
      congestion: "High",
      vessels: 31,
      nextArrival: "Ever Grace - 11:45",
      avgDelay: "4.1 hours"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return '#10b981';
      case 'delayed': return '#f59e0b';
      case 'closed': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion.toLowerCase()) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

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
          <Text style={styles.title}>⚓ RELOPorts</Text>
          <Text style={styles.subtitle}>Port data and shipping schedules</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>72</Text>
          <Text style={styles.statLabel}>Active Vessels</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Major Ports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2.6h</Text>
          <Text style={styles.statLabel}>Avg Delay</Text>
        </View>
      </View>

      {/* Port Status Cards */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Port Status</Text>
        {portData.map((port) => (
          <View key={port.id} style={styles.portCard}>
            <View style={styles.portHeader}>
              <Text style={styles.portName}>{port.name}</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(port.status) }]} />
                <Text style={styles.statusText}>{port.status}</Text>
              </View>
            </View>
            
            <View style={styles.portDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Congestion Level:</Text>
                <Text style={[styles.detailValue, { color: getCongestionColor(port.congestion) }]}>
                  {port.congestion}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vessels in Port:</Text>
                <Text style={styles.detailValue}>{port.vessels}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Arrival:</Text>
                <Text style={styles.detailValue}>{port.nextArrival}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Average Delay:</Text>
                <Text style={styles.detailValue}>{port.avgDelay}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Schedule →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Services */}
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Port Services</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🚢</Text>
            <Text style={styles.serviceTitle}>Vessel Tracking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>📅</Text>
            <Text style={styles.serviceTitle}>Schedules</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>📊</Text>
            <Text style={styles.serviceTitle}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🚛</Text>
            <Text style={styles.serviceTitle}>Cargo Info</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>🚧 Coming Soon</Text>
        <Text style={styles.comingSoonDesc}>Real-time port data integration with Transnet API</Text>
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
    backgroundColor: '#06b6d4',
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
    color: '#a7f3d0',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  portCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  portHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  portDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#06b6d4',
    fontWeight: '600',
  },
  servicesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  comingSoon: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#06b6d4',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
