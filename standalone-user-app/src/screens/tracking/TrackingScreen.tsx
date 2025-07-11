import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type TrackingScreenProps = NativeStackScreenProps<any, 'Tracking'>;

interface TrackingEvent {
  id: string;
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  plateNumber: string;
  photo?: string;
}

interface BookingDetails {
  id: string;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  timeSlot: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  driver?: Driver;
  totalCost: number;
  estimatedArrival?: string;
  events: TrackingEvent[];
}

// Mock data - in real app this would come from API
const MOCK_BOOKING: BookingDetails = {
  id: 'BK001',
  fromAddress: '123 Oak Street, San Francisco, CA 94102',
  toAddress: '456 Pine Avenue, San Jose, CA 95110',
  moveDate: '2024-01-15',
  timeSlot: '10:00 AM - 12:00 PM',
  status: 'in_progress',
  totalCost: 350,
  estimatedArrival: '11:30 AM',
  driver: {
    id: 'DR001',
    name: 'John Martinez',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    vehicle: 'Medium Truck',
    plateNumber: 'ABC-1234',
  },
  events: [
    {
      id: '1',
      status: 'confirmed',
      message: 'Booking confirmed',
      timestamp: '2024-01-14 09:30 AM',
    },
    {
      id: '2',
      status: 'assigned',
      message: 'Driver assigned to your booking',
      timestamp: '2024-01-14 10:15 AM',
    },
    {
      id: '3',
      status: 'departed',
      message: 'Driver is on the way to pickup location',
      timestamp: '2024-01-15 09:45 AM',
      location: 'Warehouse - 789 Industrial Blvd',
    },
    {
      id: '4',
      status: 'arrived',
      message: 'Driver arrived at pickup location',
      timestamp: '2024-01-15 10:30 AM',
      location: '123 Oak Street, San Francisco, CA',
    },
  ],
};

export default function TrackingScreen({ navigation }: TrackingScreenProps) {
  const [booking, setBooking] = useState<BookingDetails>(MOCK_BOOKING);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // TODO: Implement real-time tracking updates
    // This could use WebSocket connection to get live updates
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest booking status from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const callDriver = () => {
    if (booking.driver?.phone) {
      Linking.openURL(`tel:${booking.driver.phone}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#0057FF';
      case 'in_progress': return '#FF8C00';
      case 'completed': return '#28A745';
      case 'cancelled': return '#DC3545';
      default: return '#6C757D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'in_progress': return 'truck';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'x-circle';
      default: return 'clock';
    }
  };

  const renderStatusBadge = () => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
      <Feather name={getStatusIcon(booking.status)} size={16} color="white" />
      <Text style={styles.statusText}>
        {booking.status.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );

  const renderDriverInfo = () => {
    if (!booking.driver) return null;

    return (
      <View style={styles.driverCard}>
        <View style={styles.driverHeader}>
          <Text style={styles.driverTitle}>Your Driver</Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{booking.driver.rating}</Text>
          </View>
        </View>

        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Feather name="user" size={24} color="#0057FF" />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{booking.driver.name}</Text>
            <Text style={styles.driverVehicle}>
              {booking.driver.vehicle} • {booking.driver.plateNumber}
            </Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={callDriver}>
            <Feather name="phone" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {booking.estimatedArrival && (
          <View style={styles.estimatedArrival}>
            <Feather name="clock" size={16} color="#0057FF" />
            <Text style={styles.arrivalText}>
              Estimated arrival: {booking.estimatedArrival}
            </Text>
          </View>
        )}

        {/* Live Tracking Button */}
        {booking.status === 'in_progress' && (
          <TouchableOpacity 
            style={styles.liveTrackingButton}
            onPress={() => navigation.navigate('RealTimeTracking', { 
              bookingId: booking.id,
              driverId: booking.driver?.id 
            })}
          >
            <Feather name="navigation" size={20} color="white" />
            <Text style={styles.liveTrackingText}>Live Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBookingDetails = () => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Booking Details</Text>
        <Text style={styles.bookingId}>#{booking.id}</Text>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Feather name="map-pin" size={16} color="#0057FF" />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>From</Text>
            <Text style={styles.addressText}>{booking.fromAddress}</Text>
          </View>
        </View>

        <View style={styles.addressConnector} />

        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Feather name="flag" size={16} color="#28A745" />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>To</Text>
            <Text style={styles.addressText}>{booking.toAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingMeta}>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={16} color="#666" />
          <Text style={styles.metaText}>{booking.moveDate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="clock" size={16} color="#666" />
          <Text style={styles.metaText}>{booking.timeSlot}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="dollar-sign" size={16} color="#666" />
          <Text style={styles.metaText}>${booking.totalCost}</Text>
        </View>
      </View>
    </View>
  );

  const renderTrackingTimeline = () => (
    <View style={styles.timelineCard}>
      <Text style={styles.cardTitle}>Tracking Timeline</Text>
      
      {booking.events.map((event, index) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[
              styles.timelineDot,
              index === 0 && styles.timelineDotActive
            ]} />
            {index < booking.events.length - 1 && (
              <View style={styles.timelineLine} />
            )}
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineMessage}>{event.message}</Text>
            <Text style={styles.timelineTimestamp}>{event.timestamp}</Text>
            {event.location && (
              <Text style={styles.timelineLocation}>{event.location}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Booking</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {renderStatusBadge()}
        </View>

        {/* Driver Information */}
        {renderDriverInfo()}

        {/* Booking Details */}
        {renderBookingDetails()}

        {/* Tracking Timeline */}
        {renderTrackingTimeline()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={20} color="#0057FF" />
            <Text style={styles.actionButtonText}>Chat Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="map" size={20} color="#0057FF" />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  driverCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  driverVehicle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedArrival: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
  },
  arrivalText: {
    fontSize: 14,
    color: '#0057FF',
    marginLeft: 8,
    fontWeight: '500',
  },
  liveTrackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0057FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  liveTrackingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bookingCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addressConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginLeft: 11,
    marginVertical: 8,
  },
  bookingMeta: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  timelineCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: 'white',
  },
  timelineDotActive: {
    backgroundColor: '#0057FF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  timelineLocation: {
    fontSize: 12,
    color: '#0057FF',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#0057FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0057FF',
    marginLeft: 8,
  },
});