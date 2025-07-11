import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  calculateFare, 
  getRecommendedVehicleClasses, 
  calculateRouteEstimate,
  VEHICLE_CLASSES,
  type AddOnServices,
  type FareCalculation,
  type VehicleClass
} from '../../services/comprehensivePricingService';

interface LiveFareCalculatorProps {
  distance: number;
  pickupAddress: string;
  dropoffAddress: string;
  loadDescription?: string;
  onFareCalculated: (fare: FareCalculation) => void;
  onVehicleSelected: (vehicleClass: VehicleClass) => void;
}

export default function LiveFareCalculator({
  distance,
  pickupAddress,
  dropoffAddress,
  loadDescription = '',
  onFareCalculated,
  onVehicleSelected
}: LiveFareCalculatorProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('bakkie');
  const [addOns, setAddOns] = useState<AddOnServices>({
    stairs: false,
    stairsCount: 1,
    helpers: false,
    helpersCount: 1,
    packing: false,
    cleaning: false,
    insurance: false,
    insuranceValue: 10000,
    express: false
  });

  // Get recommended vehicles based on load description
  const recommendedVehicles = useMemo(() => {
    if (loadDescription) {
      return getRecommendedVehicleClasses(loadDescription, distance);
    }
    return VEHICLE_CLASSES;
  }, [loadDescription, distance]);

  // Calculate fare in real-time
  const fareCalculation = useMemo(() => {
    try {
      return calculateFare(distance, selectedVehicle, addOns);
    } catch (error) {
      console.error('Fare calculation error:', error);
      return null;
    }
  }, [distance, selectedVehicle, addOns]);

  // Calculate route estimate
  const routeEstimate = useMemo(() => {
    try {
      return calculateRouteEstimate(distance, selectedVehicle);
    } catch (error) {
      console.error('Route estimate error:', error);
      return null;
    }
  }, [distance, selectedVehicle]);

  // Notify parent of fare changes
  useEffect(() => {
    if (fareCalculation) {
      onFareCalculated(fareCalculation);
    }
  }, [fareCalculation, onFareCalculated]);

  // Notify parent of vehicle selection
  useEffect(() => {
    const vehicle = VEHICLE_CLASSES.find(v => v.id === selectedVehicle);
    if (vehicle) {
      onVehicleSelected(vehicle);
    }
  }, [selectedVehicle, onVehicleSelected]);

  const updateAddOn = (key: keyof AddOnServices, value: any) => {
    setAddOns(prev => ({ ...prev, [key]: value }));
  };

  const incrementCounter = (key: 'stairsCount' | 'helpersCount') => {
    setAddOns(prev => ({ ...prev, [key]: Math.min(prev[key] + 1, 10) }));
  };

  const decrementCounter = (key: 'stairsCount' | 'helpersCount') => {
    setAddOns(prev => ({ ...prev, [key]: Math.max(prev[key] - 1, 1) }));
  };

  if (!fareCalculation) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-600">Calculating fare...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Route Summary Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={20} color="#0057FF" />
          <Text className="ml-2 text-sm text-gray-600 flex-1" numberOfLines={1}>
            {pickupAddress}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="flag" size={20} color="#00B2FF" />
          <Text className="ml-2 text-sm text-gray-600 flex-1" numberOfLines={1}>
            {dropoffAddress}
          </Text>
        </View>
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-lg font-semibold text-gray-800">
            {distance.toFixed(1)} km • {routeEstimate?.estimatedDuration ? `${Math.round(routeEstimate.estimatedDuration)} min` : 'Calculating...'}
          </Text>
        </View>
      </View>

      {/* Vehicle Selection */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Choose Your Vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {recommendedVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle.id)}
                className={`p-3 rounded-xl border-2 min-w-[120px] ${
                  selectedVehicle === vehicle.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
              >
                <Text className="text-2xl text-center mb-1">
                  {getVehicleIcon(vehicle.id)}
                </Text>
                <Text className={`text-sm font-medium text-center ${
                  selectedVehicle === vehicle.id ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {vehicle.name}
                </Text>
                <Text className="text-xs text-gray-500 text-center">
                  {vehicle.capacity}
                </Text>
                <Text className={`text-sm font-semibold text-center mt-1 ${
                  selectedVehicle === vehicle.id ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  R{Math.round(fareCalculation ? fareCalculation.baseRate : 0).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Add-On Services */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Additional Services</Text>
        
        {/* Stairs */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="trending-up" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Stairs</Text>
              <Text className="text-sm text-gray-500">R150 per flight</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Switch
              value={addOns.stairs}
              onValueChange={(value) => updateAddOn('stairs', value)}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
            {addOns.stairs && (
              <View className="flex-row items-center ml-3">
                <TouchableOpacity
                  onPress={() => decrementCounter('stairsCount')}
                  className="w-8 h-8 bg-gray-200 rounded-full justify-center items-center"
                >
                  <Ionicons name="remove" size={16} color="#374151" />
                </TouchableOpacity>
                <Text className="mx-3 text-lg font-semibold text-gray-800">
                  {addOns.stairsCount}
                </Text>
                <TouchableOpacity
                  onPress={() => incrementCounter('stairsCount')}
                  className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center"
                >
                  <Ionicons name="add" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Loading Helpers */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="people" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Loading Helpers</Text>
              <Text className="text-sm text-gray-500">R350 per person</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Switch
              value={addOns.helpers}
              onValueChange={(value) => updateAddOn('helpers', value)}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
            {addOns.helpers && (
              <View className="flex-row items-center ml-3">
                <TouchableOpacity
                  onPress={() => decrementCounter('helpersCount')}
                  className="w-8 h-8 bg-gray-200 rounded-full justify-center items-center"
                >
                  <Ionicons name="remove" size={16} color="#374151" />
                </TouchableOpacity>
                <Text className="mx-3 text-lg font-semibold text-gray-800">
                  {addOns.helpersCount}
                </Text>
                <TouchableOpacity
                  onPress={() => incrementCounter('helpersCount')}
                  className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center"
                >
                  <Ionicons name="add" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Packing Materials */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="cube" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Packing Materials</Text>
              <Text className="text-sm text-gray-500">R200 (10 boxes + wrap)</Text>
            </View>
          </View>
          <Switch
            value={addOns.packing}
            onValueChange={(value) => updateAddOn('packing', value)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Cleaning Service */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="sparkles" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Cleaning Service</Text>
              <Text className="text-sm text-gray-500">R500 professional cleaning</Text>
            </View>
          </View>
          <Switch
            value={addOns.cleaning}
            onValueChange={(value) => updateAddOn('cleaning', value)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Insurance */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="shield-checkmark" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Insurance Coverage</Text>
              <Text className="text-sm text-gray-500">1.5% of declared value</Text>
            </View>
          </View>
          <Switch
            value={addOns.insurance}
            onValueChange={(value) => updateAddOn('insurance', value)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Express Service */}
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="flash" size={20} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-medium text-gray-800">Express Delivery</Text>
              <Text className="text-sm text-gray-500">R450 priority service</Text>
            </View>
          </View>
          <Switch
            value={addOns.express}
            onValueChange={(value) => updateAddOn('express', value)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Route Estimates */}
      {routeEstimate && (
        <View className="bg-white mt-2 p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Route Estimate</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Ionicons name="time" size={20} color="#64748b" />
              <Text className="text-sm text-gray-500 mt-1">Duration</Text>
              <Text className="font-semibold text-gray-800">
                {Math.round(routeEstimate.estimatedDuration)} min
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Ionicons name="car" size={20} color="#64748b" />
              <Text className="text-sm text-gray-500 mt-1">Fuel Cost</Text>
              <Text className="font-semibold text-gray-800">
                R{Math.round(routeEstimate.estimatedFuelCost)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Ionicons name="leaf" size={20} color="#10b981" />
              <Text className="text-sm text-gray-500 mt-1">CO₂</Text>
              <Text className="font-semibold text-gray-800">
                {routeEstimate.carbonFootprint.toFixed(1)} kg
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Fare Breakdown */}
      <View className="bg-white mt-2 p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Fare Breakdown</Text>
        {fareCalculation.breakdown.map((item, index) => (
          <View key={index} className="flex-row justify-between py-2">
            <Text className={`text-sm ${
              item.type === 'commission' ? 'text-gray-500' : 'text-gray-800'
            }`}>
              {item.description}
            </Text>
            <Text className={`text-sm font-medium ${
              item.type === 'commission' ? 'text-gray-500' : 'text-gray-800'
            }`}>
              {item.type === 'commission' ? '-' : ''}R{Math.round(item.amount).toLocaleString()}
            </Text>
          </View>
        ))}
        <View className="border-t border-gray-200 pt-3 mt-2">
          <View className="flex-row justify-between">
            <Text className="text-lg font-semibold text-gray-800">Total</Text>
            <Text className="text-lg font-bold text-blue-600">
              R{Math.round(fareCalculation.total).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Earnings Info */}
      <View className="bg-blue-50 mt-2 p-4 mb-6">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="text-sm font-medium text-blue-800 ml-2">Driver Earnings</Text>
        </View>
        <Text className="text-sm text-blue-700">
          Driver receives R{Math.round(fareCalculation.driverEarnings).toLocaleString()} 
          ({(100 - (fareCalculation.platformCommission / fareCalculation.total * 100)).toFixed(1)}% of total)
        </Text>
      </View>
    </ScrollView>
  );
}

function getVehicleIcon(vehicleId: string): string {
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
}
