import React from 'react';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import AppNavigator from '../../src/navigation/AppNavigator';

export default function AppIndex() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
