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
import ItemsInventoryScreen from './ItemsInventoryScreen';
import { calculateVehicleRequirement } from '../../data/movingItems';

type BookingScreenProps = NativeStackScreenProps<any, 'Booking'>;

// Google Maps API key (in production, store this securely)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual key

export default function BookingScreen({ navigation }: BookingScreenProps) {
  // State management
  const [step, setStep] = useState(1); // 1: Locations, 2: Items, 3: Vehicle & Services, 4: Schedule, 5: Confirmation
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<ExtraServiceRequest[]>([]);
  const [pickupLocation, setPickupLocation] = useState<EnhancedMapLocation | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<EnhancedMapLocation | null>(null);
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [moveDate, setMoveDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Items inventory state
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [recommendedVehicle, setRecommendedVehicle] = useState<string>('');
  const [showItemsScreen, setShowItemsScreen] = useState(false);
  
  // Pricing state
  const [priceBreakdown, setPriceBreakdown] = useState<AdvancedPriceBreakdown | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [priceValidUntil, setPriceValidUntil] = useState<Date | null>(null);

  // Calculate pricing when key inputs change
  useEffect(() => {
    if (pickupLocation && deliveryLocation && selectedTruck && routeOptimization) {
      calculateAdvancedPricing();
    }
  }, [pickupLocation, deliveryLocation, selectedTruck, selectedServices, routeOptimization, moveDate]);

  const calculateAdvancedPricing = async () => {
    if (!pickupLocation || !deliveryLocation || !selectedTruck || !routeOptimization) return;

    setIsCalculatingPrice(true);
    try {
      // Convert locations to AdvancedLocation format
      const origin: AdvancedLocation = {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        address: pickupLocation.address,
        city: pickupLocation.city || '',
        state: pickupLocation.state || '',
        postalCode: pickupLocation.postalCode || '',
        country: pickupLocation.country || 'South Africa',
        placeId: pickupLocation.placeId,
      };

      const destination: AdvancedLocation = {
        latitude: deliveryLocation.latitude,
        longitude: deliveryLocation.longitude,
        address: deliveryLocation.address,
        city: deliveryLocation.city || '',
        state: deliveryLocation.state || '',
        postalCode: deliveryLocation.postalCode || '',
        country: deliveryLocation.country || 'South Africa',
        placeId: deliveryLocation.placeId,
      };

      // Prepare pricing parameters
      const scheduledDateTime = moveDate ? new Date(moveDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const pricingParams: PricingParameters = {
        origin,
        destination,
        vehicleClassId: selectedTruck,
        extraServices: selectedServices,
        scheduledDateTime,
        customerProfile: {
          tier: 'regular', // Would come from user profile
          loyaltyScore: 0,
          creditRating: 'good',
          pastBookings: 0,
        },
        routePreferences: {
          avoidTolls: false,
          avoidHighways: false,
          preferScenicRoute: false,
          maximumDetour: 50,
        },
      };

      // Calculate advanced pricing
      const pricing = await advancedPricingEngine.calculateAdvancedPricing(pricingParams);
      setPriceBreakdown(pricing);
      setPriceValidUntil(pricing.validUntil);

    } catch (error) {
      console.error('Error calculating pricing:', error);
      Alert.alert(
        'Pricing Error',
        'Unable to calculate pricing. Please check your selections and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleLocationSelected = (pickup: EnhancedMapLocation, delivery: EnhancedMapLocation) => {
    setPickupLocation(pickup);
    setDeliveryLocation(delivery);
    setShowMapModal(false);
  };

  const handleRouteCalculated = (route: RouteOptimization) => {
    setRouteOptimization(route);
  };

  const toggleExtraService = (serviceId: string) => {
    setSelectedServices(prev => {
      const existingIndex = prev.findIndex(service => service.serviceId === serviceId);
      
      if (existingIndex >= 0) {
        // Remove service
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add service
        const serviceConfig = EXTRA_SERVICES.find(s => s.id === serviceId);
        if (serviceConfig) {
          const newService: ExtraServiceRequest = {
            serviceId,
            quantity: 1,
            priority: 'normal',
          };
          
          // Set default quantities for specific services
          if (serviceId === 'loading' && serviceConfig.unit === 'person') {
            newService.quantity = 2; // Default 2 people
          } else if (serviceId === 'stairs' && serviceConfig.unit === 'flight') {
            newService.quantity = 1; // Default 1 flight
          } else if (serviceId === 'waiting' && serviceConfig.unit === '15min') {
            newService.quantity = 2; // Default 30 minutes (2 x 15min blocks)
          }
          
          return [...prev, newService];
        }
        return prev;
      }
    });
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.serviceId === serviceId 
          ? { ...service, quantity: Math.max(1, quantity) }
          : service
      )
    );
  };

  const updateServiceCustomValue = (serviceId: string, customValue: number) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.serviceId === serviceId 
          ? { ...service, customValue }
          : service
      )
    );
  };

  const proceedToNextStep = () => {
    if (step === 1) {
      if (!pickupLocation || !deliveryLocation) {
        Alert.alert('Missing Information', 'Please select both pickup and delivery locations.');
        return;
      }
      setShowItemsScreen(true); // Show items inventory screen
    } else if (step === 2) {
      if (selectedItems.length === 0) {
        Alert.alert('Missing Information', 'Please select items to move.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedTruck) {
        Alert.alert('Missing Information', 'Please select a vehicle type.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!moveDate || !timeSlot) {
        Alert.alert('Missing Information', 'Please select a move date and time slot.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      handleBookingConfirmation();
    }
  };

  // Handle items inventory completion
  const handleItemsComplete = (items: any[], recommendedVehicleType: string) => {
    setSelectedItems(items);
    setRecommendedVehicle(recommendedVehicleType);
    setSelectedTruck(recommendedVehicleType); // Auto-select recommended vehicle
    setShowItemsScreen(false);
    setStep(2);
  };

  const handleItemsBack = () => {
    setShowItemsScreen(false);
  };

  const handleBookingConfirmation = () => {
    if (!priceBreakdown) {
      Alert.alert('Error', 'Unable to process booking. Please try again.');
      return;
    }

    // Navigate to payment screen with booking details
    navigation.navigate('Payment', {
      bookingDetails: {
        pickup: pickupLocation,
        delivery: deliveryLocation,
        vehicle: selectedTruck,
        services: selectedServices,
        date: moveDate,
        timeSlot,
        notes,
        pricing: priceBreakdown,
        route: routeOptimization,
      },
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((stepNum) => (
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
          {stepNum < 5 && <View style={[
            styles.stepConnector,
            step > stepNum && styles.stepConnectorActive
          ]} />}
        </View>
      ))}
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Where are you moving?</Text>
      <Text style={styles.stepDescription}>
        Select your pickup and delivery locations to get an accurate quote.
      </Text>

      <TouchableOpacity 
        style={styles.locationButton}
        onPress={() => setShowMapModal(true)}
      >
        <View style={styles.locationButtonContent}>
          <Feather name="map-pin" size={24} color="#0057FF" />
          <View style={styles.locationButtonText}>
            <Text style={styles.locationButtonTitle}>
              {pickupLocation ? 'Update Locations' : 'Select Locations'}
            </Text>
            <Text style={styles.locationButtonSubtitle}>
              {pickupLocation && deliveryLocation 
                ? `${pickupLocation.city} → ${deliveryLocation.city}`
                : 'Tap to open map and select pickup & delivery locations'
              }
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {routeOptimization && (
        <View style={styles.routeInfoCard}>
          <Text style={styles.routeInfoTitle}>Route Information</Text>
          <View style={styles.routeInfoMetrics}>
            <View style={styles.routeInfoMetric}>
              <Feather name="navigation" size={16} color="#0057FF" />
              <Text style={styles.routeInfoText}>{routeOptimization.distance.toFixed(1)} km</Text>
            </View>
            <View style={styles.routeInfoMetric}>
              <Feather name="clock" size={16} color="#0057FF" />
              <Text style={styles.routeInfoText}>{routeOptimization.duration} min</Text>
            </View>
            <View style={styles.routeInfoMetric}>
              <Feather name="activity" size={16} color="#0057FF" />
              <Text style={styles.routeInfoText}>{routeOptimization.traffic}</Text>
            </View>
            {routeOptimization.tollCost > 0 && (
              <View style={styles.routeInfoMetric}>
                <Feather name="credit-card" size={16} color="#0057FF" />
                <Text style={styles.routeInfoText}>R{routeOptimization.tollCost.toFixed(0)}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderItemsSummaryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Items Summary</Text>
      <Text style={styles.stepDescription}>
        Review your selected items and recommended vehicle size.
      </Text>

      <TouchableOpacity 
        style={styles.itemsSummaryButton}
        onPress={() => setShowItemsScreen(true)}
      >
        <View style={styles.itemsSummaryContent}>
          <Feather name="package" size={24} color="#0057FF" />
          <View style={styles.itemsSummaryText}>
            <Text style={styles.itemsSummaryTitle}>
              {selectedItems.length > 0 ? `${selectedItems.length} Items Selected` : 'Select Items to Move'}
            </Text>
            <Text style={styles.itemsSummarySubtitle}>
              {selectedItems.length > 0 
                ? `Recommended: ${recommendedVehicle || 'Small Truck'}`
                : 'Tap to select items and get vehicle recommendation'
              }
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {selectedItems.length > 0 && (
        <View style={styles.itemsPreviewCard}>
          <Text style={styles.itemsPreviewTitle}>Selected Items Preview</Text>
          <View style={styles.itemsPreviewList}>
            {selectedItems.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.itemsPreviewItem}>
                <Text style={styles.itemsPreviewName}>
                  {item.customName || 'Item'} x{item.quantity}
                </Text>
              </View>
            ))}
            {selectedItems.length > 3 && (
              <Text style={styles.itemsPreviewMore}>
                +{selectedItems.length - 3} more items
              </Text>
            )}
          </View>
          
          {recommendedVehicle && (
            <View style={styles.vehicleRecommendation}>
              <Feather name="truck" size={20} color="#0057FF" />
              <Text style={styles.vehicleRecommendationText}>
                Recommended: {recommendedVehicle}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderVehicleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose your vehicle</Text>
      <Text style={styles.stepDescription}>
        Select the right vehicle size for your move.
      </Text>

      <ScrollView style={styles.vehicleList} showsVerticalScrollIndicator={false}>
        {VEHICLE_CLASSES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              selectedTruck === vehicle.id && styles.vehicleCardSelected
            ]}
            onPress={() => setSelectedTruck(vehicle.id)}
          >
            <View style={styles.vehicleCardContent}>
              <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
              </View>
              {selectedTruck === vehicle.id && (
                <Feather name="check-circle" size={24} color="#0057FF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.servicesTitle}>Extra Services</Text>
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        {EXTRA_SERVICES.map((service) => {
          const isSelected = selectedServices.some(s => s.serviceId === service.id);
          const selectedService = selectedServices.find(s => s.serviceId === service.id);
          
          return (
            <View key={service.id} style={styles.serviceCard}>
              <TouchableOpacity
                style={styles.serviceCardHeader}
                onPress={() => toggleExtraService(service.id)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <Text style={styles.servicePrice}>
                      {service.priceType === 'flat' && `R${service.price}`}
                      {service.priceType === 'per_unit' && `R${service.price} per ${service.unit}`}
                      {service.priceType === 'percentage' && `${service.price}% of item value`}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.serviceToggle,
                  isSelected && styles.serviceToggleSelected
                ]}>
                  {isSelected && <Feather name="check" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              {isSelected && selectedService && (
                <View style={styles.serviceOptions}>
                  {service.priceType === 'per_unit' && (
                    <View style={styles.quantitySelector}>
                      <Text style={styles.quantityLabel}>Quantity:</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateServiceQuantity(service.id, selectedService.quantity - 1)}
                        >
                          <Feather name="minus" size={16} color="#0057FF" />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{selectedService.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateServiceQuantity(service.id, selectedService.quantity + 1)}
                        >
                          <Feather name="plus" size={16} color="#0057FF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {service.priceType === 'percentage' && (
                    <View style={styles.valueInput}>
                      <Text style={styles.valueLabel}>Item Value (R):</Text>
                      <TextInput
                        style={styles.valueTextInput}
                        placeholder="Enter total value"
                        keyboardType="numeric"
                        value={selectedService.customValue?.toString() || ''}
                        onChangeText={(text) => updateServiceCustomValue(service.id, parseFloat(text) || 0)}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>When do you want to move?</Text>
      <Text style={styles.stepDescription}>
        Choose your preferred date and time slot.
      </Text>

      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleLabel}>Move Date</Text>
        <TextInput
          style={styles.scheduleInput}
          placeholder="Select date (YYYY-MM-DD)"
          value={moveDate}
          onChangeText={setMoveDate}
        />
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleLabel}>Time Slot</Text>
        <View style={styles.timeSlots}>
          {['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-20)'].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                timeSlot === slot && styles.timeSlotSelected
              ]}
              onPress={() => setTimeSlot(slot)}
            >
              <Text style={[
                styles.timeSlotText,
                timeSlot === slot && styles.timeSlotTextSelected
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleLabel}>Additional Notes</Text>
        <TextInput
          style={styles.scheduleTextArea}
          placeholder="Any special instructions or requirements..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Booking Summary</Text>
      <Text style={styles.stepDescription}>
        Please review your booking details before confirming.
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Route</Text>
          <Text style={styles.summaryText}>
            From: {pickupLocation?.city || 'Not selected'}
          </Text>
          <Text style={styles.summaryText}>
            To: {deliveryLocation?.city || 'Not selected'}
          </Text>
          <Text style={styles.summaryText}>
            Distance: {routeOptimization?.distance.toFixed(1) || 0} km
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Vehicle & Services</Text>
          <Text style={styles.summaryText}>
            Vehicle: {VEHICLE_CLASSES.find(v => v.id === selectedTruck)?.name || 'Not selected'}
          </Text>
          {selectedServices.length > 0 && (
            <Text style={styles.summaryText}>
              Extra Services: {selectedServices.length} selected
            </Text>
          )}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Schedule</Text>
          <Text style={styles.summaryText}>Date: {moveDate || 'Not selected'}</Text>
          <Text style={styles.summaryText}>Time: {timeSlot || 'Not selected'}</Text>
        </View>
      </View>

      {priceBreakdown && (
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Pricing Breakdown</Text>
          
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Base Fare</Text>
            <Text style={styles.pricingValue}>R{priceBreakdown.baseFare.toFixed(2)}</Text>
          </View>

          {priceBreakdown.extraServices.map((service) => (
            <View key={service.serviceId} style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>{service.name}</Text>
              <Text style={styles.pricingValue}>R{service.totalPrice.toFixed(2)}</Text>
            </View>
          ))}

          {priceBreakdown.demandSurcharge > 0 && (
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Demand Surcharge</Text>
              <Text style={styles.pricingValue}>R{priceBreakdown.demandSurcharge.toFixed(2)}</Text>
            </View>
          )}

          {priceBreakdown.fuelSurcharge > 0 && (
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Fuel Surcharge</Text>
              <Text style={styles.pricingValue}>R{priceBreakdown.fuelSurcharge.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Service Fee</Text>
            <Text style={styles.pricingValue}>R{priceBreakdown.serviceFee.toFixed(2)}</Text>
          </View>

          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>VAT (15%)</Text>
            <Text style={styles.pricingValue}>R{priceBreakdown.taxes.toFixed(2)}</Text>
          </View>

          <View style={[styles.pricingItem, styles.pricingTotal]}>
            <Text style={styles.pricingTotalLabel}>Total</Text>
            <Text style={styles.pricingTotalValue}>R{priceBreakdown.total.toFixed(2)}</Text>
          </View>

          <Text style={styles.pricingConfidence}>
            Price confidence: {priceBreakdown.confidence}%
          </Text>
          
          {priceValidUntil && (
            <Text style={styles.pricingValidity}>
              Valid until: {priceValidUntil.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Move</Text>
        <View style={styles.headerRight} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderLocationStep()}
        {step === 2 && renderItemsSummaryStep()}
        {step === 3 && renderVehicleStep()}
        {step === 4 && renderScheduleStep()}
        {step === 5 && renderConfirmationStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, isCalculatingPrice && styles.nextButtonDisabled]}
          onPress={proceedToNextStep}
          disabled={isCalculatingPrice}
        >
          {isCalculatingPrice ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 5 ? 'Confirm Booking' : 'Continue'}
              </Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Items Inventory Modal */}
      <Modal
        visible={showItemsScreen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ItemsInventoryScreen
          onComplete={handleItemsComplete}
          onBack={handleItemsBack}
        />
      </Modal>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapModal}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Select Locations</Text>
            <View style={styles.headerRight} />
          </View>
          
          <EnhancedGoogleMapsIntegration
            onLocationSelected={handleLocationSelected}
            onRouteCalculated={handleRouteCalculated}
            initialPickup={pickupLocation || undefined}
            initialDelivery={deliveryLocation || undefined}
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
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
    color: '#fff',
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
  },
  stepConnectorActive: {
    backgroundColor: '#0057FF',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  locationButton: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  locationButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  routeInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  routeInfoMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  routeInfoMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  vehicleList: {
    maxHeight: 300,
    marginBottom: 24,
  },
  vehicleCard: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  vehicleCardSelected: {
    borderColor: '#0057FF',
    backgroundColor: '#f0f7ff',
  },
  vehicleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleCapacity: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#666',
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  servicesList: {
    maxHeight: 400,
  },
  serviceCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  serviceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  serviceToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceToggleSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  serviceOptions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  valueInput: {
    marginTop: 12,
  },
  valueLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  valueTextInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scheduleInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  timeSlots: {
    flexDirection: 'row',
    gap: 12,
  },
  timeSlot: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  scheduleTextArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 16,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pricingTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
    paddingTop: 16,
  },
  pricingTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  pricingTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0057FF',
  },
  pricingConfidence: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  pricingValidity: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0057FF',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  mapModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemsSummaryButton: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  itemsSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsSummaryText: {
    flex: 1,
    marginLeft: 16,
  },
  itemsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemsSummarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  itemsPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 16,
  },
  itemsPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemsPreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemsPreviewItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsPreviewName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  itemsPreviewMore: {
    fontSize: 14,
    color: '#0057FF',
    marginTop: 4,
  },
  vehicleRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  vehicleRecommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
});
