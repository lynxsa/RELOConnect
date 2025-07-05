/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Simple test component for verification
const TestComponent = () => <div>Test</div>;

describe('Test Setup Verification', () => {
  it('should render test component', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4);
  });
});
