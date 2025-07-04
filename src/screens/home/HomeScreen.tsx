import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
// import { GoogleMaps } from 'expo-maps'; // Requires development build
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Input, Card } from '../../components/ui';
import { Vehicle } from '../../types';

const { width, height } = Dimensions.get('window');

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    type: 'van',
    capacity: 3.5,
    maxWeight: 1500,
    name: 'Small Van',
    description: 'Perfect for small moves',
    basePrice: 80,
    pricePerKm: 2.5,
    icon: '🚐',
  },
  {
    id: '2',
    type: 'truck',
    capacity: 15,
    maxWeight: 5000,
    name: 'Medium Truck',
    description: 'Ideal for house moves',
    basePrice: 150,
    pricePerKm: 4,
    icon: '🚚',
  },
  {
    id: '3',
    type: 'pickup',
    capacity: 2,
    maxWeight: 1000,
    name: 'Pickup Truck',
    description: 'Quick local deliveries',
    basePrice: 60,
    pricePerKm: 2,
    icon: '🛻',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    pickupLocation,
    dropoffLocation,
    selectedVehicle,
    estimatedPrice,
    setPickupLocation,
    setDropoffLocation,
    setSelectedVehicle,
    setEstimatedPrice,
  } = useBookingStore();

  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [showVehicles, setShowVehicles] = useState(false);
  // const mapRef = useRef<MapView>(null); // Temporarily disabled

  const initialRegion = {
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleAddressSearch = (address: string, type: 'pickup' | 'dropoff') => {
    // Mock geocoding - in real app, use Google Places API
    const mockLocation = {
      latitude: initialRegion.latitude + (Math.random() - 0.5) * 0.1,
      longitude: initialRegion.longitude + (Math.random() - 0.5) * 0.1,
      address,
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2000',
      country: 'South Africa',
    };

    if (type === 'pickup') {
      setPickupLocation(mockLocation);
    } else {
      setDropoffLocation(mockLocation);
    }

    setShowVehicles(true);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    // Calculate estimated price based on distance
    const estimatedDistance = 15; // Mock distance in km
    const price = vehicle.basePrice + (vehicle.pricePerKm * estimatedDistance);
    setEstimatedPrice(price);
  };

  const handleBookNow = () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicle) {
      Alert.alert('Incomplete Booking', 'Please select pickup, dropoff locations and a vehicle.');
      return;
    }

    navigation.navigate('ServiceExtras' as never);
  };

  const renderVehicleCard = (vehicle: Vehicle) => (
    <TouchableOpacity
      key={vehicle.id}
      style={[
        styles.vehicleCard,
        {
          backgroundColor: selectedVehicle?.id === vehicle.id ? colors.primary : colors.surface,
          borderColor: selectedVehicle?.id === vehicle.id ? colors.primary : colors.border,
        },
      ]}
      onPress={() => handleVehicleSelect(vehicle)}
    >
      <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
      <Text
        style={[
          styles.vehicleName,
          {
            color: selectedVehicle?.id === vehicle.id ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {vehicle.name}
      </Text>
      <Text
        style={[
          styles.vehiclePrice,
          {
            color: selectedVehicle?.id === vehicle.id ? '#FFFFFF' : colors.textSecondary,
          },
        ]}
      >
        From R{vehicle.basePrice}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Section - Temporarily using placeholder until development build */}
      <View style={[styles.map, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="map-outline" size={48} color="#666" />
        <Text style={{ color: '#666', marginTop: 8, fontSize: 16 }}>Map Preview</Text>
        <Text style={{ color: '#999', marginTop: 4, fontSize: 12 }}>Requires development build for expo-maps</Text>
      </View>

      {/* Bottom Sheet */}
      <ScrollView style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handle} />
        
        <TouchableOpacity 
          style={styles.calculatorButton} 
          onPress={() => navigation.navigate('PriceCalculator' as never)}
        >
          <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
          <Text style={styles.calculatorButtonText}>Price Calculator</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Where do you want to move?
        </Text>

        <Input
          placeholder="Pickup location"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          leftIcon={
            <Ionicons name="location" size={20} color="green" />
          }
          onRightIconPress={() => handleAddressSearch(pickupAddress, 'pickup')}
          rightIcon={
            <Ionicons name="search" size={20} color={colors.primary} />
          }
          style={styles.input}
        />

        <Input
          placeholder="Dropoff location"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
          leftIcon={
            <Ionicons name="location" size={20} color="red" />
          }
          onRightIconPress={() => handleAddressSearch(dropoffAddress, 'dropoff')}
          rightIcon={
            <Ionicons name="search" size={20} color={colors.primary} />
          }
          style={styles.input}
        />

        {showVehicles && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Choose your vehicle
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.vehicleList}>
                {mockVehicles.map(renderVehicleCard)}
              </View>
            </ScrollView>
          </>
        )}

        {selectedVehicle && estimatedPrice > 0 && (
          <Card style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>
                Estimated Total
              </Text>
              <Text style={[styles.priceAmount, { color: colors.primary }]}>
                R{estimatedPrice}
              </Text>
            </View>
            
            <Button
              title="Book Now"
              onPress={handleBookNow}
              style={styles.bookButton}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.5,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
  input: {
    marginBottom: 12,
  },
  vehicleList: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  vehicleCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontSize: 12,
    textAlign: 'center',
  },
  priceCard: {
    marginVertical: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookButton: {
    height: 50,
  },
  calculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0057FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  calculatorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
