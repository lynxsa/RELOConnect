import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { 
  ModernHeader, 
  ModernQuickActions, 
  ModernStatusCard,
  ModernCard
} from '../components/ui';
import { authApi, bookingApi } from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Booking {
  id: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  fromAddress: string;
  toAddress: string;
  price: number;
}

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    setLoading(true);
    await Promise.all([
      getLocation(),
      loadUserProfile(),
      loadRecentBookings(),
    ]);
    setLoading(false);
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to find nearby services');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Use mock data for now until backend API is fully connected
      setUser({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadRecentBookings = async () => {
    try {
      // Try to get user bookings, fallback to mock data
      // For now, use mock data until we match the API interface
      setRecentBookings([
        {
          id: '1',
          type: 'Home Move',
          status: 'in-progress',
          scheduledDate: '2025-01-15',
          fromAddress: '123 Main St, City A',
          toAddress: '456 Oak Ave, City B',
          price: 1200,
        },
        {
          id: '2',
          type: 'Office Move',
          status: 'completed',
          scheduledDate: '2025-01-10',
          fromAddress: '789 Business Blvd',
          toAddress: '321 Corporate Dr',
          price: 2500,
        },
      ]);
    } catch (error) {
      console.error('Error loading recent bookings:', error);
      // Fallback to mock data for development
      setRecentBookings([
        {
          id: '1',
          type: 'Home Move',
          status: 'in-progress',
          scheduledDate: '2025-01-15',
          fromAddress: '123 Main St, City A',
          toAddress: '456 Oak Ave, City B',
          price: 1200,
        },
        {
          id: '2',
          type: 'Office Move',
          status: 'completed',
          scheduledDate: '2025-01-10',
          fromAddress: '789 Business Blvd',
          toAddress: '321 Corporate Dr',
          price: 2500,
        },
      ]);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    initializeScreen().finally(() => setRefreshing(false));
  }, []);

  const quickActions = [
    {
      id: 'home-move',
      title: 'Home Move',
      icon: 'home' as keyof typeof Feather.glyphMap,
      color: '#0057FF',
      onPress: () => Alert.alert('Home Move', 'Navigate to home move booking'),
    },
    {
      id: 'office-move',
      title: 'Office Move',
      icon: 'briefcase' as keyof typeof Feather.glyphMap,
      color: '#00B2FF',
      onPress: () => Alert.alert('Office Move', 'Navigate to office move booking'),
    },
    {
      id: 'storage',
      title: 'Storage',
      icon: 'archive' as keyof typeof Feather.glyphMap,
      color: '#FF6B35',
      onPress: () => Alert.alert('Storage', 'Navigate to storage booking'),
    },
    {
      id: 'international',
      title: 'International',
      icon: 'globe' as keyof typeof Feather.glyphMap,
      color: '#27AE60',
      onPress: () => Alert.alert('International', 'Navigate to international move'),
    },
  ];

  const emergencyContact = () => {
    Alert.alert(
      '24/7 Support',
      'Call our support team for immediate assistance',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => console.log('Calling support...') },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ModernCard title="Loading..." variant="elevated">
            <View style={{ height: 100 }} />
          </ModernCard>
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
        {/* Modern Header */}
        <ModernHeader
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
          subtitle={location ? '📍 Location detected' : '📍 Enable location for better service'}
          variant="gradient"
        />

        {/* Quick Actions */}
        <ModernQuickActions
          title="What do you need to move?"
          actions={quickActions}
          columns={2}
        />

        {/* Recent Bookings */}
        <View style={styles.section}>
          <ModernCard title="Recent Bookings" padding="medium">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <ModernStatusCard
                  key={booking.id}
                  title={booking.type}
                  status={booking.status}
                  description={`${booking.fromAddress} → ${booking.toAddress}`}
                  value={`$${booking.price}`}
                  onPress={() => Alert.alert('Booking Details', `View details for ${booking.type}`)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="package" size={48} color="#E0E0E0" />
                <Text style={styles.emptyText}>No recent bookings</Text>
                <Text style={styles.emptySubtext}>Start your first move today!</Text>
              </View>
            )}
          </ModernCard>
        </View>

        {/* Emergency Support */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.emergencyButton} onPress={emergencyContact}>
            <LinearGradient
              colors={['#FF4757', '#FF3742']}
              style={styles.emergencyGradient}
            >
              <Feather name="phone" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyText}>24/7 Emergency Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
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
    padding: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomeScreen;
