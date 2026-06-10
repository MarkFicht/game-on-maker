import React from 'react';
import { render } from '@testing-library/react-native';
import { Typography } from '../Typography';

describe('Typography', () => {
  it('renders text content', () => {
    const { getByText } = render(<Typography>Hello</Typography>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders all variants without crashing', () => {
    const variants = ['h1', 'h2', 'h3', 'body', 'bodySmall', 'caption', 'label'] as const;
    for (const variant of variants) {
      const { getByText } = render(<Typography variant={variant}>{variant}</Typography>);
      expect(getByText(variant)).toBeTruthy();
    }
  });

  it('applies custom color', () => {
    const { getByText } = render(
      <Typography color="#FF0000">Red text</Typography>
    );
    const el = getByText('Red text');
    expect(el.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FF0000' })])
    );
  });

  it('applies testID', () => {
    const { getByTestId } = render(
      <Typography testID="title-text">Title</Typography>
    );
    expect(getByTestId('title-text')).toBeTruthy();
  });

  it('passes numberOfLines', () => {
    const { getByTestId } = render(
      <Typography testID="truncated" numberOfLines={2}>Long text</Typography>
    );
    expect(getByTestId('truncated').props.numberOfLines).toBe(2);
  });
});
