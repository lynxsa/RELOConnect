import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/ui';

const mockPorts = [
  {
    id: '1',
    name: 'Port of Durban',
    code: 'DUR',
    country: 'South Africa',
    vessels: 15,
    arrivals: 8,
    departures: 7,
  },
  {
    id: '2',
    name: 'Port of Cape Town',
    code: 'CPT',
    country: 'South Africa',
    vessels: 12,
    arrivals: 6,
    departures: 6,
  },
];

const mockSchedule = [
  {
    id: '1',
    vessel: 'MSC Loreto',
    eta: '14:30',
    etd: '18:00',
    status: 'On Time',
    cargo: 'Containers',
  },
  {
    id: '2',
    vessel: 'CMA CGM Marseille',
    eta: '09:15',
    etd: '22:30',
    status: 'Delayed',
    cargo: 'General Cargo',
  },
];

export default function RELOPortsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>RELOPorts</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Real-time port data and schedules
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Major Ports</Text>
        
        {mockPorts.map((port) => (
          <Card key={port.id} style={styles.portCard}>
            <View style={styles.portHeader}>
              <View>
                <Text style={[styles.portName, { color: colors.text }]}>{port.name}</Text>
                <Text style={[styles.portCode, { color: colors.textSecondary }]}>
                  {port.code} • {port.country}
                </Text>
              </View>
              <Text style={styles.portIcon}>⚓</Text>
            </View>
            
            <View style={styles.portStats}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{port.vessels}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vessels</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>{port.arrivals}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Arrivals</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{port.departures}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Departures</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
        
        <View style={[styles.scheduleHeader, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Vessel</Text>
          <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>ETA</Text>
          <Text style={[styles.scheduleHeaderText, { color: colors.text }]}>Status</Text>
        </View>

        {mockSchedule.map((item) => (
          <View key={item.id} style={[styles.scheduleRow, { borderBottomColor: colors.border }]}>
            <View style={styles.scheduleCell}>
              <Text style={[styles.vesselName, { color: colors.text }]}>{item.vessel}</Text>
              <Text style={[styles.cargoType, { color: colors.textSecondary }]}>{item.cargo}</Text>
            </View>
            <Text style={[styles.scheduleTime, { color: colors.text }]}>{item.eta}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'On Time' ? '#DCFCE7' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'On Time' ? '#059669' : '#D97706' }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
  portCard: {
    marginBottom: 16,
  },
  portHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portName: {
    fontSize: 16,
    fontWeight: '600',
  },
  portCode: {
    fontSize: 14,
    marginTop: 2,
  },
  portIcon: {
    fontSize: 32,
  },
  portStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  scheduleCell: {
    flex: 1,
  },
  vesselName: {
    fontSize: 14,
    fontWeight: '500',
  },
  cargoType: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
