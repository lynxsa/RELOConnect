import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Types
import { 
  AuthStackParamList, 
  MainTabParamList, 
  BookingStackParamList 
} from '../types/navigation';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import EnhancedHomeScreen from '../screens/EnhancedHomeScreen';
import EnhancedHomeMapScreen from '../screens/EnhancedHomeMapScreen';
import PropertySelectionScreen from '../screens/PropertySelectionScreen';
import VehicleSelectionScreen from '../screens/VehicleSelectionScreen';
import ItemsInventoryScreen from '../screens/ItemsInventoryScreen';
import TrackingScreen from '../screens/tracking/TrackingScreen';
import RealTimeTrackingScreen from '../screens/tracking/RealTimeTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const RootStack = createNativeStackNavigator();

// Booking Stack Navigator
function BookingNavigator() {
  return (
    <BookingStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <BookingStack.Screen name="EnhancedHome" component={EnhancedHomeScreen} />
      <BookingStack.Screen name="EnhancedHomeMap" component={EnhancedHomeMapScreen} />
      <BookingStack.Screen name="PropertySelection" component={PropertySelectionScreen} />
      <BookingStack.Screen name="ItemsInventory" component={ItemsInventoryScreen} />
      <BookingStack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
    </BookingStack.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
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
              iconName = 'circle';
          }

          return (
            <Feather 
              name={iconName as any} 
              size={size} 
              color={color} 
            />
          );
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
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Booking" 
        component={BookingNavigator}
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

// Main Navigation Component
export default function AppNavigator() {
  // For development, let's start with authenticated state
  // This will be replaced with proper authentication later
  const isAuthenticated = true;

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {isAuthenticated ? (
          <>
            <RootStack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            <RootStack.Screen 
              name="Notifications" 
              component={NotificationScreen} 
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          <RootStack.Screen 
            name="Auth" 
            component={AuthStack} 
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
