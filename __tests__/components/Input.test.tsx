import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../../src/components/ui/Input';

// Mock theme context
jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#f8f9fa',
      text: '#000000',
      textSecondary: '#6b7280',
      primary: '#0057ff',
      error: '#ef4444',
      border: '#e5e7eb',
    },
  }),
}));

describe('Input Component', () => {
  it('renders correctly with label and placeholder', () => {
    const { getByText, getByPlaceholderText } = render(
      <Input
        label="Email"
        placeholder="Enter your email"
        value=""
        onChangeText={() => {}}
      />
    );
    
    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={mockOnChangeText}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'test input');
    expect(mockOnChangeText).toHaveBeenCalledWith('test input');
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={() => {}}
        error="This field is required"
      />
    );
    
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={() => {}}
        disabled={true}
      />
    );
    
    const input = getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });

  it('renders with secure text entry for passwords', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter password"
        value=""
        onChangeText={() => {}}
        secureTextEntry={true}
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('renders with multiline support', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter description"
        value=""
        onChangeText={() => {}}
        multiline={true}
        numberOfLines={4}
      />
    );
    
    const input = getByPlaceholderText('Enter description');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it('renders left and right icons', () => {
    const leftIcon = <></>;
    const rightIcon = <></>;
    
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={() => {}}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      />
    );
    
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
    // Icons would need testIDs for proper testing
  });

  it('handles focus and blur events', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={() => {}}
      />
    );
    
    const input = getByPlaceholderText('Enter text');
    
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    
    // Test would verify border color changes on focus/blur
    expect(input).toBeTruthy();
  });

  it('respects maxLength prop', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter text"
        value=""
        onChangeText={() => {}}
        maxLength={10}
      />
    );
    
    const input = getByPlaceholderText('Enter text');
    expect(input.props.maxLength).toBe(10);
  });
});
