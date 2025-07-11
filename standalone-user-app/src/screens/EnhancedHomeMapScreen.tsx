import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation?: any;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const EnhancedHomeMapScreen: React.FC<Props> = ({ navigation: propNavigation }) => {
  const navigation = propNavigation || useNavigation();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Getting location...');
  const [isLoading, setIsLoading] = useState(true);
  
  const bottomSheetHeight = useRef(new Animated.Value(300)).current;
  const mapRef = useRef<MapView>(null);
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = 300 - gestureState.dy;
        if (newHeight >= 300 && newHeight <= 600) {
          bottomSheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -100) {
          expandBottomSheet();
        } else if (gestureState.dy > 100) {
          collapseBottomSheet();
        }
      },
    })
  ).current;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to show your current location');
        setIsLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;
      
      // Get address from coordinates
      const addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressResult.length > 0) {
        const address = addressResult[0];
        const addressString = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
        
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setCurrentAddress(addressString);
        setPickupLocation(addressString);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  const expandBottomSheet = () => {
    setIsBottomSheetExpanded(true);
    Animated.spring(bottomSheetHeight, {
      toValue: 600,
      useNativeDriver: false,
    }).start();
  };

  const collapseBottomSheet = () => {
    setIsBottomSheetExpanded(false);
    Animated.spring(bottomSheetHeight, {
      toValue: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleLocationSelect = (type: 'pickup' | 'drop') => {
    console.log(`Selecting ${type} location`);
    // Navigate to location selection screen
  };

  const handleProceed = () => {
    if (!pickupLocation || !dropLocation) {
      Alert.alert('Error', 'Please select both pickup and drop locations');
      return;
    }
    
    // Navigate to property selection
    navigation.navigate('PropertySelection', {
      pickupLocation,
      dropLocation,
    });
  };

  const quickActions = [
    { id: 1, title: 'Home Move', icon: 'home', color: '#FF6B6B' },
    { id: 2, title: 'Office Move', icon: 'business', color: '#4ECDC4' },
    { id: 3, title: 'Storage', icon: 'archive', color: '#45B7D1' },
    { id: 4, title: 'Courier', icon: 'mail', color: '#96CEB4' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0057FF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location || {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={isLoading}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Your Location"
            description={currentAddress}
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetHeight,
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle} />
        
        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Location Inputs */}
        <View style={styles.locationInputs}>
          <TouchableOpacity 
            style={styles.locationInput}
            onPress={() => handleLocationSelect('pickup')}
          >
            <View style={styles.locationIcon}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationText}>
                {pickupLocation || 'Select pickup location'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.locationSeparator}>
            <View style={styles.separatorLine} />
            <TouchableOpacity style={styles.swapButton}>
              <MaterialIcons name="swap-vert" size={20} color="#0057FF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.locationInput}
            onPress={() => handleLocationSelect('drop')}
          >
            <View style={styles.locationIcon}>
              <View style={styles.dropDot} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Drop Location</Text>
              <Text style={styles.locationText}>
                {dropLocation || 'Select drop location'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickAction, { backgroundColor: action.color }]}
                onPress={() => console.log(`${action.title} selected`)}
              >
                <Ionicons name={action.icon as any} size={20} color="#fff" />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!pickupLocation || !dropLocation) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={!pickupLocation || !dropLocation}
        >
          <LinearGradient
            colors={['#0057FF', '#00B2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proceedButtonGradient}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0057FF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  locationInputs: {
    marginBottom: 24,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  dropDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5722',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  locationSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 24,
  },
  swapButton: {
    padding: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    marginLeft: 8,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginTop: 4,
  },
  proceedButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});

export default EnhancedHomeMapScreen;
