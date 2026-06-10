import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors, fontSize, fontFamily } from '../theme';
import type { FontSize } from '../theme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TypographyProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
  numberOfLines?: number;
  testID?: string;
}

const variantStyles: Record<Variant, TextStyle> = {
  h1: { fontSize: fontSize.xxxl, fontFamily: fontFamily.bold, lineHeight: fontSize.xxxl * 1.2 },
  h2: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, lineHeight: fontSize.xxl * 1.2 },
  h3: { fontSize: fontSize.xl, fontFamily: fontFamily.medium, lineHeight: fontSize.xl * 1.3 },
  body: { fontSize: fontSize.md, fontFamily: fontFamily.regular, lineHeight: fontSize.md * 1.5 },
  bodySmall: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, lineHeight: fontSize.sm * 1.5 },
  caption: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, lineHeight: fontSize.xs * 1.5 },
  label: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, lineHeight: fontSize.sm * 1.4 },
};

export function Typography({
  children,
  variant = 'body',
  color = colors.text,
  align,
  style,
  numberOfLines,
  testID,
}: TypographyProps) {
  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={[variantStyles[variant], { color }, align ? { textAlign: align } : null, style]}
    >
      {children}
    </Text>
  );
}
