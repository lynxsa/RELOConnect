import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import AppNavigator from '../../src/navigation/AppNavigator';

export default function TabLayout() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
