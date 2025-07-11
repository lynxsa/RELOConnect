import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import EnhancedHomeScreen from './src/screens/EnhancedHomeScreen';
import BookingScreen from './src/screens/booking/BookingScreen';
import TrackingScreen from './src/screens/tracking/TrackingScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Booking':
              iconName = 'plus-circle';
              break;
            case 'Tracking':
              iconName = 'map-pin';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'home';
          }

          return <Feather name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0057FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={EnhancedHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ tabBarLabel: 'Book Now' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen}
        options={{ tabBarLabel: 'Track' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  // For now, we'll skip auth and go directly to main app
  // In production, you'd check authentication state here
  const isAuthenticated = true;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <Stack.Screen name="MainTabs" component={MainTabs} />
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
