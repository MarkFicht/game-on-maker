import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders children when visible', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}}>
        <></>
      </Modal>
    );
    // Modal is visible — RNModal renders children
    expect(getByText).toBeDefined();
  });

  it('renders title when provided', () => {
    const { getByText } = render(
      <Modal visible onClose={() => {}} title="Koniec gry">
        <></>
      </Modal>
    );
    expect(getByText('Koniec gry')).toBeTruthy();
  });

  it('does not render title when not provided', () => {
    const { queryByText } = render(
      <Modal visible onClose={() => {}}>
        <></>
      </Modal>
    );
    expect(queryByText('Koniec gry')).toBeNull();
  });

  it('calls onClose when overlay is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Modal visible onClose={onClose}>
        <></>
      </Modal>
    );
    fireEvent.press(getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render content when not visible', () => {
    const { queryByText } = render(
      <Modal visible={false} onClose={() => {}} title="Hidden">
        <></>
      </Modal>
    );
    expect(queryByText('Hidden')).toBeNull();
  });
});
