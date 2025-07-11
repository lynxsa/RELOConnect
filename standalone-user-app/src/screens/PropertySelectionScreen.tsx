import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PropertyType {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  rooms: string;
  size: string;
  popular?: boolean;
}

interface PropertyFloorPlan {
  id: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  selected: boolean;
}

const PropertySelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  const propertyTypes: PropertyType[] = [
    {
      id: 'studio',
      title: 'Studio Apartment',
      description: 'Perfect for individuals',
      icon: 'home',
      rooms: '1 Room',
      size: '300-500 sq ft',
    },
    {
      id: '1bhk',
      title: '1 BHK',
      description: 'Ideal for couples',
      icon: 'home',
      rooms: '2 Rooms',
      size: '400-600 sq ft',
      popular: true,
    },
    {
      id: '2bhk',
      title: '2 BHK',
      description: 'Great for small families',
      icon: 'home',
      rooms: '3 Rooms',
      size: '800-1200 sq ft',
      popular: true,
    },
    {
      id: '3bhk',
      title: '3 BHK',
      description: 'Spacious for large families',
      icon: 'home',
      rooms: '4 Rooms',
      size: '1200-1800 sq ft',
    },
    {
      id: 'villa',
      title: 'Villa/House',
      description: 'Independent house',
      icon: 'home',
      rooms: '4+ Rooms',
      size: '1800+ sq ft',
    },
    {
      id: 'office',
      title: 'Office Space',
      description: 'Commercial relocation',
      icon: 'briefcase',
      rooms: 'Multiple',
      size: 'Variable',
    },
  ];

  const floorPlans: PropertyFloorPlan[] = [
    {
      id: 'compact',
      title: 'Compact Layout',
      bedrooms: 1,
      bathrooms: 1,
      size: '450 sq ft',
      selected: false,
    },
    {
      id: 'standard',
      title: 'Standard Layout',
      bedrooms: 2,
      bathrooms: 1,
      size: '650 sq ft',
      selected: false,
    },
    {
      id: 'premium',
      title: 'Premium Layout',
      bedrooms: 2,
      bathrooms: 2,
      size: '850 sq ft',
      selected: false,
    },
    {
      id: 'luxury',
      title: 'Luxury Layout',
      bedrooms: 3,
      bathrooms: 2,
      size: '1200 sq ft',
      selected: false,
    },
  ];

  const handlePropertyTypeSelect = (propertyId: string) => {
    setSelectedPropertyType(propertyId);
    setCurrentStep(2);
  };

  const handleFloorPlanSelect = (floorPlanId: string) => {
    setSelectedFloorPlan(floorPlanId);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedPropertyType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedFloorPlan) {
      // Navigate to items inventory screen
      navigation.navigate('ItemsInventory' as never);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigation.goBack();
    }
  };

  const PropertyTypeCard: React.FC<{ property: PropertyType }> = ({ property }) => (
    <TouchableOpacity
      style={[
        styles.propertyCard,
        selectedPropertyType === property.id && styles.selectedCard,
      ]}
      onPress={() => handlePropertyTypeSelect(property.id)}
      activeOpacity={0.7}
    >
      {property.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}
      <View style={styles.propertyHeader}>
        <View style={styles.propertyIcon}>
          <Feather name={property.icon} size={24} color="#0057FF" />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyDescription}>{property.description}</Text>
        </View>
      </View>
      <View style={styles.propertyDetails}>
        <View style={styles.detailItem}>
          <Feather name="grid" size={16} color="#666" />
          <Text style={styles.detailText}>{property.rooms}</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="maximize" size={16} color="#666" />
          <Text style={styles.detailText}>{property.size}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FloorPlanCard: React.FC<{ floorPlan: PropertyFloorPlan }> = ({ floorPlan }) => (
    <TouchableOpacity
      style={[
        styles.floorPlanCard,
        selectedFloorPlan === floorPlan.id && styles.selectedCard,
      ]}
      onPress={() => handleFloorPlanSelect(floorPlan.id)}
      activeOpacity={0.7}
    >
      <View style={styles.floorPlanHeader}>
        <Text style={styles.floorPlanTitle}>{floorPlan.title}</Text>
        <Text style={styles.floorPlanSize}>{floorPlan.size}</Text>
      </View>
      <View style={styles.floorPlanDetails}>
        <View style={styles.roomDetail}>
          <Feather name="bed" size={16} color="#666" />
          <Text style={styles.roomDetailText}>{floorPlan.bedrooms} Bed</Text>
        </View>
        <View style={styles.roomDetail}>
          <Feather name="droplet" size={16} color="#666" />
          <Text style={styles.roomDetailText}>{floorPlan.bathrooms} Bath</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ProgressBar: React.FC = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 2) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 2</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 1 ? 'Select Property Type' : 'Choose Floor Plan'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 ? (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What type of property are you moving?</Text>
            <Text style={styles.stepDescription}>
              Select the property type that best matches your current home or office.
            </Text>
            
            <View style={styles.cardsContainer}>
              {propertyTypes.map((property) => (
                <PropertyTypeCard key={property.id} property={property} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your floor plan like?</Text>
            <Text style={styles.stepDescription}>
              This helps us estimate the volume and plan the moving process better.
            </Text>
            
            <View style={styles.cardsContainer}>
              {floorPlans.map((floorPlan) => (
                <FloorPlanCard key={floorPlan.id} floorPlan={floorPlan} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (currentStep === 1 && !selectedPropertyType) || 
            (currentStep === 2 && !selectedFloorPlan) ? styles.disabledButton : null,
          ]}
          onPress={handleNext}
          disabled={
            (currentStep === 1 && !selectedPropertyType) || 
            (currentStep === 2 && !selectedFloorPlan)
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              (currentStep === 1 && !selectedPropertyType) || 
              (currentStep === 2 && !selectedFloorPlan)
                ? ['#E0E0E0', '#E0E0E0']
                : ['#0057FF', '#00B2FF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[
              styles.nextButtonText,
              (currentStep === 1 && !selectedPropertyType) || 
              (currentStep === 2 && !selectedFloorPlan) ? styles.disabledButtonText : null,
            ]}>
              {currentStep === 2 ? 'Continue to Items' : 'Next'}
            </Text>
            <Feather 
              name="arrow-right" 
              size={20} 
              color={
                (currentStep === 1 && !selectedPropertyType) || 
                (currentStep === 2 && !selectedFloorPlan) ? '#999' : 'white'
              }
            />
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0057FF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
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
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  propertyCard: {
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
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  floorPlanCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  floorPlanHeader: {
    marginBottom: 12,
  },
  floorPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  floorPlanSize: {
    fontSize: 14,
    color: '#666',
  },
  floorPlanDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomDetailText: {
    fontSize: 14,
    color: '#666',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default PropertySelectionScreen;
