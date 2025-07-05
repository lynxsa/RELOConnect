import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import driver screens
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';
import OrdersScreen from './src/screens/driver/OrdersScreen';
import EarningsScreen from './src/screens/driver/EarningsScreen';
import DriverProfileScreen from './src/screens/driver/DriverProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'speedometer' : 'speedometer-outline';
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
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
