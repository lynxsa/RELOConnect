import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { 
  ModernHeader, 
  ModernButton,
  ModernCard,
  ModernStatusCard,
} from '../components/ui';
import { bookingApi } from '../services/api';

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  location?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
}

interface Booking {
  id: string;
  type: string;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  fromAddress: string;
  toAddress: string;
  scheduledDate: string;
  estimatedArrival?: string;
  driver?: Driver;
  trackingEvents: TrackingEvent[];
}

const ModernTrackingScreen: React.FC = () => {
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActiveBooking();
    // Set up real-time updates
    const interval = setInterval(loadActiveBooking, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadActiveBooking = async () => {
    try {
      // Mock data for now - replace with real API call
      const mockBooking: Booking = {
        id: 'BK-2025-001',
        type: 'Home Move',
        status: 'in-transit',
        fromAddress: '123 Main St, City A, State 12345',
        toAddress: '456 Oak Ave, City B, State 67890',
        scheduledDate: '2025-01-15',
        estimatedArrival: '14:30',
        driver: {
          id: 'DR-001',
          name: 'Mike Johnson',
          phone: '+1-555-0123',
          vehicle: '2022 Ford Transit Van',
          plateNumber: 'ABC-1234',
          rating: 4.8,
        },
        trackingEvents: [
          {
            id: '1',
            timestamp: '2025-01-15T08:00:00Z',
            status: 'confirmed',
            description: 'Booking confirmed and assigned to driver',
            location: 'RELOConnect Hub',
          },
          {
            id: '2',
            timestamp: '2025-01-15T09:30:00Z',
            status: 'pickup-started',
            description: 'Driver en route to pickup location',
            location: 'Main St, City A',
          },
          {
            id: '3',
            timestamp: '2025-01-15T10:15:00Z',
            status: 'items-loaded',
            description: 'All items loaded and secured',
            location: '123 Main St, City A',
          },
          {
            id: '4',
            timestamp: '2025-01-15T10:45:00Z',
            status: 'in-transit',
            description: 'On route to destination',
            location: 'Highway 101, en route',
          },
        ],
      };
      
      setActiveBooking(mockBooking);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActiveBooking();
  };

  const callDriver = () => {
    if (activeBooking?.driver?.phone) {
      Linking.openURL(`tel:${activeBooking.driver.phone}`);
    }
  };

  const messageDriver = () => {
    Alert.alert('Message Driver', 'Chat feature coming soon!');
  };

  const mapStatusForCard = (status: string): 'pending' | 'in-progress' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'confirmed':
      case 'in-transit':
        return 'in-progress';
      case 'delivered':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'in-transit':
        return '#34C759';
      case 'delivered':
        return '#30D158';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'check-circle';
      case 'pickup-started':
        return 'truck';
      case 'items-loaded':
        return 'package';
      case 'in-transit':
        return 'navigation';
      case 'delivered':
        return 'check-circle-2';
      default:
        return 'clock';
    }
  };

  const renderTrackingTimeline = () => (
    <ModernCard title="Tracking Timeline" padding="medium">
      {activeBooking?.trackingEvents.map((event, index) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[
              styles.timelineIcon,
              { backgroundColor: getStatusColor(event.status) }
            ]}>
              <Feather 
                name={getStatusIcon(event.status)} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            {index < (activeBooking?.trackingEvents.length || 0) - 1 && (
              <View style={styles.timelineLine} />
            )}
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.timelineTitle}>{event.description}</Text>
            <Text style={styles.timelineLocation}>{event.location}</Text>
            <Text style={styles.timelineTime}>
              {new Date(event.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      ))}
    </ModernCard>
  );

  const renderDriverInfo = () => {
    if (!activeBooking?.driver) return null;

    const { driver } = activeBooking;
    
    return (
      <ModernCard title="Your Driver" padding="medium">
        <View style={styles.driverContainer}>
          <View style={styles.driverAvatar}>
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverVehicle}>{driver.vehicle}</Text>
            <Text style={styles.driverPlate}>Plate: {driver.plateNumber}</Text>
            <View style={styles.driverRating}>
              <Feather name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{driver.rating}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.driverActions}>
          <ModernButton
            title="Call Driver"
            icon="phone"
            variant="primary"
            onPress={callDriver}
          />
          <ModernButton
            title="Message"
            icon="message-circle"
            variant="outline"
            onPress={messageDriver}
          />
        </View>
      </ModernCard>
    );
  };

  const renderEstimatedArrival = () => (
    <ModernCard variant="gradient" padding="medium">
      <View style={styles.arrivalContainer}>
        <Text style={styles.arrivalLabel}>Estimated Arrival</Text>
        <Text style={styles.arrivalTime}>
          {activeBooking?.estimatedArrival || 'Calculating...'}
        </Text>
        <Text style={styles.arrivalSubtext}>
          We'll notify you when your items are nearby
        </Text>
      </View>
    </ModernCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ModernHeader title="Order Tracking" variant="gradient" />
        <View style={styles.loadingContainer}>
          <Text>Loading tracking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <ModernHeader title="Order Tracking" variant="gradient" />
        <View style={styles.emptyContainer}>
          <Feather name="package" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Active Bookings</Text>
          <Text style={styles.emptySubtext}>
            You don't have any active moves to track right now
          </Text>
          <ModernButton
            title="Book a Move"
            onPress={() => {/* Navigate to booking */}}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader 
        title="Order Tracking"
        subtitle={`Booking #${activeBooking.id}`}
        variant="gradient"
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status */}
        <View style={styles.section}>
          <ModernStatusCard
            title={activeBooking.type}
            status={mapStatusForCard(activeBooking.status)}
            description={`${activeBooking.fromAddress} → ${activeBooking.toAddress}`}
            iconName="truck"
          />
        </View>

        {/* Estimated Arrival */}
        <View style={styles.section}>
          {renderEstimatedArrival()}
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          {renderDriverInfo()}
        </View>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          {renderTrackingTimeline()}
        </View>

        {/* Emergency Actions */}
        <View style={styles.section}>
          <ModernCard padding="medium">
            <Text style={styles.emergencyTitle}>Need Help?</Text>
            <Text style={styles.emergencySubtext}>
              Contact our 24/7 support team for assistance
            </Text>
            <ModernButton
              title="Emergency Support"
              variant="danger"
              icon="phone"
              onPress={() => Linking.openURL('tel:+1-800-RELO-911')}
              fullWidth
            />
          </ModernCard>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  arrivalContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  arrivalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  arrivalTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  arrivalSubtext: {
    fontSize: 14,
    color: '#E0F2FF',
    textAlign: 'center',
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  driverPlate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  timelineRight: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999999',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ModernTrackingScreen;
