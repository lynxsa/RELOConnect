import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { liveDataService } from '../services/liveDataService';

interface FleetOwner {
  id: string;
  companyName: string;
  companyRegistration: string;
  licenseNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  totalTrucks: number;
  rating: number;
  isVerified: boolean;
  trustScore?: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  trucks: Array<{
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    truckType: string;
    capacity: number;
    length: number;
    width: number;
    height: number;
    isAvailable: boolean;
    status: string;
    assignments: Array<{
      driverProfile: {
        licenseNumber: string;
        licenseClass: string;
        experienceYears: number;
        rating: number;
        isAvailable: boolean;
        user: {
          firstName: string;
          lastName: string;
          phone: string;
        };
      };
    }>;
  }>;
}

const FleetDirectoryScreen: React.FC = () => {
  const [fleetOwners, setFleetOwners] = useState<FleetOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFleetOwners = async () => {
    try {
      const response = await liveDataService.get('/fleet');
      if (response.success) {
        setFleetOwners(response.data);
      }
    } catch (error) {
      console.error('Error fetching fleet owners:', error);
      Alert.alert('Error', 'Failed to load fleet directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFleetOwners();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFleetOwners();
  };

  const getVerificationBadge = (isVerified: boolean, rating: number) => {
    if (isVerified && rating >= 4.5) {
      return { icon: 'shield-check', color: '#10B981', text: 'Premium Verified' };
    } else if (isVerified) {
      return { icon: 'check-circle', color: '#3B82F6', text: 'Verified' };
    }
    return { icon: 'clock', color: '#F59E0B', text: 'Pending' };
  };

  const getTruckTypeIcon = (truckType: string) => {
    switch (truckType) {
      case 'HEAVY_DUTY':
        return 'truck';
      case 'MEDIUM_DUTY':
        return 'truck';
      case 'LIGHT_DUTY':
        return 'truck';
      case 'REFRIGERATED':
        return 'thermometer';
      case 'FURNITURE_VAN':
        return 'home';
      default:
        return 'truck';
    }
  };

  const renderFleetCard = (fleet: FleetOwner) => {
    const badge = getVerificationBadge(fleet.isVerified, fleet.rating);
    const activeTrucks = fleet.trucks.filter(truck => truck.isAvailable);

    return (
      <TouchableOpacity
        key={fleet.id}
        style={styles.fleetCard}
        onPress={() => {
          // Navigate to fleet details
          Alert.alert('Fleet Details', `View details for ${fleet.companyName}`);
        }}
      >
        <View style={styles.fleetHeader}>
          <View style={styles.fleetInfo}>
            <Text style={styles.businessName}>{fleet.companyName}</Text>
            <Text style={styles.ownerName}>
              {fleet.user.firstName} {fleet.user.lastName}
            </Text>
          </View>
          
          <View style={styles.verificationBadge}>
            <Feather name={badge.icon as any} size={16} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fleet.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeTrucks.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {fleet.trucks.reduce((acc, truck) => 
                acc + truck.assignments.filter(a => a.driverProfile).length, 0
              )}
            </Text>
            <Text style={styles.statLabel}>Drivers</Text>
          </View>
        </View>

        {activeTrucks.length > 0 && (
          <View style={styles.trucksPreview}>
            <Text style={styles.trucksTitle}>Available Trucks</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeTrucks.slice(0, 3).map(truck => (
                <View key={truck.id} style={styles.truckChip}>
                  <Feather 
                    name={getTruckTypeIcon(truck.truckType) as any} 
                    size={14} 
                    color="#6B7280" 
                  />
                  <Text style={styles.truckText}>
                    {truck.make} {truck.model} • {truck.registrationNumber}
                  </Text>
                </View>
              ))}
              {activeTrucks.length > 3 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreText}>+{activeTrucks.length - 3} more</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading fleet directory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verified Fleet Partners</Text>
        <Text style={styles.subtitle}>
          Choose from our network of trusted logistics providers
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {fleetOwners.map(renderFleetCard)}
        
        {fleetOwners.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="truck" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No fleet partners available</Text>
            <Text style={styles.emptyText}>
              Check back later for verified fleet partners in your area
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  fleetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fleetInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0057FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  trucksPreview: {
    marginTop: 16,
  },
  trucksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  truckChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  truckText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  moreChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moreText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FleetDirectoryScreen;
