/**
 * Enhanced Google Maps Integration for RELOConnect
 * 
 * This component provides comprehensive mapping functionality including:
 * - Address autocomplete and geocoding
 * - Real-time route calculation with traffic data
 * - Multiple route options comparison
 * - Live traffic and construction updates
 * - Route optimization for pricing calculation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Enhanced interfaces
export interface EnhancedMapLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  placeId?: string;
  types?: string[];
  formattedAddress: string;
}

export interface RouteOptimization {
  distance: number; // in km
  duration: number; // in minutes
  traffic: 'light' | 'moderate' | 'heavy' | 'severe';
  tollRoads: boolean;
  tollCost: number;
  fuelEfficiency: number;
  roadConditions: 'excellent' | 'good' | 'fair' | 'poor';
  weatherImpact: number;
  constructionDelays: number;
  alternativeRoutes: number;
  confidence: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  traffic: string;
  tollCost: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
  recommended: boolean;
  savings?: string;
}

interface EnhancedGoogleMapsProps {
  onLocationSelected: (pickup: EnhancedMapLocation, delivery: EnhancedMapLocation) => void;
  onRouteCalculated: (route: RouteOptimization) => void;
  onRouteOptionsUpdated?: (options: RouteOption[]) => void;
  initialPickup?: EnhancedMapLocation;
  initialDelivery?: EnhancedMapLocation;
  showRouteOptions?: boolean;
  enableTrafficLayer?: boolean;
  googleMapsApiKey: string;
}

export default function EnhancedGoogleMapsIntegration({
  onLocationSelected,
  onRouteCalculated,
  onRouteOptionsUpdated,
  initialPickup,
  initialDelivery,
  showRouteOptions = true,
  enableTrafficLayer = true,
  googleMapsApiKey,
}: EnhancedGoogleMapsProps) {
  // State management
  const [region, setRegion] = useState({
    latitude: -26.2041, // Johannesburg
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [pickupLocation, setPickupLocation] = useState<EnhancedMapLocation | null>(initialPickup || null);
  const [deliveryLocation, setDeliveryLocation] = useState<EnhancedMapLocation | null>(initialDelivery || null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [currentRouteOptimization, setCurrentRouteOptimization] = useState<RouteOptimization | null>(null);
  
  const [isSelectingPickup, setIsSelectingPickup] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  // Traffic and construction data
  const [trafficData, setTrafficData] = useState<any>(null);
  const [constructionAlerts, setConstructionAlerts] = useState<any[]>([]);
  
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map on mount
  useEffect(() => {
    const initMap = async () => {
      await initializeMap();
    };
    initMap();
  }, []);

  // Calculate routes when both locations are set
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateRouteOptions();
    }
  }, [pickupLocation, deliveryLocation]);

  // Auto-complete search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchText.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        performAddressSearch(searchText);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const initializeMap = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use the map features.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      Alert.alert('Map Error', 'Failed to initialize map. Please try again.');
    }
  }, []);

  const performAddressSearch = async (query: string) => {
    if (!query.trim() || !googleMapsApiKey) return;

    try {
      setLoading(true);
      
      // Use Google Places Autocomplete API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleMapsApiKey}&components=country:za&types=address`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setSearchSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        console.warn('Places API error:', data.status);
        setSearchSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      Alert.alert('Search Error', 'Failed to search addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = async (suggestion: any) => {
    try {
      setLoading(true);
      setShowSuggestions(false);
      setSearchText(suggestion.description);

      // Get detailed place information
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${googleMapsApiKey}&fields=geometry,formatted_address,address_components`
      );
      
      const detailsData = await detailsResponse.json();
      
      if (detailsData.status === 'OK') {
        const place = detailsData.result;
        const location = createEnhancedLocation(place);
        
        if (isSelectingPickup) {
          setPickupLocation(location);
          setIsSelectingPickup(false);
          setSearchText('');
        } else {
          setDeliveryLocation(location);
          setSearchText('');
        }
        
        // Animate to selected location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      Alert.alert('Selection Error', 'Failed to select address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createEnhancedLocation = (place: any): EnhancedMapLocation => {
    const addressComponents = place.address_components || [];
    const geometry = place.geometry.location;
    
    // Extract address components
    let city = '';
    let state = '';
    let postalCode = '';
    let country = '';
    
    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      latitude: geometry.lat,
      longitude: geometry.lng,
      address: place.formatted_address,
      city,
      state,
      postalCode,
      country,
      placeId: place.place_id,
      formattedAddress: place.formatted_address,
    };
  };

  const calculateRouteOptions = async () => {
    if (!pickupLocation || !deliveryLocation || !googleMapsApiKey) return;

    try {
      setLoading(true);
      
      // Calculate multiple route options
      const routePromises = [
        calculateRoute(pickupLocation, deliveryLocation, { avoidTolls: false, avoidHighways: false }),
        calculateRoute(pickupLocation, deliveryLocation, { avoidTolls: true, avoidHighways: false }),
        calculateRoute(pickupLocation, deliveryLocation, { avoidTolls: false, avoidHighways: true }),
      ];

      const routes = await Promise.all(routePromises);
      const validRoutes = routes.filter(route => route !== null);
      
      // Create route options
      const options: RouteOption[] = validRoutes.map((route, index) => {
        const names = ['Fastest Route', 'Avoid Tolls', 'Avoid Highways'];
        return {
          id: `route-${index}`,
          name: names[index] || `Route ${index + 1}`,
          distance: route.distance,
          duration: route.duration,
          traffic: route.traffic,
          tollCost: route.tollCost,
          coordinates: route.coordinates,
          recommended: index === 0,
          savings: index > 0 ? calculateSavings(validRoutes[0], route) : undefined,
        };
      });

      setRouteOptions(options);
      
      // Select the fastest route by default
      if (options.length > 0) {
        selectRouteOption(options[0]);
      }
      
      // Notify parent component
      if (onRouteOptionsUpdated) {
        onRouteOptionsUpdated(options);
      }
      
    } catch (error) {
      console.error('Error calculating routes:', error);
      Alert.alert('Route Error', 'Failed to calculate routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async (
    origin: EnhancedMapLocation,
    destination: EnhancedMapLocation,
    options: { avoidTolls: boolean; avoidHighways: boolean }
  ): Promise<RouteOptimization | null> => {
    try {
      // Use Google Directions API
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${googleMapsApiKey}&avoid=${options.avoidTolls ? 'tolls' : ''}${options.avoidHighways ? '|highways' : ''}&departure_time=now&traffic_model=best_guess`
      );
      
      const directionsData = await directionsResponse.json();
      
      if (directionsData.status === 'OK') {
        const route = directionsData.routes[0];
        const leg = route.legs[0];
        
        // Extract route coordinates
        const coordinates = decodePolyline(route.overview_polyline.points);
        
        // Calculate traffic conditions
        const normalDuration = leg.duration.value;
        const trafficDuration = leg.duration_in_traffic?.value || normalDuration;
        const trafficRatio = trafficDuration / normalDuration;
        
        let traffic: RouteOptimization['traffic'] = 'light';
        if (trafficRatio > 1.4) traffic = 'severe';
        else if (trafficRatio > 1.3) traffic = 'heavy';
        else if (trafficRatio > 1.15) traffic = 'moderate';
        
        // Estimate toll costs
        const tollCost = estimateTollCosts(leg.distance.value / 1000, options.avoidTolls);
        
        // Calculate weather impact
        const weatherImpact = await getWeatherImpact(origin, destination);
        
        return {
          distance: leg.distance.value / 1000, // Convert to km
          duration: Math.round(trafficDuration / 60), // Convert to minutes
          traffic,
          tollRoads: !options.avoidTolls && tollCost > 0,
          tollCost,
          fuelEfficiency: 10, // Default fuel efficiency
          roadConditions: 'good', // Default road condition
          weatherImpact,
          constructionDelays: 0, // Would be fetched from traffic APIs
          alternativeRoutes: directionsData.routes.length,
          confidence: calculateRouteConfidence(leg.distance.value / 1000, traffic),
          coordinates,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating individual route:', error);
      return null;
    }
  };

  const selectRouteOption = useCallback((route: RouteOption) => {
    setSelectedRoute(route);
    
    // Create route optimization data
    const routeOptimization: RouteOptimization = {
      distance: route.distance,
      duration: route.duration,
      traffic: route.traffic as RouteOptimization['traffic'],
      tollRoads: route.tollCost > 0,
      tollCost: route.tollCost,
      fuelEfficiency: 10,
      roadConditions: 'good',
      weatherImpact: 0.1,
      constructionDelays: 0,
      alternativeRoutes: routeOptions.length,
      confidence: calculateRouteConfidence(route.distance, route.traffic as RouteOptimization['traffic']),
      coordinates: route.coordinates,
    };
    
    setCurrentRouteOptimization(routeOptimization);
    
    // Notify parent components
    if (pickupLocation && deliveryLocation) {
      onLocationSelected(pickupLocation, deliveryLocation);
      onRouteCalculated(routeOptimization);
    }
    
    // Fit map to route
    if (mapRef.current && route.coordinates.length > 0) {
      mapRef.current.fitToCoordinates(route.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [pickupLocation, deliveryLocation, routeOptions, onLocationSelected, onRouteCalculated]);

  // Helper functions
  const decodePolyline = (encoded: string) => {
    const coordinates: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  };

  const estimateTollCosts = (distance: number, avoidTolls: boolean): number => {
    if (avoidTolls) return 0;
    if (distance > 100) return distance * 0.8; // R0.80 per km for long distance
    if (distance > 50) return distance * 0.5; // R0.50 per km for medium distance
    return 0; // No tolls for short distances
  };

  const getWeatherImpact = async (origin: EnhancedMapLocation, destination: EnhancedMapLocation): Promise<number> => {
    // In production, this would fetch from weather APIs
    return 0.05; // Default 5% weather impact
  };

  const calculateRouteConfidence = (distance: number, traffic: string): number => {
    let confidence = 90;
    if (distance > 500) confidence -= 10;
    if (traffic === 'heavy' || traffic === 'severe') confidence -= 15;
    return Math.max(confidence, 60);
  };

  const calculateSavings = (fastestRoute: RouteOptimization, alternativeRoute: RouteOptimization): string => {
    const timeSaving = fastestRoute.duration - alternativeRoute.duration;
    const costSaving = fastestRoute.tollCost - alternativeRoute.tollCost;
    
    if (timeSaving > 0) {
      return `${timeSaving} min faster`;
    } else if (costSaving > 0) {
      return `R${costSaving.toFixed(0)} toll savings`;
    }
    return 'Alternative route';
  };

  const resetSelection = () => {
    setPickupLocation(null);
    setDeliveryLocation(null);
    setSelectedRoute(null);
    setRouteOptions([]);
    setIsSelectingPickup(true);
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      {/* Search Interface */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <View style={styles.searchInputContainer}>
            <Feather 
              name={isSelectingPickup ? "map-pin" : "navigation"} 
              size={20} 
              color="#0057FF" 
            />
            <TextInput
              style={styles.searchInput}
              placeholder={isSelectingPickup ? "Enter pickup address..." : "Enter delivery address..."}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator size="small" color="#0057FF" />}
          </View>
          
          {/* Location Pills */}
          <View style={styles.locationPills}>
            {pickupLocation && (
              <TouchableOpacity 
                style={[styles.locationPill, styles.pickupPill]}
                onPress={() => setIsSelectingPickup(true)}
              >
                <Feather name="map-pin" size={14} color="#fff" />
                <Text style={styles.pillText} numberOfLines={1}>
                  {pickupLocation.address.split(',')[0]}
                </Text>
              </TouchableOpacity>
            )}
            {deliveryLocation && (
              <TouchableOpacity 
                style={[styles.locationPill, styles.deliveryPill]}
                onPress={() => setIsSelectingPickup(false)}
              >
                <Feather name="navigation" size={14} color="#fff" />
                <Text style={styles.pillText} numberOfLines={1}>
                  {deliveryLocation.address.split(',')[0]}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={initializeMap}>
            <Feather name="crosshair" size={20} color="#0057FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={resetSelection}>
            <Feather name="refresh-cw" size={20} color="#0057FF" />
          </TouchableOpacity>
          {routeOptions.length > 1 && (
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => setShowRouteModal(true)}
            >
              <Feather name="map" size={20} color="#0057FF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Suggestions */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(suggestion)}
              >
                <Feather name="map-pin" size={16} color="#666" />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionMain}>
                    {suggestion.structured_formatting.main_text}
                  </Text>
                  <Text style={styles.suggestionSecondary}>
                    {suggestion.structured_formatting.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsTraffic={enableTrafficLayer}
        showsBuildings={true}
        showsIndoors={true}
        showsMyLocationButton={false}
        showsUserLocation={true}
      >
        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude,
            }}
            title="Pickup Location"
            description={pickupLocation.address}
            pinColor="#0057FF"
          />
        )}

        {/* Delivery Marker */}
        {deliveryLocation && (
          <Marker
            coordinate={{
              latitude: deliveryLocation.latitude,
              longitude: deliveryLocation.longitude,
            }}
            title="Delivery Location"
            description={deliveryLocation.address}
            pinColor="#00B2FF"
          />
        )}

        {/* Route Polyline */}
        {selectedRoute && selectedRoute.coordinates.length > 0 && (
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor="#0057FF"
            strokeWidth={4}
            lineDashPattern={[]}
          />
        )}
      </MapView>

      {/* Route Information Panel */}
      {currentRouteOptimization && (
        <View style={styles.routeInfoPanel}>
          <View style={styles.routeInfo}>
            <View style={styles.routeMetric}>
              <Feather name="navigation" size={16} color="#0057FF" />
              <Text style={styles.routeMetricText}>
                {currentRouteOptimization.distance.toFixed(1)} km
              </Text>
            </View>
            <View style={styles.routeMetric}>
              <Feather name="clock" size={16} color="#0057FF" />
              <Text style={styles.routeMetricText}>
                {currentRouteOptimization.duration} min
              </Text>
            </View>
            <View style={styles.routeMetric}>
              <Feather 
                name={currentRouteOptimization.traffic === 'heavy' ? 'alert-triangle' : 'activity'} 
                size={16} 
                color={currentRouteOptimization.traffic === 'heavy' ? '#FF6B35' : '#0057FF'} 
              />
              <Text style={[
                styles.routeMetricText,
                currentRouteOptimization.traffic === 'heavy' && styles.heavyTrafficText
              ]}>
                {currentRouteOptimization.traffic}
              </Text>
            </View>
            {currentRouteOptimization.tollCost > 0 && (
              <View style={styles.routeMetric}>
                <Feather name="credit-card" size={16} color="#0057FF" />
                <Text style={styles.routeMetricText}>
                  R{currentRouteOptimization.tollCost.toFixed(0)}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.routeDetailsButton}
            onPress={() => setShowRouteModal(true)}
          >
            <Feather name="info" size={16} color="#0057FF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Route Options Modal */}
      <Modal
        visible={showRouteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Route Options</Text>
            <TouchableOpacity onPress={() => setShowRouteModal(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.routeOptionsList}>
            {routeOptions.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeOptionItem,
                  selectedRoute?.id === route.id && styles.selectedRouteOption
                ]}
                onPress={() => {
                  selectRouteOption(route);
                  setShowRouteModal(false);
                }}
              >
                <View style={styles.routeOptionHeader}>
                  <Text style={styles.routeOptionName}>{route.name}</Text>
                  {route.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.routeOptionMetrics}>
                  <Text style={styles.routeOptionMetric}>
                    {route.distance.toFixed(1)} km • {route.duration} min
                  </Text>
                  {route.tollCost > 0 && (
                    <Text style={styles.routeOptionMetric}>
                      Tolls: R{route.tollCost.toFixed(0)}
                    </Text>
                  )}
                  {route.savings && (
                    <Text style={styles.routeOptionSavings}>{route.savings}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1000,
  },
  searchBox: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  locationPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '45%',
  },
  pickupPill: {
    backgroundColor: '#0057FF',
  },
  deliveryPill: {
    backgroundColor: '#00B2FF',
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  quickActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },
  quickActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  suggestionText: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionMain: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  routeInfoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  routeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeMetricText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  heavyTrafficText: {
    color: '#FF6B35',
  },
  routeDetailsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  routeOptionsList: {
    padding: 16,
  },
  routeOptionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedRouteOption: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#0057FF',
  },
  routeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  routeOptionMetrics: {
    gap: 4,
  },
  routeOptionMetric: {
    fontSize: 14,
    color: '#666',
  },
  routeOptionSavings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
