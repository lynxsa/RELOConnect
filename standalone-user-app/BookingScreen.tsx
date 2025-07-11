import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { 
  calculateFare, 
  getRecommendedVehicleClasses, 
  VEHICLE_CLASSES,
  type AddOnServices,
  type FareCalculation,
  type VehicleClass
} from './services/pricingService';

interface BookingScreenProps {
  onBack?: () => void;
  navigation?: any;
}

export default function BookingScreen({ onBack, navigation }: BookingScreenProps) {
  const [pickupAddress, setPickupAddress] = useState('Cape Town CBD');
  const [dropoffAddress, setDropoffAddress] = useState('Johannesburg Sandton');
  const [distance, setDistance] = useState(1400); // km (CT to JHB)
  const [selectedVehicle, setSelectedVehicle] = useState('medium_truck_2t');
  const [loadDescription, setLoadDescription] = useState('3 bedroom house move');
  
  const [addOns, setAddOns] = useState<AddOnServices>({
    stairs: false,
    stairsCount: 1,
    helpers: true,
    helpersCount: 2,
    packing: false,
    cleaning: false,
    insurance: true,
    insuranceValue: 50000,
    express: false
  });

  const [fareCalculation, setFareCalculation] = useState<FareCalculation | null>(null);

  // Calculate fare when inputs change
  useEffect(() => {
    try {
      const fare = calculateFare(distance, selectedVehicle, addOns);
      setFareCalculation(fare);
    } catch (error) {
      console.error('Fare calculation error:', error);
      setFareCalculation(null);
    }
  }, [distance, selectedVehicle, addOns]);

  // Get recommended vehicles based on load description
  const recommendedVehicles = getRecommendedVehicleClasses(loadDescription, distance);

  const updateAddOn = (key: keyof AddOnServices, value: any) => {
    setAddOns((prev: AddOnServices) => ({ ...prev, [key]: value }));
  };

  const getVehicleIcon = (vehicleId: string): string => {
    const icons: Record<string, string> = {
      motorbike: '🏍️',
      bakkie: '🚐',
      small_truck: '🚚',
      medium_truck_2t: '🚛',
      medium_truck_4t: '🚛',
      large_truck_5t: '🚜',
      large_truck_8t: '🚜',
      heavy_truck_10t: '🚚',
      heavy_truck_14t: '🚚'
    };
    return icons[vehicleId] || '🚚';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {(onBack || navigation) && (
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
        )}
        <View style={styles.headerContent}>
          <Text style={styles.title}>RELOConnect Booking</Text>
          <Text style={styles.subtitle}>Smart. Safe. Seamless.</Text>
        </View>
      </View>

      {/* Route Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Move Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📍 Pickup Location</Text>
          <TextInput
            style={styles.input}
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder="Enter pickup address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎯 Drop-off Location</Text>
          <TextInput
            style={styles.input}
            value={dropoffAddress}
            onChangeText={setDropoffAddress}
            placeholder="Enter destination address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📏 Distance (km)</Text>
          <TextInput
            style={styles.input}
            value={distance.toString()}
            onChangeText={(text: string) => setDistance(Number(text) || 0)}
            placeholder="Distance in kilometers"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📦 What are you moving?</Text>
          <TextInput
            style={styles.input}
            value={loadDescription}
            onChangeText={setLoadDescription}
            placeholder="e.g., 2 bedroom apartment, office equipment"
            multiline
          />
        </View>
      </View>

      {/* Vehicle Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.vehicleContainer}>
            {recommendedVehicles.map((vehicle: VehicleClass) => (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle.id)}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.id && styles.selectedVehicleCard
                ]}
              >
                <Text style={styles.vehicleIcon}>
                  {getVehicleIcon(vehicle.id)}
                </Text>
                <Text style={[
                  styles.vehicleName,
                  selectedVehicle === vehicle.id && styles.selectedVehicleText
                ]}>
                  {vehicle.name}
                </Text>
                <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                {fareCalculation && (
                  <Text style={[
                    styles.vehiclePrice,
                    selectedVehicle === vehicle.id && styles.selectedVehicleText
                  ]}>
                    R{Math.round(fareCalculation.baseRate).toLocaleString()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Add-On Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Services</Text>
        
        {/* Helpers */}
        <View style={styles.addonRow}>
          <View style={styles.addonInfo}>
            <Text style={styles.addonTitle}>👥 Loading Helpers</Text>
            <Text style={styles.addonDesc}>R350 per person</Text>
          </View>
          <View style={styles.addonControls}>
            <TouchableOpacity
              style={[styles.toggleButton, addOns.helpers && styles.activeToggle]}
              onPress={() => updateAddOn('helpers', !addOns.helpers)}
            >
              <Text style={[styles.toggleText, addOns.helpers && styles.activeToggleText]}>
                {addOns.helpers ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
            {addOns.helpers && (
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateAddOn('helpersCount', Math.max(1, addOns.helpersCount - 1))}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{addOns.helpersCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateAddOn('helpersCount', Math.min(10, addOns.helpersCount + 1))}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Stairs */}
        <View style={styles.addonRow}>
          <View style={styles.addonInfo}>
            <Text style={styles.addonTitle}>🪜 Stairs</Text>
            <Text style={styles.addonDesc}>R150 per flight</Text>
          </View>
          <View style={styles.addonControls}>
            <TouchableOpacity
              style={[styles.toggleButton, addOns.stairs && styles.activeToggle]}
              onPress={() => updateAddOn('stairs', !addOns.stairs)}
            >
              <Text style={[styles.toggleText, addOns.stairs && styles.activeToggleText]}>
                {addOns.stairs ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
            {addOns.stairs && (
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateAddOn('stairsCount', Math.max(1, addOns.stairsCount - 1))}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{addOns.stairsCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateAddOn('stairsCount', Math.min(10, addOns.stairsCount + 1))}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Insurance */}
        <View style={styles.addonRow}>
          <View style={styles.addonInfo}>
            <Text style={styles.addonTitle}>🛡️ Insurance Coverage</Text>
            <Text style={styles.addonDesc}>1.5% of declared value</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, addOns.insurance && styles.activeToggle]}
            onPress={() => updateAddOn('insurance', !addOns.insurance)}
          >
            <Text style={[styles.toggleText, addOns.insurance && styles.activeToggleText]}>
              {addOns.insurance ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Express Service */}
        <View style={styles.addonRow}>
          <View style={styles.addonInfo}>
            <Text style={styles.addonTitle}>⚡ Express Delivery</Text>
            <Text style={styles.addonDesc}>R450 priority service</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, addOns.express && styles.activeToggle]}
            onPress={() => updateAddOn('express', !addOns.express)}
          >
            <Text style={[styles.toggleText, addOns.express && styles.activeToggleText]}>
              {addOns.express ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fare Breakdown */}
      {fareCalculation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <View style={styles.fareCard}>
            {fareCalculation.breakdown.map((item: any, index: number) => (
              <View key={index} style={styles.fareRow}>
                <Text style={[
                  styles.fareDescription,
                  item.type === 'commission' && styles.commissionText
                ]}>
                  {item.description}
                </Text>
                <Text style={[
                  styles.fareAmount,
                  item.type === 'commission' && styles.commissionText
                ]}>
                  {item.type === 'commission' ? '-' : ''}R{Math.round(item.amount).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.fareTotalRow}>
              <Text style={styles.fareTotalLabel}>Total</Text>
              <Text style={styles.fareTotalAmount}>
                R{Math.round(fareCalculation.total).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Driver Earnings Info */}
          <View style={styles.driverInfo}>
            <Text style={styles.driverInfoText}>
              💰 Driver receives: R{Math.round(fareCalculation.driverEarnings).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Book Now Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>
            {fareCalculation ? `Book for R${Math.round(fareCalculation.total).toLocaleString()}` : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* South African Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇿🇦 Made for South Africa</Text>
        <Text style={styles.footerSubtext}>Covering the full N2 route: 0-2255km</Text>
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
    backgroundColor: '#0057FF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0057FF',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  vehicleContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  vehicleCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedVehicleCard: {
    borderColor: '#0057FF',
    backgroundColor: '#eff6ff',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedVehicleText: {
    color: '#0057FF',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addonInfo: {
    flex: 1,
  },
  addonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addonDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  addonControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginLeft: 12,
  },
  activeToggle: {
    backgroundColor: '#0057FF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  fareCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fareDescription: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  fareAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  commissionText: {
    color: '#dc2626',
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  fareTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  fareTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  driverInfo: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  driverInfoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#0057FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0057FF',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});
