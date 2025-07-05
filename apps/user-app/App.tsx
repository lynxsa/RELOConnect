import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// Context providers
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProvider } from './src/contexts/UserContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
