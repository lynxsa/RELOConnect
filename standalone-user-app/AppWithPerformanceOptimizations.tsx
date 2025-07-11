import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/booking/BookingScreen';
import TrackingScreen from './src/screens/tracking/TrackingScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Performance optimized loading component
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc' 
  }}>
    <ActivityIndicator size="large" color="#0057FF" />
    <Text style={{ 
      marginTop: 16, 
      fontSize: 16, 
      color: '#64748b',
      fontWeight: '500'
    }}>
      Loading...
    </Text>
  </View>
);

// Main Tab Navigator with performance optimizations
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
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        lazy: true, // Enable lazy loading for tabs
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Home',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ 
          title: 'Book Move',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen}
        options={{ 
          title: 'Track Order',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarBadge: undefined,
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator with performance optimizations
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen}
      />
    </Stack.Navigator>
  );
}

// Main App Component with performance optimizations
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // Add your authentication logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAuthenticated(false); // Set to true if authenticated
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isAuthenticated ? <MainTabs /> : <AuthStack />}
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
