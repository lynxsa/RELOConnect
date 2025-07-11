import React, { useState, useEffect, memo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';

// Import screens (memoized for performance)
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
      gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Memoized Loading component
const LoadingScreen = memo(() => (
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
));

// Memoized screen wrapper for performance
const MemoizedScreen = memo(({ component: Component, ...props }: any) => (
  <Component {...props} />
));

// Main Tab Navigator with performance optimizations
const MainTabs = memo(() => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: any) => {
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
        component={(props: any) => <MemoizedScreen component={HomeScreen} {...props} />}
        options={{ 
          title: 'Home',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Booking" 
        component={(props: any) => <MemoizedScreen component={BookingScreen} {...props} />}
        options={{ 
          title: 'Book Move',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={(props: any) => <MemoizedScreen component={TrackingScreen} {...props} />}
        options={{ 
          title: 'Track Order',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={(props: any) => <MemoizedScreen component={ProfileScreen} {...props} />}
        options={{ 
          title: 'Profile',
          tabBarBadge: undefined,
        }}
      />
    </Tab.Navigator>
  );
});

// Auth Stack Navigator with performance optimizations
const AuthStack = memo(() => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current }: any) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={(props: any) => <MemoizedScreen component={LoginScreen} {...props} />}
      />
      <Stack.Screen 
        name="Register" 
        component={(props: any) => <MemoizedScreen component={RegisterScreen} {...props} />}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={(props: any) => <MemoizedScreen component={OTPVerificationScreen} {...props} />}
      />
    </Stack.Navigator>
  );
});

// Main App Component with performance optimizations
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
