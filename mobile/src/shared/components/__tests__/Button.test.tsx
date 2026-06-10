import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders label', () => {
    const { getByText } = render(<Button label="Zagraj" onPress={() => {}} />);
    expect(getByText('Zagraj')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Zagraj" onPress={onPress} />);
    fireEvent.press(getByText('Zagraj'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Zagraj" onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator and no label when loading', () => {
    const { queryByText, getByTestId } = render(
      <Button label="Zagraj" onPress={() => {}} loading />
    );
    expect(queryByText('Zagraj')).toBeNull();
    expect(getByTestId('button-loading-indicator')).toBeTruthy();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Zagraj" onPress={onPress} loading />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies testID', () => {
    const { getByTestId } = render(
      <Button label="Start" onPress={() => {}} testID="start-btn" />
    );
    expect(getByTestId('start-btn')).toBeTruthy();
  });
});
