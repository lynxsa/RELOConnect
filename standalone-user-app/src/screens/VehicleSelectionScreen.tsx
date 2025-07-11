import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface VehicleType {
  id: string;
  name: string;
  description: string;
  capacity: string;
  icon: string;
  baseFare: number;
  perKmRate: number;
  features: string[];
  recommended?: boolean;
}

interface RouteParams {
  inventory?: any;
  totalVolume?: number;
  totalWeight?: number;
}

const VehicleSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [distance] = useState(10); // Mock distance in km

  const vehicles: VehicleType[] = [
    {
      id: 'mini',
      name: 'Mini Truck',
      description: 'Perfect for small moves',
      capacity: '1-2 BHK',
      icon: '🚐',
      baseFare: 500,
      perKmRate: 15,
      features: ['Up to 100 cu ft', 'City moves', 'Fast booking'],
    },
    {
      id: 'small',
      name: 'Small Truck',
      description: 'Great for apartment moves',
      capacity: '2-3 BHK',
      icon: '🚚',
      baseFare: 800,
      perKmRate: 20,
      features: ['Up to 300 cu ft', 'Furniture safe', '2 helpers included'],
      recommended: true,
    },
    {
      id: 'medium',
      name: 'Medium Truck',
      description: 'Ideal for house moves',
      capacity: '3-4 BHK',
      icon: '🚛',
      baseFare: 1200,
      perKmRate: 25,
      features: ['Up to 500 cu ft', 'Heavy items', '3 helpers included'],
    },
    {
      id: 'large',
      name: 'Large Truck',
      description: 'For big relocations',
      capacity: '4+ BHK',
      icon: '�',
      baseFare: 1800,
      perKmRate: 35,
      features: ['Up to 800 cu ft', 'Villa moves', '4 helpers included'],
    },
  ];

  useEffect(() => {
    if (params?.totalVolume) {
      const recommendedVehicle = getRecommendedVehicle(params.totalVolume);
      setSelectedVehicle(recommendedVehicle);
    }
  }, [params?.totalVolume]);

  useEffect(() => {
    if (selectedVehicle) {
      calculateFare(selectedVehicle);
    }
  }, [selectedVehicle]);

  const getRecommendedVehicle = (volume: number): string => {
    if (volume <= 100) return 'mini';
    if (volume <= 300) return 'small';
    if (volume <= 500) return 'medium';
    return 'large';
  };

  const calculateFare = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const fare = vehicle.baseFare + (vehicle.perKmRate * distance);
      setEstimatedFare(fare);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('No Vehicle Selected', 'Please select a vehicle to continue.');
      return;
    }

    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
    
    // Navigate to service extras screen
    (navigation as any).navigate('ServiceExtras', {
      vehicle: selectedVehicleData,
      estimatedFare,
      inventory: params?.inventory,
      totalVolume: params?.totalVolume,
      totalWeight: params?.totalWeight,
    });
  };

  const VehicleCard = ({ vehicle }: { vehicle: VehicleType }) => (
    <TouchableOpacity
      style={[
        styles.vehicleCard,
        selectedVehicle === vehicle.id && styles.selectedCard,
      ]}
      onPress={() => handleVehicleSelect(vehicle.id)}
      activeOpacity={0.7}
    >
      {vehicle.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}
      
      <View style={styles.vehicleHeader}>
        <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
        </View>
        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>From</Text>
          <Text style={styles.fareAmount}>₹{vehicle.baseFare}</Text>
        </View>
      </View>
      
      <View style={styles.capacityContainer}>
        <Feather name="home" size={16} color="#666" />
        <Text style={styles.capacityText}>{vehicle.capacity}</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        {vehicle.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Feather name="check" size={14} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const FareBreakdown = () => {
    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
    if (!selectedVehicleData) return null;

    return (
      <View style={styles.fareBreakdown}>
        <Text style={styles.fareBreakdownTitle}>Fare Breakdown</Text>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Base Fare</Text>
          <Text style={styles.fareValue}>₹{selectedVehicleData.baseFare}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Distance ({distance} km)</Text>
          <Text style={styles.fareValue}>₹{selectedVehicleData.perKmRate * distance}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Volume: {params?.totalVolume || 0} cu ft</Text>
          <Text style={styles.fareValue}>Included</Text>
        </View>
        <View style={[styles.fareRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalValue}>₹{estimatedFare}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Vehicle</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>Choose your vehicle</Text>
          <Text style={styles.pageDescription}>
            Select the vehicle that best fits your moving needs. Our recommendation is based on your inventory.
          </Text>

          {/* Vehicle Cards */}
          <View style={styles.vehiclesList}>
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </View>

          {/* Fare Breakdown */}
          {selectedVehicle && <FareBreakdown />}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedVehicle && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedVehicle}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!selectedVehicle ? ['#E0E0E0', '#E0E0E0'] : ['#0057FF', '#00B2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.continueButtonText, !selectedVehicle && styles.disabledButtonText]}>
              Continue with {selectedVehicle ? vehicles.find(v => v.id === selectedVehicle)?.name : 'Vehicle'}
            </Text>
            <Feather name="arrow-right" size={20} color={!selectedVehicle ? '#999' : 'white'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  vehiclesList: {
    gap: 16,
    marginBottom: 24,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#0057FF',
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#666',
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 12,
    color: '#666',
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0057FF',
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  fareBreakdown: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fareBreakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0057FF',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradientButton: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default VehicleSelectionScreen;
