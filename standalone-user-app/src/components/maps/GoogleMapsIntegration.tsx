import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface MapLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  coordinates: Array<{ latitude: number; longitude: number }>;
}

interface GoogleMapsIntegrationProps {
  onLocationSelected: (pickup: MapLocation, delivery: MapLocation) => void;
  onRouteCalculated: (route: RouteInfo) => void;
  initialPickup?: MapLocation;
  initialDelivery?: MapLocation;
}

export default function GoogleMapsIntegration({
  onLocationSelected,
  onRouteCalculated,
  initialPickup,
  initialDelivery,
}: GoogleMapsIntegrationProps) {
  const [region, setRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [pickupLocation, setPickupLocation] = useState<MapLocation | null>(initialPickup || null);
  const [deliveryLocation, setDeliveryLocation] = useState<MapLocation | null>(initialDelivery || null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [isSelectingPickup, setIsSelectingPickup] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateRoute();
    }
  }, [pickupLocation, deliveryLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Use Google Places API or Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };
        
        if (isSelectingPickup) {
          setPickupLocation(location);
        } else {
          setDeliveryLocation(location);
        }
        
        // Animate to location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...location,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } else {
        Alert.alert('Location not found', 'Please try a different search term.');
      }
    } catch (error) {
      Alert.alert('Search failed', 'Unable to search for location. Please try again.');
    } finally {
      setLoading(false);
      setSearchText('');
    }
  };

  const onMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setLoading(true);
    
    try {
      // Reverse geocoding to get address
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      const data = await response.json();
      let address = 'Unknown location';
      
      if (data.results && data.results.length > 0) {
        address = data.results[0].formatted_address;
      }
      
      const location: MapLocation = {
        ...coordinate,
        address,
      };
      
      if (isSelectingPickup) {
        setPickupLocation(location);
        setIsSelectingPickup(false);
      } else {
        setDeliveryLocation(location);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Still set the location without address
      const location: MapLocation = {
        ...coordinate,
        address: 'Selected location',
      };
      
      if (isSelectingPickup) {
        setPickupLocation(location);
        setIsSelectingPickup(false);
      } else {
        setDeliveryLocation(location);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!pickupLocation || !deliveryLocation) return;
    
    try {
      // Use Google Directions API
      const origin = `${pickupLocation.latitude},${pickupLocation.longitude}`;
      const destination = `${deliveryLocation.latitude},${deliveryLocation.longitude}`;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Decode polyline
        const coordinates = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(coordinates);
        
        // Calculate route info
        const routeInfo: RouteInfo = {
          distance: leg.distance.value / 1000, // Convert to km
          duration: leg.duration.value / 60, // Convert to minutes
          coordinates,
        };
        
        onRouteCalculated(routeInfo);
        onLocationSelected(pickupLocation, deliveryLocation);
        
        // Fit map to show both locations
        if (mapRef.current && coordinates.length > 0) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
      Alert.alert('Route calculation failed', 'Unable to calculate route between locations.');
    }
  };

  // Decode Google Maps polyline
  const decodePolyline = (encoded: string) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  const resetSelection = () => {
    setPickupLocation(null);
    setDeliveryLocation(null);
    setRouteCoordinates([]);
    setIsSelectingPickup(true);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={isSelectingPickup ? "Search pickup location..." : "Search delivery location..."}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => searchLocation(searchText)}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onPress={onMapPress}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled={loading}
      >
        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            description={pickupLocation.address}
            pinColor="#0057FF"
          />
        )}

        {/* Delivery Marker */}
        {deliveryLocation && (
          <Marker
            coordinate={deliveryLocation}
            title="Delivery Location"
            description={deliveryLocation.address}
            pinColor="#28A745"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0057FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.locationInfo}>
          {pickupLocation && (
            <View style={styles.locationItem}>
              <Feather name="map-pin" size={16} color="#0057FF" />
              <Text style={styles.locationText} numberOfLines={1}>
                Pickup: {pickupLocation.address}
              </Text>
            </View>
          )}
          
          {deliveryLocation && (
            <View style={styles.locationItem}>
              <Feather name="flag" size={16} color="#28A745" />
              <Text style={styles.locationText} numberOfLines={1}>
                Delivery: {deliveryLocation.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!pickupLocation && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Tap on the map or search to select pickup location
              </Text>
            </View>
          )}
          
          {pickupLocation && !deliveryLocation && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Now select your delivery location
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
              <Feather name="refresh-cw" size={16} color="#666" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.currentLocationButton} 
              onPress={getCurrentLocation}
            >
              <Feather name="crosshair" size={16} color="#0057FF" />
              <Text style={styles.currentLocationButtonText}>My Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  map: {
    width,
    height,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
  },
  instructionContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0057FF',
  },
  instructionText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
  },
  resetButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  currentLocationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  currentLocationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
});
