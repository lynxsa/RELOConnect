import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Input, Card } from '../../components/ui';

// Mock data for testing
const mockVehicleTypes = [
  { id: '1', name: 'Small Truck', basePrice: 150, description: 'Up to 1 bedroom' },
  { id: '2', name: 'Medium Truck', basePrice: 250, description: '2-3 bedrooms' },
  { id: '3', name: 'Large Truck', basePrice: 350, description: '4+ bedrooms' },
];

const mockExtraServices = [
  { id: '1', name: 'Packing Service', price: 100 },
  { id: '2', name: 'Insurance', price: 50 },
  { id: '3', name: 'Storage (30 days)', price: 200 },
  { id: '4', name: 'Assembly/Disassembly', price: 75 },
];

export default function PriceCalculatorScreen() {
  const { colors } = useTheme();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    if (!selectedVehicle || !distance) return;

    const vehicle = mockVehicleTypes.find(v => v.id === selectedVehicle);
    if (!vehicle) return;

    const distanceNum = parseFloat(distance) || 0;
    const distancePrice = distanceNum * 2; // $2 per mile

    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = mockExtraServices.find(e => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);

    const total = vehicle.basePrice + distancePrice + extrasPrice;
    setTotalPrice(total);
  };

  useEffect(() => {
    calculatePrice();
  }, [selectedVehicle, distance, selectedExtras]);

  const handleCalculate = async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Error', 'Please enter both pickup and delivery locations');
      return;
    }

    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle type');
      return;
    }

    setLoading(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock distance calculation (in a real app, this would use Google Maps API)
      const mockDistance = Math.floor(Math.random() * 100) + 10;
      setDistance(mockDistance.toString());
      
      Alert.alert('Success', `Estimated distance: ${mockDistance} miles`);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate distance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradient.primary as [string, string]}
        style={styles.header}
      >
        <Text style={styles.title}>Price Calculator</Text>
        <Text style={styles.subtitle}>Get an instant moving quote</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Location Inputs */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Locations</Text>
          
          <Input
            label="Pickup Location"
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholder="Enter pickup address"
            leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
          />

          <Input
            label="Delivery Location"
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="Enter delivery address"
            leftIcon={<Ionicons name="flag-outline" size={20} color={colors.textSecondary} />}
          />

          <Button
            title="Calculate Distance"
            onPress={handleCalculate}
            loading={loading}
            style={styles.calculateButton}
          />

          {distance && (
            <View style={styles.distanceDisplay}>
              <Text style={[styles.distanceText, { color: colors.text }]}>
                Distance: {distance} miles
              </Text>
            </View>
          )}
        </Card>

        {/* Vehicle Selection */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
          
          {mockVehicleTypes.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleOption,
                { borderColor: colors.border },
                selectedVehicle === vehicle.id && { 
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '10'
                }
              ]}
              onPress={() => setSelectedVehicle(vehicle.id)}
            >
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleName, { color: colors.text }]}>
                  {vehicle.name}
                </Text>
                <Text style={[styles.vehicleDescription, { color: colors.textSecondary }]}>
                  {vehicle.description}
                </Text>
              </View>
              <Text style={[styles.vehiclePrice, { color: colors.primary }]}>
                ${vehicle.basePrice}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Extra Services */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Extra Services</Text>
          
          {mockExtraServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceOption,
                { borderColor: colors.border },
                selectedExtras.includes(service.id) && { 
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + '10'
                }
              ]}
              onPress={() => toggleExtra(service.id)}
            >
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>
                  {service.name}
                </Text>
              </View>
              <View style={styles.serviceRight}>
                <Text style={[styles.servicePrice, { color: colors.primary }]}>
                  +${service.price}
                </Text>
                <Ionicons 
                  name={selectedExtras.includes(service.id) ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={selectedExtras.includes(service.id) ? colors.primary : colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Price Summary */}
        {totalPrice > 0 && (
          <Card style={styles.section}>
            <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Breakdown</Text>
            
            {selectedVehicle && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  {mockVehicleTypes.find(v => v.id === selectedVehicle)?.name}
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  ${mockVehicleTypes.find(v => v.id === selectedVehicle)?.basePrice}
                </Text>
              </View>
            )}

            {distance && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  Distance ({distance} miles × $2)
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  ${(parseFloat(distance) * 2).toFixed(0)}
                </Text>
              </View>
            )}

            {selectedExtras.map(extraId => {
              const extra = mockExtraServices.find(e => e.id === extraId);
              return extra ? (
                <View key={extraId} style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                    {extra.name}
                  </Text>
                  <Text style={[styles.priceValue, { color: colors.text }]}>
                    ${extra.price}
                  </Text>
                </View>
              ) : null;
            })}

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total Estimate
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${totalPrice}
              </Text>
            </View>

            <Button
              title="Book This Move"
              onPress={() => Alert.alert('Success', 'Booking feature coming soon!')}
              style={styles.bookButton}
            />
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: -20,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  calculateButton: {
    marginTop: 16,
  },
  distanceDisplay: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  serviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookButton: {
    marginTop: 20,
  },
});
