import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

// Import screens - using the comprehensive ones we built
import ModernHomeScreen from './src/screens/ModernHomeScreen';
import ModernBookingScreen from './src/screens/ModernBookingScreen';
import ModernTrackingScreen from './src/screens/ModernTrackingScreen';
import ChatListScreenWrapper from './src/screens/chat/ChatListScreenWrapper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Main Tab Navigator with comprehensive features
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Booking') {
            iconName = 'truck';
          } else if (route.name === 'Tracking') {
            iconName = 'map-pin';
          } else if (route.name === 'Chat') {
            iconName = 'message-circle';
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
        component={ModernHomeScreen}
        options={{ 
          tabBarLabel: 'Home',
          headerTitle: 'RELOConnect'
        }} 
      />
      <Tab.Screen 
        name="Booking" 
        component={ModernBookingScreen}
        options={{ 
          tabBarLabel: 'Book Move',
          headerTitle: 'Book Your Move'
        }} 
      />
      <Tab.Screen 
        name="Tracking" 
        component={ModernTrackingScreen}
        options={{ 
          tabBarLabel: 'Track',
          headerTitle: 'Track Order'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatListScreenWrapper}
        options={{ 
          tabBarLabel: 'Messages',
          headerTitle: 'Messages'
        }} 
      />
    </Tab.Navigator>
  );
}

// Main App Stack Navigator
function AppStack() {
  return (
    <Stack.Navigator 
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <AppStack />
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
