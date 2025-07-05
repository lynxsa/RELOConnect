import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

const Tab = createBottomTabNavigator();

export default function App() {
  // State for role switching
  const [isDriverMode, setIsDriverMode] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (isDriverMode) {
                // Driver mode icons
                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'speedometer' : 'speedometer-outline';
                    break;
                  case 'Book':
                    iconName = focused ? 'list' : 'list-outline';
                    break;
                  case 'Track':
                    iconName = focused ? 'wallet' : 'wallet-outline';
                    break;
                  case 'Profile':
                    iconName = focused ? 'person' : 'person-outline';
                    break;
                  default:
                    iconName = 'speedometer-outline';
                }
              } else {
                // User mode icons
                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Book':
                    iconName = focused ? 'add-circle' : 'add-circle-outline';
                    break;
                  case 'Track':
                    iconName = focused ? 'location' : 'location-outline';
                    break;
                  case 'Profile':
                    iconName = focused ? 'person' : 'person-outline';
                    break;
                  default:
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
          />
        </Tab.Navigator>
      </NavigationContainer>
      
      {/* Global ReloAI Assistant */}
      <FloatingReloAIButton />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
