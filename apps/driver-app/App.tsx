import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import driver screens
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';
import LiveTrackingScreen from './src/screens/driver/LiveTrackingScreen';
import OrdersScreen from './src/screens/driver/OrdersScreen';
import EarningsScreen from './src/screens/driver/EarningsScreen';
import DriverProfileScreen from './src/screens/driver/DriverProfileScreen';

// Import services
import { socketService } from './src/services/socketService';
import { driverAPI } from './src/services/driverAPI';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Tracking') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'speedometer-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0057FF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#0057FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DriverDashboardScreen}
        options={{ title: 'Driver Dashboard' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={LiveTrackingScreen}
        options={{ title: 'Live Tracking' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={DriverProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check if driver is authenticated
      const token = await AsyncStorage.getItem('authToken');
      const driverData = await AsyncStorage.getItem('driverData');
      
      if (token && driverData) {
        // Initialize driver services
        await initializeDriverServices();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Initialization Error', 'Could not initialize RELOConnect Driver app. Please restart the app.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDriverServices = async () => {
    try {
      // Initialize socket connection
      await socketService.connect();
      
      // Update driver status to online
      await driverAPI.updateDriverStatus(true, true);
      
      console.log('Driver services initialized successfully');
    } catch (error) {
      console.error('Driver services initialization error:', error);
      // Don't show alert here as it might be called during app startup
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Starting RELOConnect Driver...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#0057FF',
    fontWeight: '600',
  },
});
