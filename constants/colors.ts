export const colors = {
  // Enterprise color palette
  primary: '#1E88E5', // Deep blue
  primaryLight: '#64B5F6',
  primaryDark: '#1565C0',
  secondary: '#14B8A6', // Teal
  secondaryLight: '#5EEAD4',
  secondaryDark: '#0F766E',
  tertiary: '#1E293B', // Slate
  tertiaryLight: '#334155',
  tertiaryDark: '#0F172A',
  
  // QuickBooks color
  quickbooks: '#2CA01C', // QuickBooks green
  
  // Functional colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  danger: '#EF4444', // Red
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  info: '#3B82F6', // Blue
  
  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  
  // Additional color palettes
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    300: '#FCA5A5',
    500: '#EF4444',
    700: '#B91C1C',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    300: '#FDBA74',
    500: '#F97316',
    700: '#C2410C',
  },
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    300: '#FDE047',
    500: '#EAB308',
    700: '#A16207',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    300: '#86EFAC',
    500: '#22C55E',
    700: '#15803D',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    300: '#93C5FD',
    500: '#3B82F6',
    700: '#1D4ED8',
  },
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    300: '#C4B5FD',
    500: '#8B5CF6',
    700: '#6D28D9',
  },
  
  // Theme colors
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1E293B',
    border: '#E5E7EB',
  },
  dark: {
    background: '#1F2937',
    card: '#111827',
    text: '#F9FAFB',
    border: '#374151',
  },
  
  // Add these properties to fix errors
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1E293B',
  border: '#E5E7EB',
};

// Simplified color exports without dark/light themes
export default {
  text: colors.light.text,
  background: colors.light.background,
  tint: colors.primary,
  tabIconDefault: colors.gray[400],
  tabIconSelected: colors.primary,
  card: colors.light.card,
  border: colors.light.border,
};