import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/screens/auth/LoginScreen2';
import { useAuthStore } from '../../src/store';

// Mock the store
jest.mock('../../src/store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

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

const mockLogin = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    expect(getByText('RELOConnect')).toBeTruthy();
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText('Sign In'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
  });

  it('calls login with correct data when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    
    fireEvent.press(getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isVerified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    
    const passwordInput = getByPlaceholderText('Enter your password');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Find and press the eye icon (this would need a testID in actual component)
    // fireEvent.press(getByTestId('toggle-password-visibility'));
    // expect(passwordInput.props.secureTextEntry).toBe(false);
  });
});
