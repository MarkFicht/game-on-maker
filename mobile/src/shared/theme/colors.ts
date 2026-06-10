export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',

  secondary: '#10B981',
  secondaryDark: '#059669',

  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#475569',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export type Color = keyof typeof colors;
