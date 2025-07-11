import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import RELOCareScreen from '../screens/donations/RELOCareScreen';
import RELONewsScreen from '../screens/news/RELONewsScreen';
import RELOPortsScreen from '../screens/ports/RELOPortsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Booking screens
import ServiceExtrasScreen from '../screens/booking/ServiceExtrasScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import OrderTrackingScreen from '../screens/tracking/OrderTrackingScreen';
import PriceCalculatorScreen from '../screens/booking/PriceCalculatorScreen';

// Types
import { RootStackParamList, MainTabParamList } from '../types';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'RELOCare':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'RELONews':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'RELOPorts':
              iconName = focused ? 'boat' : 'boat-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'RELOConnect' }}
      />
      <MainTab.Screen 
        name="RELOCare" 
        component={RELOCareScreen}
        options={{ title: 'RELOCare' }}
      />
      <MainTab.Screen 
        name="RELONews" 
        component={RELONewsScreen}
        options={{ title: 'RELONews' }}
      />
      <MainTab.Screen 
        name="RELOPorts" 
        component={RELOPortsScreen}
        options={{ title: 'RELOPorts' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState(false);

  React.useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
        {isLoading ? (
          <RootStack.Screen name="Splash" component={SplashScreen} />
        ) : !hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="ServiceExtras" 
              component={ServiceExtrasScreen}
              options={{ 
                headerShown: true,
                title: 'Service Extras',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
              }}
            />
            <RootStack.Screen 
              name="BookingSummary" 
              component={BookingSummaryScreen}
              options={{ 
                headerShown: true,
                title: 'Booking Summary',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
              }}
            />
            <RootStack.Screen 
              name="PaymentScreen" 
              component={PaymentScreen}
              options={{ 
                headerShown: true,
                title: 'Payment',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
              }}
            />
            <RootStack.Screen 
              name="BookingConfirmation" 
              component={BookingConfirmationScreen}
              options={{ 
                headerShown: true,
                title: 'Booking Confirmed',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerLeft: () => null,
              }}
            />
            <RootStack.Screen 
              name="OrderTracking" 
              component={OrderTrackingScreen}
              options={{ 
                headerShown: false,
              }}
            />
            <RootStack.Screen 
              name="PriceCalculator" 
              component={PriceCalculatorScreen}
              options={{ 
                headerShown: true,
                title: 'Price Calculator',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
              }}
            />
          </>
        )}
      </RootStack.Navigator>
  );
}
