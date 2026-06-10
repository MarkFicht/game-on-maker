import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading indicator', () => {
    const { getByTestId } = render(<LoadingScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders with default testID', () => {
    const { getByTestId } = render(<LoadingScreen />);
    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('renders message when provided', () => {
    const { getByText } = render(<LoadingScreen message="Ładowanie..." />);
    expect(getByText('Ładowanie...')).toBeTruthy();
  });

  it('does not render message when not provided', () => {
    const { queryByText } = render(<LoadingScreen />);
    expect(queryByText('Ładowanie...')).toBeNull();
  });

  it('applies custom testID', () => {
    const { getByTestId } = render(<LoadingScreen testID="my-loader" />);
    expect(getByTestId('my-loader')).toBeTruthy();
  });
});
