import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Import our advanced pricing system
import { 
  advancedPricingEngine, 
  AdvancedPriceBreakdown,
  PricingParameters,
  AdvancedLocation,
  ExtraServiceRequest 
} from '../../services/advancedPricingEngine';
import { VEHICLE_CLASSES, EXTRA_SERVICES, PricingUtils } from '../../data/pricing';
import EnhancedGoogleMapsIntegration, { EnhancedMapLocation, RouteOptimization } from '../../components/maps/EnhancedGoogleMapsIntegration';

type BookingScreenProps = NativeStackScreenProps<any, 'Booking'>;

// Google Maps API key (in production, store this securely)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual key

// Truck sizes for selection
const TRUCK_SIZES = [
  { id: 'small', name: 'Small Truck', description: 'Up to 1 bedroom', capacity: '3 tons', price: 800 },
  { id: 'medium', name: 'Medium Truck', description: '1-2 bedrooms', capacity: '5 tons', price: 1200 },
  { id: 'large', name: 'Large Truck', description: '3+ bedrooms', capacity: '8 tons', price: 1600 },
  { id: 'extra_large', name: 'Extra Large Truck', description: 'Commercial/Office', capacity: '12 tons', price: 2200 }
];

interface MapLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
}

interface EnhancedPricing {
  baseFare: number;
  distanceCharge: number;
  timeMultiplier: number;
  demandSurcharge: number;
  weatherSurcharge: number;
  fuelSurcharge: number;
  extraServices: Array<{
    serviceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxes: number;
  total: number;
  priceBreakdown: Array<{
    category: string;
    description: string;
    amount: number;
    percentage?: number;
  }>;
  validUntil: Date;
  confidence: number;
}

export default function BookingScreen({ navigation }: BookingScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pickupLocation, setPickupLocation] = useState<MapLocation | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<MapLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [moveDate, setMoveDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [enhancedPricing, setEnhancedPricing] = useState<EnhancedPricing | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [priceConfidence, setPriceConfidence] = useState(0);
  
  // Additional state variables needed for the form
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');

  // Calculate enhanced pricing when locations and truck are selected
  useEffect(() => {
    if (pickupLocation && deliveryLocation && selectedTruck && routeInfo) {
      calculateEnhancedPricing();
    }
  }, [pickupLocation, deliveryLocation, selectedTruck, selectedServices, routeInfo]);

  const calculateEnhancedPricing = async () => {
    if (!pickupLocation || !deliveryLocation || !selectedTruck || !routeInfo) return;

    setIsCalculatingPrice(true);
    try {
      // Calculate base pricing using our enhanced algorithm
      const vehicleClass = VEHICLE_CLASSES.find(v => v.id === selectedTruck);
      if (!vehicleClass) return;

      // Get distance band
      const distance = routeInfo.distance;
      let baseFare = 0;

      // Calculate base fare based on distance and vehicle
      if (distance <= 5) baseFare = getBaseFareForVehicle(selectedTruck, '0-5');
      else if (distance <= 10) baseFare = getBaseFareForVehicle(selectedTruck, '5-10');
      else if (distance <= 15) baseFare = getBaseFareForVehicle(selectedTruck, '10-15');
      else if (distance <= 20) baseFare = getBaseFareForVehicle(selectedTruck, '15-20');
      else if (distance <= 25) baseFare = getBaseFareForVehicle(selectedTruck, '20-25');
      else if (distance <= 30) baseFare = getBaseFareForVehicle(selectedTruck, '25-30');
      else if (distance <= 40) baseFare = getBaseFareForVehicle(selectedTruck, '30-40');
      else if (distance <= 50) baseFare = getBaseFareForVehicle(selectedTruck, '40-50');
      else baseFare = getBaseFareForVehicle(selectedTruck, '50+');

      // Calculate dynamic factors
      const currentTime = new Date();
      const hour = currentTime.getHours();
      const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
      
      // Time multiplier (peak hours: 7-9 AM, 5-7 PM)
      let timeMultiplier = 1.0;
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        timeMultiplier = 1.15; // 15% peak hour surcharge
      }
      
      // Weekend surcharge
      if (isWeekend) {
        timeMultiplier *= 1.1; // Additional 10% for weekends
      }

      // Distance-based adjustments for longer routes
      let distanceMultiplier = 1.0;
      if (distance > 100) distanceMultiplier = 1.2;
      else if (distance > 50) distanceMultiplier = 1.1;

      // Traffic congestion factor (simplified - in production use Google Traffic API)
      const trafficMultiplier = routeInfo.duration > (distance * 2) ? 1.15 : 1.0;

      // Calculate surcharges
      const demandSurcharge = baseFare * (timeMultiplier - 1);
      const distanceCharge = baseFare * (distanceMultiplier - 1);
      const trafficSurcharge = baseFare * (trafficMultiplier - 1);

      // Calculate extra services
      const extraServiceCharges = selectedServices.map(serviceId => {
        const service = EXTRA_SERVICES.find(s => s.id === serviceId);
        if (!service) return { serviceId, name: 'Unknown', quantity: 1, unitPrice: 0, totalPrice: 0 };

        let totalPrice = 0;
        switch (service.priceType) {
          case 'flat':
            totalPrice = service.price;
            break;
          case 'per_unit':
            totalPrice = service.price; // Default to 1 unit
            break;
          case 'percentage':
            totalPrice = baseFare * (service.price / 100);
            break;
        }

        return {
          serviceId: service.id,
          name: service.name,
          quantity: 1,
          unitPrice: service.price,
          totalPrice: Math.round(totalPrice)
        };
      });

      const extraServicesTotal = extraServiceCharges.reduce((sum, charge) => sum + charge.totalPrice, 0);

      // Calculate totals
      const adjustedBaseFare = Math.round(baseFare * timeMultiplier * distanceMultiplier * trafficMultiplier);
      const subtotal = adjustedBaseFare + extraServicesTotal;
      const taxes = Math.round(subtotal * 0.15); // 15% VAT
      const total = subtotal + taxes;

      // Create price breakdown
      const priceBreakdown: Array<{
        category: string;
        description: string;
        amount: number;
        percentage?: number;
        isDiscount?: boolean;
      }> = [
        {
          category: 'Base Fare',
          description: `${vehicleClass.name} - ${Math.round(distance)}km`,
          amount: baseFare
        }
      ];

      if (demandSurcharge > 0) {
        priceBreakdown.push({
          category: 'Peak Time Surcharge',
          description: 'Peak hours and weekend pricing',
          amount: Math.round(demandSurcharge),
          percentage: Math.round((timeMultiplier - 1) * 100)
        });
      }

      if (distanceCharge > 0) {
        priceBreakdown.push({
          category: 'Distance Adjustment',
          description: 'Long-distance adjustment',
          amount: Math.round(distanceCharge),
          percentage: Math.round((distanceMultiplier - 1) * 100)
        });
      }

      if (trafficSurcharge > 0) {
        priceBreakdown.push({
          category: 'Traffic Surcharge',
          description: 'Heavy traffic conditions',
          amount: Math.round(trafficSurcharge),
          percentage: Math.round((trafficMultiplier - 1) * 100)
        });
      }

      extraServiceCharges.forEach(charge => {
        priceBreakdown.push({
          category: 'Extra Service',
          description: charge.name,
          amount: charge.totalPrice
        });
      });

      priceBreakdown.push({
        category: 'VAT',
        description: '15% Value Added Tax',
        amount: taxes,
        percentage: 15
      });

      // Calculate confidence based on data quality
      let confidence = 85;
      if (distance > 200) confidence -= 10; // Long distance less predictable
      if (selectedServices.length > 3) confidence -= 5; // Many services add complexity
      confidence = Math.max(confidence, 60);

      const validUntil = new Date();
      validUntil.setMinutes(validUntil.getMinutes() + 30);

      const enhancedPricing: EnhancedPricing = {
        baseFare,
        distanceCharge: Math.round(distanceCharge),
        timeMultiplier,
        demandSurcharge: Math.round(demandSurcharge),
        weatherSurcharge: 0,
        fuelSurcharge: 0,
        extraServices: extraServiceCharges,
        subtotal,
        taxes,
        total,
        priceBreakdown,
        validUntil,
        confidence
      };

      setEnhancedPricing(enhancedPricing);
      setPriceConfidence(confidence);

    } catch (error) {
      console.error('Error calculating enhanced pricing:', error);
      Alert.alert('Pricing Error', 'Unable to calculate accurate pricing. Please try again.');
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Helper function to get base fare for vehicle and distance
  const getBaseFareForVehicle = (vehicleId: string, distanceBand: string): number => {
    // Simplified pricing matrix - in production this would come from the database
    const pricingMatrix: { [key: string]: { [key: string]: number } } = {
      'mini-van': { '0-5': 650, '5-10': 700, '10-15': 750, '15-20': 800, '20-25': 850, '25-30': 900, '30-40': 1000, '40-50': 1100, '50+': 1200 },
      '1-ton-truck': { '0-5': 800, '5-10': 850, '10-15': 900, '15-20': 950, '20-25': 1000, '25-30': 1050, '30-40': 1200, '40-50': 1350, '50+': 1500 },
      '1.5-ton-truck': { '0-5': 950, '5-10': 1000, '10-15': 1100, '15-20': 1200, '20-25': 1300, '25-30': 1400, '30-40': 1600, '40-50': 1800, '50+': 2000 },
      '2-ton-truck': { '0-5': 1050, '5-10': 1100, '10-15': 1200, '15-20': 1350, '20-25': 1400, '25-30': 1500, '30-40': 1800, '40-50': 2050, '50+': 2250 },
      '4-ton-truck': { '0-5': 1300, '5-10': 1600, '10-15': 1900, '15-20': 2100, '20-25': 2400, '25-30': 2700, '30-40': 3200, '40-50': 3600, '50+': 4000 },
      '5-ton-truck': { '0-5': 1500, '5-10': 1800, '10-15': 2100, '15-20': 2300, '20-25': 2600, '25-30': 3000, '30-40': 3500, '40-50': 4000, '50+': 4400 },
      '8-ton-truck': { '0-5': 2500, '5-10': 3000, '10-15': 3500, '15-20': 4000, '20-25': 4500, '25-30': 5000, '30-40': 5500, '40-50': 6000, '50+': 6500 },
      '10-ton-truck': { '0-5': 3000, '5-10': 3600, '10-15': 4200, '15-20': 4800, '20-25': 5400, '25-30': 6000, '30-40': 6600, '40-50': 7200, '50+': 7800 }
    };

    return pricingMatrix[vehicleId]?.[distanceBand] || 0;
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = (): number => {
    if (enhancedPricing) {
      return enhancedPricing.total;
    }
    
    // Fallback calculation if enhanced pricing not available
    const basePrice = TRUCK_SIZES.find(truck => truck.id === selectedTruck)?.price || 0;
    const servicesPrice = selectedServices.length * 150; // R150 per extra service
    return basePrice + servicesPrice;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fromAddress || !toAddress) {
        Alert.alert('Error', 'Please enter both pickup and delivery addresses');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedTruck) {
        Alert.alert('Error', 'Please select a truck size');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!moveDate || !timeSlot) {
        Alert.alert('Error', 'Please select date and time');
        return;
      }
      setStep(4);
    } else {
      // Final booking
      handleBooking();
    }
  };

  const handleBooking = async () => {
    try {
      const bookingData = {
        fromAddress,
        toAddress,
        truckSize: selectedTruck,
        extraServices: selectedServices,
        moveDate,
        timeSlot,
        notes,
        totalCost: calculateTotal(),
      };

      console.log('Creating booking:', bookingData);
      
      // TODO: Implement actual booking API call
      Alert.alert(
        'Success',
        'Your booking has been confirmed! You will receive a confirmation email shortly.',
        [
          {
            text: 'View Booking',
            onPress: () => navigation.navigate('Tracking'),
          },
          {
            text: 'Go Home',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(stepNum => (
        <View key={stepNum} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step >= stepNum && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepText,
              step >= stepNum && styles.stepTextActive
            ]}>
              {stepNum}
            </Text>
          </View>
          {stepNum < 4 && (
            <View style={[
              styles.stepLine,
              step > stepNum && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Where are you moving?</Text>
      
      <View style={styles.inputContainer}>
        <Feather name="map-pin" size={20} color="#0057FF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Pickup address"
          value={fromAddress}
          onChangeText={setFromAddress}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="flag" size={20} color="#0057FF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Delivery address"
          value={toAddress}
          onChangeText={setToAddress}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.mapButton}>
        <Feather name="map" size={20} color="#0057FF" />
        <Text style={styles.mapButtonText}>Use Map to Select</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose your truck size</Text>
      
      {TRUCK_SIZES.map(truck => (
        <TouchableOpacity
          key={truck.id}
          style={[
            styles.truckOption,
            selectedTruck === truck.id && styles.truckOptionSelected
          ]}
          onPress={() => setSelectedTruck(truck.id)}
        >
          <View style={styles.truckInfo}>
            <Feather name="truck" size={24} color="#0057FF" />
            <View style={styles.truckDetails}>
              <Text style={styles.truckName}>{truck.name}</Text>
              <Text style={styles.truckSize}>{truck.description} • {truck.capacity}</Text>
            </View>
          </View>
          <Text style={styles.truckPrice}>${truck.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Extra services</Text>
      <Text style={styles.stepSubtitle}>Select additional services (optional)</Text>
      
      {EXTRA_SERVICES.map(service => (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.serviceOption,
            selectedServices.includes(service.id) && styles.serviceOptionSelected
          ]}
          onPress={() => toggleService(service.id)}
        >
          <View style={styles.serviceInfo}>
            <Feather name={service.icon as any} size={20} color="#0057FF" />
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
          </View>
          <View style={styles.serviceRight}>
            <Text style={styles.servicePrice}>+${service.price}</Text>
            <View style={[
              styles.checkbox,
              selectedServices.includes(service.id) && styles.checkboxSelected
            ]}>
              {selectedServices.includes(service.id) && (
                <Feather name="check" size={14} color="white" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Schedule your move</Text>
      
      <View style={styles.inputContainer}>
        <Feather name="calendar" size={20} color="#0057FF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Select date (MM/DD/YYYY)"
          value={moveDate}
          onChangeText={setMoveDate}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="clock" size={20} color="#0057FF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Preferred time slot"
          value={timeSlot}
          onChangeText={setTimeSlot}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="message-square" size={20} color="#0057FF" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special instructions (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Booking Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Truck Size:</Text>
          <Text style={styles.summaryValue}>
            {TRUCK_SIZES.find(t => t.id === selectedTruck)?.name}
          </Text>
        </View>
        {selectedServices.map(serviceId => {
          const service = EXTRA_SERVICES.find(s => s.id === serviceId);
          return (
            <View key={serviceId} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{service?.name}:</Text>
              <Text style={styles.summaryValue}>+${service?.price}</Text>
            </View>
          );
        })}
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total:</Text>
          <Text style={styles.summaryTotalValue}>${calculateTotal()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity 
            style={[styles.button, styles.backButtonFooter]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 4 ? 'Confirm Booking' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0057FF',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepTextActive: {
    color: 'white',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#0057FF',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  mapButtonText: {
    color: '#0057FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  truckOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  truckOptionSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#f0f8ff',
  },
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  truckDetails: {
    marginLeft: 12,
  },
  truckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  truckSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  truckPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceOptionSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#f0f8ff',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  serviceRight: {
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0057FF',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFooter: {
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#0057FF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});