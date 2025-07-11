import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { 
  ModernHeader, 
  ModernButton,
  ModernInput,
  ModernCard,
  ModernStatusCard,
} from '../components/ui';
import { bookingApi } from '../services/api';

interface LocationDetails {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  description: string;
}

const ModernBookingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [fromLocation, setFromLocation] = useState<LocationDetails>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [toLocation, setToLocation] = useState<LocationDetails>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [movingDate, setMovingDate] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const serviceCategories: ServiceCategory[] = [
    {
      id: 'home-move',
      name: 'Home Move',
      icon: 'home',
      color: '#0057FF',
      description: 'Complete residential relocation services',
    },
    {
      id: 'office-move',
      name: 'Office Move',
      icon: 'briefcase',
      color: '#00B2FF',
      description: 'Professional office and business relocation',
    },
    {
      id: 'storage',
      name: 'Storage Solutions',
      icon: 'archive',
      color: '#FF6B35',
      description: 'Secure storage and warehousing services',
    },
    {
      id: 'international',
      name: 'International Move',
      icon: 'globe',
      color: '#27AE60',
      description: 'Cross-border and international shipping',
    },
    {
      id: 'specialty',
      name: 'Specialty Items',
      icon: 'package',
      color: '#8E44AD',
      description: 'Piano, art, antiques, and fragile items',
    },
    {
      id: 'emergency',
      name: 'Emergency Move',
      icon: 'alert-circle',
      color: '#E74C3C',
      description: 'Urgent and last-minute relocation',
    },
  ];

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const [result] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (result) {
          setFromLocation({
            address: `${result.streetNumber || ''} ${result.street || ''}`.trim(),
            city: result.city || '',
            state: result.region || '',
            zipCode: result.postalCode || '',
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculatePrice = async () => {
    if (!selectedService || !fromLocation.address || !toLocation.address) {
      Alert.alert('Missing Information', 'Please complete all fields to get a price estimate');
      return;
    }

    setLoading(true);
    try {
      // Mock calculation for now
      const basePrice = selectedService.id === 'international' ? 2500 : 
                       selectedService.id === 'office-move' ? 1800 :
                       selectedService.id === 'specialty' ? 1200 : 
                       selectedService.id === 'emergency' ? 1500 : 1000;
      
      const distance = Math.random() * 500 + 50; // Mock distance
      const totalPrice = basePrice + (distance * 2);
      
      setEstimatedPrice(Math.round(totalPrice));
      setCurrentStep(4);
    } catch (error) {
      Alert.alert('Error', 'Unable to calculate price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async () => {
    if (!estimatedPrice) return;

    setLoading(true);
    try {
      const bookingData = {
        serviceType: selectedService?.id || '',
        fromAddress: `${fromLocation.address}, ${fromLocation.city}, ${fromLocation.state} ${fromLocation.zipCode}`,
        toAddress: `${toLocation.address}, ${toLocation.city}, ${toLocation.state} ${toLocation.zipCode}`,
        scheduledDate: movingDate,
        estimatedPrice,
        status: 'pending' as const,
      };

      // For now, just show success
      Alert.alert(
        'Booking Confirmed!',
        `Your ${selectedService?.name} booking has been created. Estimated cost: $${estimatedPrice}`,
        [{ text: 'OK', onPress: () => setCurrentStep(1) }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'Unable to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step && styles.stepTextActive
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderServiceSelection = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Choose Your Service</Text>
      <Text style={styles.stepSubtitle}>Select the type of relocation service you need</Text>
      
      <View style={styles.servicesGrid}>
        {serviceCategories.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              selectedService?.id === service.id && styles.serviceCardSelected
            ]}
            onPress={() => setSelectedService(service)}
          >
            <LinearGradient
              colors={[service.color, service.color + '80']}
              style={styles.serviceIcon}
            >
              <Feather name={service.icon} size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ModernButton
        title="Continue"
        onPress={() => setCurrentStep(2)}
        disabled={!selectedService}
        fullWidth
      />
    </View>
  );

  const renderLocationInput = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Location Details</Text>
      <Text style={styles.stepSubtitle}>Enter your pickup and destination addresses</Text>

      <ModernCard title="From Address" variant="bordered" padding="medium">
        <ModernInput
          placeholder="Street Address"
          value={fromLocation.address}
          onChangeText={(text) => setFromLocation(prev => ({ ...prev, address: text }))}
          icon="map-pin"
        />
        <View style={styles.locationRow}>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="City"
              value={fromLocation.city}
              onChangeText={(text) => setFromLocation(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="State"
              value={fromLocation.state}
              onChangeText={(text) => setFromLocation(prev => ({ ...prev, state: text }))}
            />
          </View>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="ZIP"
              value={fromLocation.zipCode}
              onChangeText={(text) => setFromLocation(prev => ({ ...prev, zipCode: text }))}
            />
          </View>
        </View>
        <ModernButton
          title="Use Current Location"
          variant="outline"
          icon="gps-fixed"
          onPress={getCurrentLocation}
          size="small"
        />
      </ModernCard>

      <ModernCard title="To Address" variant="bordered" padding="medium">
        <ModernInput
          placeholder="Street Address"
          value={toLocation.address}
          onChangeText={(text) => setToLocation(prev => ({ ...prev, address: text }))}
          icon="map-pin"
        />
        <View style={styles.locationRow}>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="City"
              value={toLocation.city}
              onChangeText={(text) => setToLocation(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="State"
              value={toLocation.state}
              onChangeText={(text) => setToLocation(prev => ({ ...prev, state: text }))}
            />
          </View>
          <View style={styles.locationField}>
            <ModernInput
              placeholder="ZIP"
              value={toLocation.zipCode}
              onChangeText={(text) => setToLocation(prev => ({ ...prev, zipCode: text }))}
            />
          </View>
        </View>
      </ModernCard>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep(1)}
        />
        <ModernButton
          title="Continue"
          onPress={() => setCurrentStep(3)}
          disabled={!fromLocation.address || !toLocation.address}
        />
      </View>
    </View>
  );

  const renderScheduling = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Schedule Your Move</Text>
      <Text style={styles.stepSubtitle}>When would you like to move?</Text>

      <ModernCard padding="medium">
        <ModernInput
          placeholder="Moving Date (MM/DD/YYYY)"
          value={movingDate}
          onChangeText={setMovingDate}
          icon="calendar"
        />
        <Text style={styles.helperText}>
          We recommend booking at least 2 weeks in advance for better availability
        </Text>
      </ModernCard>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep(2)}
        />
        <ModernButton
          title="Get Price Estimate"
          onPress={calculatePrice}
          disabled={!movingDate}
          loading={loading}
        />
      </View>
    </View>
  );

  const renderPriceEstimate = () => (
    <View style={styles.content}>
      <Text style={styles.stepTitle}>Price Estimate</Text>
      <Text style={styles.stepSubtitle}>Review your booking details</Text>

      <ModernCard padding="medium" variant="gradient">
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimated Total</Text>
          <Text style={styles.priceAmount}>${estimatedPrice}</Text>
        </View>
      </ModernCard>

      <ModernCard title="Booking Summary" padding="medium">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{selectedService?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>From:</Text>
          <Text style={styles.summaryValue}>{fromLocation.address}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>To:</Text>
          <Text style={styles.summaryValue}>{toLocation.address}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{movingDate}</Text>
        </View>
      </ModernCard>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep(3)}
        />
        <ModernButton
          title="Confirm Booking"
          onPress={createBooking}
          loading={loading}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderServiceSelection();
      case 2:
        return renderLocationInput();
      case 3:
        return renderScheduling();
      case 4:
        return renderPriceEstimate();
      default:
        return renderServiceSelection();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader 
        title="Book Your Move"
        subtitle="Step-by-step booking process"
        variant="gradient"
      />
      
      {renderStepIndicator()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
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
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0057FF',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#0057FF',
  },
  content: {
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  servicesGrid: {
    marginBottom: 24,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceCardSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#F0F7FF',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    flex: 1,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666666',
    flex: 2,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  locationField: {
    flex: 1,
    marginHorizontal: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  priceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ModernBookingScreen;
