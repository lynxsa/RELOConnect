import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../types/navigation';

type Props = BottomTabScreenProps<RootTabParamList, 'Track'>;

interface TrackingInfo {
  orderId: string;
  status: 'confirmed' | 'packed' | 'in-transit' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  driver: {
    name: string;
    phone: string;
    rating: number;
  };
  timeline: {
    status: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

const TrackingScreen: React.FC = () => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orderId, setOrderId] = useState('RELO123456'); // Mock order ID

  useEffect(() => {
    loadTrackingInfo();
  }, []);

  const loadTrackingInfo = () => {
    // Mock tracking data - replace with actual API call
    setTimeout(() => {
      setTrackingInfo({
        orderId: 'RELO123456',
        status: 'in-transit',
        estimatedDelivery: '2025-07-06 14:00',
        currentLocation: 'N1 Highway, near Bloemfontein, Free State',
        driver: {
          name: 'Sipho Mthembu',
          phone: '+27 82 456 7890',
          rating: 4.9,
        },
        timeline: [
          {
            status: 'Order Confirmed',
            description: 'Your relocation order has been confirmed',
            timestamp: '2025-07-04 09:00',
            completed: true,
          },
          {
            status: 'Packing Started',
            description: 'Our professional team started packing your items',
            timestamp: '2025-07-05 08:00',
            completed: true,
          },
          {
            status: 'Items Loaded',
            description: 'All items securely loaded onto the truck',
            timestamp: '2025-07-05 10:30',
            completed: true,
          },
          {
            status: 'In Transit',
            description: 'Your items are on route to destination',
            timestamp: '2025-07-05 11:00',
            completed: true,
          },
          {
            status: 'Out for Delivery',
            description: 'Driver is approaching your destination',
            timestamp: '2025-07-06 12:00',
            completed: false,
          },
          {
            status: 'Delivered',
            description: 'Items delivered and unpacked successfully',
            timestamp: '2025-07-06 14:00',
            completed: false,
          },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrackingInfo();
  };

  const callDriver = () => {
    if (trackingInfo?.driver.phone) {
      Alert.alert(
        'Call Driver',
        `Call ${trackingInfo.driver.name} at ${trackingInfo.driver.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // TODO: Implement phone call functionality
            Alert.alert('Calling', `Calling ${trackingInfo.driver.name}...`);
          }},
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#F59E0B';
      case 'packed': return '#3B82F6';
      case 'in-transit': return '#8B5CF6';
      case 'delivered': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'packed': return 'cube';
      case 'in-transit': return 'car';
      case 'delivered': return 'home';
      default: return 'time';
    }
  };

  if (!trackingInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Track Your Move</Text>
          <Text style={styles.orderId}>Order #{trackingInfo.orderId}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: getStatusColor(trackingInfo.status) }]}>
                <Ionicons
                  name={getStatusIcon(trackingInfo.status) as any}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {trackingInfo.status.charAt(0).toUpperCase() + trackingInfo.status.slice(1).replace('-', ' ')}
                </Text>
                <Text style={styles.statusSubtitle}>
                  Est. Delivery: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()} at {new Date(trackingInfo.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#0057FF" />
              <Text style={styles.locationText}>Current Location: {trackingInfo.currentLocation}</Text>
            </View>
          </View>

          {/* Driver Info */}
          <View style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <Text style={styles.driverTitle}>Your Driver</Text>
              <TouchableOpacity onPress={callDriver} style={styles.callButton}>
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color="#0057FF" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{trackingInfo.driver.name}</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(trackingInfo.driver.rating) ? "star" : "star-outline"}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={styles.ratingText}>{trackingInfo.driver.rating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Move Progress</Text>
            {trackingInfo.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: item.completed ? '#10B981' : '#E5E7EB' }
                  ]}>
                    <Ionicons
                      name={item.completed ? "checkmark" : "ellipse-outline"}
                      size={12}
                      color={item.completed ? "#FFFFFF" : "#9CA3AF"}
                    />
                  </View>
                  {index < trackingInfo.timeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: item.completed ? '#10B981' : '#E5E7EB' }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineStatus,
                    { color: item.completed ? '#1A1A1A' : '#9CA3AF' }
                  ]}>
                    {item.status}
                  </Text>
                  <Text style={[
                    styles.timelineDescription,
                    { color: item.completed ? '#6B7280' : '#9CA3AF' }
                  ]}>
                    {item.description}
                  </Text>
                  <Text style={styles.timelineTimestamp}>
                    {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubbles" size={20} color="#0057FF" />
              <Text style={styles.actionButtonText}>Chat Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text" size={20} color="#0057FF" />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0057FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0057FF',
    marginLeft: 8,
  },
});

export default TrackingScreen;
