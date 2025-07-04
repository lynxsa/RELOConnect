import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/ui/Button';

// Mock theme context
jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0057ff',
      text: '#000000',
      textSecondary: '#6b7280',
      gradient: {
        primary: ['#0057ff', '#00b2ff'],
      },
    },
  }),
}));

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} loading={true} />
    );
    
    // ActivityIndicator should be rendered when loading
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );
    
    const button = getByText('Test Button').parent;
    expect(button?.props.accessibilityState?.disabled).toBe(true);
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} style={customStyle} />
    );
    
    const button = getByText('Test Button').parent;
    expect(button?.props.style).toEqual(expect.arrayContaining([
      expect.objectContaining(customStyle)
    ]));
  });

  it('renders with different sizes', () => {
    const { getByText: getByTextSmall } = render(
      <Button title="Small Button" onPress={() => {}} size="small" />
    );
    
    const { getByText: getByTextLarge } = render(
      <Button title="Large Button" onPress={() => {}} size="large" />
    );
    
    expect(getByTextSmall('Small Button')).toBeTruthy();
    expect(getByTextLarge('Large Button')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { getByText: getByTextPrimary } = render(
      <Button title="Primary Button" onPress={() => {}} variant="primary" />
    );
    
    const { getByText: getByTextSecondary } = render(
      <Button title="Secondary Button" onPress={() => {}} variant="secondary" />
    );
    
    expect(getByTextPrimary('Primary Button')).toBeTruthy();
    expect(getByTextSecondary('Secondary Button')).toBeTruthy();
  });
});
