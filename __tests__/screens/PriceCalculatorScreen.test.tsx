import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PriceCalculatorScreen from '../../src/screens/booking/PriceCalculatorScreen';

// Mock theme context
jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#000000',
      textSecondary: '#6b7280',
      primary: '#0057ff',
      error: '#ef4444',
      border: '#e5e7eb',
      gradient: {
        primary: ['#0057ff', '#00b2ff'],
      },
    },
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('PriceCalculatorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<PriceCalculatorScreen />);
    
    expect(getByText('Price Calculator')).toBeTruthy();
    expect(getByText('Get an instant quote for your move')).toBeTruthy();
    expect(getByPlaceholderText('Enter pickup address')).toBeTruthy();
    expect(getByPlaceholderText('Enter delivery address')).toBeTruthy();
  });

  it('calculates price when all fields are filled', async () => {
    const { getByPlaceholderText, getByText } = render(<PriceCalculatorScreen />);
    
    // Fill in addresses
    fireEvent.changeText(getByPlaceholderText('Enter pickup address'), '123 Main St, Johannesburg');
    fireEvent.changeText(getByPlaceholderText('Enter delivery address'), '456 Oak Ave, Cape Town');
    
    // Select vehicle type
    fireEvent.press(getByText('Small Van'));
    
    // Calculate price
    fireEvent.press(getByText('Calculate Price'));
    
    await waitFor(() => {
      expect(getByText(/Total Estimate:/)).toBeTruthy();
    });
  });

  it('shows vehicle options', () => {
    const { getByText } = render(<PriceCalculatorScreen />);
    
    expect(getByText('Small Van')).toBeTruthy();
    expect(getByText('Medium Truck')).toBeTruthy();
    expect(getByText('Large Truck')).toBeTruthy();
  });

  it('toggles extra services', () => {
    const { getByText } = render(<PriceCalculatorScreen />);
    
    fireEvent.press(getByText('Packing Service'));
    fireEvent.press(getByText('Cleaning Service'));
    
    // Test that services are selected (would need visual indicators)
    expect(getByText('Packing Service')).toBeTruthy();
    expect(getByText('Cleaning Service')).toBeTruthy();
  });

  it('navigates to booking when Continue is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(<PriceCalculatorScreen />);
    
    // Fill minimum required fields
    fireEvent.changeText(getByPlaceholderText('Enter pickup address'), '123 Main St, Johannesburg');
    fireEvent.changeText(getByPlaceholderText('Enter delivery address'), '456 Oak Ave, Cape Town');
    fireEvent.press(getByText('Small Van'));
    fireEvent.press(getByText('Calculate Price'));
    
    await waitFor(() => {
      expect(getByText('Continue to Booking')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Continue to Booking'));
    
    expect(mockNavigate).toHaveBeenCalledWith('BookingSummary', expect.any(Object));
  });
});
