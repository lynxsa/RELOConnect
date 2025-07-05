import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/home/HomeScreen';
import BookingScreen from './src/screens/booking/BookingScreen';
import TrackingScreen from './src/screens/tracking/TrackingScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';

// Import ReloAI components
import FloatingReloAIButton from './src/components/FloatingReloAIButton';

// Import types
import { RootTabParamList, UserRole } from './src/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  // User role state - in production this would come from authentication
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isDriverMode, setIsDriverMode] = useState(false);

  // Function to switch between user and driver modes
  const toggleDriverMode = () => {
    setIsDriverMode(!isDriverMode);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (isDriverMode) {
                // Driver mode icons
                if (route.name === 'Home') {
                  iconName = focused ? 'speedometer' : 'speedometer-outline';
                } else if (route.name === 'Book') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Track') {
                  iconName = focused ? 'wallet' : 'wallet-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else {
                  iconName = 'speedometer-outline';
                }
              } else {
                // User mode icons
                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Book') {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                } else if (route.name === 'Track') {
                  iconName = focused ? 'location' : 'location-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else {
                  iconName = 'home-outline';
                }
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
            name="Home" 
            component={isDriverMode ? DriverDashboardScreen : HomeScreen}
            options={{ 
              title: isDriverMode ? 'Driver Dashboard' : 'RELOConnect'
            }}
          />
          <Tab.Screen 
            name="Book" 
            component={BookingScreen}
            options={{ 
              title: isDriverMode ? 'Available Jobs' : 'Book Move'
            }}
          />
          <Tab.Screen 
            name="Track" 
            component={TrackingScreen}
            options={{ 
              title: isDriverMode ? 'Earnings' : 'Track Order'
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
            initialParams={{ 
              userRole, 
              isDriverMode, 
              toggleDriverMode 
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      
      {/* Global ReloAI Assistant */}
      <FloatingReloAIButton />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
