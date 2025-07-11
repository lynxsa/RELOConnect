import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { liveDataService } from '../services/liveDataService';

const { width } = Dimensions.get('window');

interface BookingFormData {
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: Date;
  deliveryDate: Date;
  serviceType: string;
  packageDetails: string;
  specialInstructions: string;
  fleetOwnerId?: string;
  truckId?: string;
}

interface TruckOption {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  truckType: string;
  capacity: number;
  length: number;
  width: number;
  height: number;
  isAvailable: boolean;
  fleetOwner: {
    companyName: string;
    rating: number;
    isVerified: boolean;
  };
  assignments: Array<{
    driverProfile: {
      user: {
        firstName: string;
        lastName: string;
      };
      rating: number;
      experienceYears: number;
    };
  }>;
}

const ModernBookingScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableTrucks, setAvailableTrucks] = useState<TruckOption[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<TruckOption | null>(null);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: new Date(),
    deliveryDate: new Date(),
    serviceType: 'LOCAL_DELIVERY',
    packageDetails: '',
    specialInstructions: '',
  });

  const serviceTypes = [
    {
      id: 'LOCAL_DELIVERY',
      title: 'Local Delivery',
      description: 'Same city delivery within 50km',
      icon: 'truck',
      priceRange: 'R300 - R800',
    },
    {
      id: 'LONG_DISTANCE',
      title: 'Long Distance',
      description: 'Inter-city and provincial moves',
      icon: 'map',
      priceRange: 'R800 - R3000',
    },
    {
      id: 'FURNITURE_MOVING',
      title: 'Furniture Moving',
      description: 'Full household or office moves',
      icon: 'home',
      priceRange: 'R1000 - R5000',
    },
    {
      id: 'COMMERCIAL_TRANSPORT',
      title: 'Commercial Transport',
      description: 'Business goods and equipment',
      icon: 'briefcase',
      priceRange: 'R500 - R2500',
    },
  ];

  useEffect(() => {
    if (step === 3) {
      fetchAvailableTrucks();
    }
  }, [step, bookingData.serviceType]);

  const fetchAvailableTrucks = async () => {
    setLoading(true);
    try {
      const response = await liveDataService.get('/fleet/available-trucks', {
        serviceType: bookingData.serviceType,
        pickupDate: bookingData.pickupDate.toISOString(),
      });
      
      if (response.success) {
        setAvailableTrucks(response.data);
      } else {
        Alert.alert('Error', 'Failed to load available trucks');
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
      Alert.alert('Error', 'Network error while loading trucks');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedTruck) {
      Alert.alert('Error', 'Please select a truck for your booking');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        ...bookingData,
        fleetOwnerId: selectedTruck.fleetOwner.id,
        truckId: selectedTruck.id,
        pickupDate: bookingData.pickupDate.toISOString(),
        deliveryDate: bookingData.deliveryDate.toISOString(),
      };

      const response = await liveDataService.post('/bookings', bookingPayload);
      
      if (response.success) {
        Alert.alert(
          'Booking Confirmed!',
          `Your booking has been confirmed. Booking ID: ${response.data.id}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to tracking screen or home
                setStep(1);
                setBookingData({
                  pickupAddress: '',
                  deliveryAddress: '',
                  pickupDate: new Date(),
                  deliveryDate: new Date(),
                  serviceType: 'LOCAL_DELIVERY',
                  packageDetails: '',
                  specialInstructions: '',
                });
                setSelectedTruck(null);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Network error while creating booking');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              step >= stepNumber ? styles.stepCircleActive : styles.stepCircleInactive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                step >= stepNumber ? styles.stepNumberActive : styles.stepNumberInactive,
              ]}
            >
              {stepNumber}
            </Text>
          </View>
          {stepNumber < 4 && (
            <View
              style={[
                styles.stepLine,
                step > stepNumber ? styles.stepLineActive : styles.stepLineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pickup & Delivery Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pickup Address</Text>
        <View style={styles.inputWithIcon}>
          <Feather name="map-pin" size={20} color="#0057FF" />
          <TextInput
            style={styles.input}
            value={bookingData.pickupAddress}
            onChangeText={(text) => setBookingData({...bookingData, pickupAddress: text})}
            placeholder="Enter pickup address"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address</Text>
        <View style={styles.inputWithIcon}>
          <Feather name="navigation" size={20} color="#0057FF" />
          <TextInput
            style={styles.input}
            value={bookingData.deliveryAddress}
            onChangeText={(text) => setBookingData({...bookingData, deliveryAddress: text})}
            placeholder="Enter delivery address"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Package Details</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bookingData.packageDetails}
          onChangeText={(text) => setBookingData({...bookingData, packageDetails: text})}
          placeholder="Describe what you're moving (e.g., furniture, boxes, appliances)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Service Type</Text>
      
      <View style={styles.serviceGrid}>
        {serviceTypes.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              bookingData.serviceType === service.id && styles.serviceCardSelected,
            ]}
            onPress={() => setBookingData({...bookingData, serviceType: service.id})}
          >
            <View style={styles.serviceIconContainer}>
              <Feather
                name={service.icon as any}
                size={28}
                color={bookingData.serviceType === service.id ? '#FFFFFF' : '#0057FF'}
              />
            </View>
            <Text style={[
              styles.serviceTitle,
              bookingData.serviceType === service.id && styles.serviceTitleSelected,
            ]}>
              {service.title}
            </Text>
            <Text style={[
              styles.serviceDescription,
              bookingData.serviceType === service.id && styles.serviceDescriptionSelected,
            ]}>
              {service.description}
            </Text>
            <Text style={[
              styles.servicePriceRange,
              bookingData.serviceType === service.id && styles.servicePriceRangeSelected,
            ]}>
              {service.priceRange}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bookingData.specialInstructions}
          onChangeText={(text) => setBookingData({...bookingData, specialInstructions: text})}
          placeholder="Any special requirements or instructions"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderTruckCard = (truck: TruckOption) => {
    const driver = truck.assignments[0]?.driverProfile;
    
    return (
      <TouchableOpacity
        key={truck.id}
        style={[
          styles.truckCard,
          selectedTruck?.id === truck.id && styles.truckCardSelected,
        ]}
        onPress={() => setSelectedTruck(truck)}
      >
        <View style={styles.truckHeader}>
          <View style={styles.truckInfo}>
            <Text style={styles.truckTitle}>
              {truck.make} {truck.model}
            </Text>
            <Text style={styles.truckSubtitle}>
              {truck.registrationNumber} • {truck.truckType.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.truckCapacity}>
            <Text style={styles.capacityValue}>{truck.capacity}kg</Text>
            <Text style={styles.capacityLabel}>Capacity</Text>
          </View>
        </View>

        <View style={styles.truckSpecs}>
          <View style={styles.specItem}>
            <Feather name="maximize" size={16} color="#6B7280" />
            <Text style={styles.specText}>
              {truck.length}m × {truck.width}m × {truck.height}m
            </Text>
          </View>
        </View>

        <View style={styles.fleetOwnerInfo}>
          <View style={styles.ownerDetails}>
            <Text style={styles.ownerName}>{truck.fleetOwner.companyName}</Text>
            <View style={styles.ownerRating}>
              <Feather name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{truck.fleetOwner.rating.toFixed(1)}</Text>
              {truck.fleetOwner.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="shield-check" size={12} color="#10B981" />
                </View>
              )}
            </View>
          </View>
        </View>

        {driver && (
          <View style={styles.driverInfo}>
            <Feather name="user" size={16} color="#6B7280" />
            <Text style={styles.driverText}>
              Driver: {driver.user.firstName} {driver.user.lastName}
            </Text>
            <View style={styles.driverRating}>
              <Feather name="star" size={12} color="#FFB800" />
              <Text style={styles.driverRatingText}>{driver.rating.toFixed(1)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Truck</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding available trucks...</Text>
        </View>
      ) : (
        <ScrollView style={styles.trucksContainer} showsVerticalScrollIndicator={false}>
          {availableTrucks.map(renderTruckCard)}
          
          {availableTrucks.length === 0 && (
            <View style={styles.noTrucksContainer}>
              <Feather name="truck" size={48} color="#D1D5DB" />
              <Text style={styles.noTrucksTitle}>No trucks available</Text>
              <Text style={styles.noTrucksText}>
                Try selecting a different service type or date
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Booking Summary</Text>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Feather name="file-text" size={24} color="#0057FF" />
          <Text style={styles.summaryHeaderTitle}>Booking Details</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Pickup Address</Text>
          <Text style={styles.summaryValue}>{bookingData.pickupAddress}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Delivery Address</Text>
          <Text style={styles.summaryValue}>{bookingData.deliveryAddress}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Service Type</Text>
          <Text style={styles.summaryValue}>
            {serviceTypes.find(s => s.id === bookingData.serviceType)?.title}
          </Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Package Details</Text>
          <Text style={styles.summaryValue}>{bookingData.packageDetails}</Text>
        </View>
        
        {selectedTruck && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Selected Truck</Text>
            <Text style={styles.summaryValue}>
              {selectedTruck.make} {selectedTruck.model} ({selectedTruck.registrationNumber})
            </Text>
            <Text style={styles.summarySubValue}>
              {selectedTruck.fleetOwner.companyName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0057FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={styles.headerSpace} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBack}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrimary,
            (step === 3 && !selectedTruck) || loading ? styles.buttonDisabled : null,
          ]}
          onPress={step === 4 ? handleSubmitBooking : handleNext}
          disabled={(step === 3 && !selectedTruck) || loading}
        >
          <Text style={styles.buttonPrimaryText}>
            {loading ? 'Processing...' : step === 4 ? 'Confirm Booking' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSpace: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0057FF',
  },
  stepCircleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#9CA3AF',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#0057FF',
  },
  stepLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  serviceCardSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#0057FF',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceTitleSelected: {
    color: '#FFFFFF',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDescriptionSelected: {
    color: '#E5E7EB',
  },
  servicePriceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0057FF',
  },
  servicePriceRangeSelected: {
    color: '#FFFFFF',
  },
  trucksContainer: {
    flex: 1,
  },
  truckCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  truckCardSelected: {
    borderColor: '#0057FF',
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  truckInfo: {
    flex: 1,
  },
  truckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  truckSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  truckCapacity: {
    alignItems: 'center',
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  capacityLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  truckSpecs: {
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  fleetOwnerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  driverText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  noTrucksContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noTrucksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  noTrucksText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  summarySection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#111827',
  },
  summarySubValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  buttonPrimary: {
    backgroundColor: '#0057FF',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ModernBookingScreen;
