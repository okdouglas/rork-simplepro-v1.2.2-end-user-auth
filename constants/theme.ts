import { colors } from './colors';

export const theme = {
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    xs: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  fonts: {
    heading: {
      fontWeight: '700',
      color: colors.tertiary,
    },
    subheading: {
      fontWeight: '600',
      color: colors.tertiary,
    },
    body: {
      fontWeight: '400',
      color: colors.text,
    },
  },
  // Enterprise-specific styles
  enterprise: {
    card: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.gray[200],
      backgroundColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    header: {
      height: 64,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    button: {
      primary: {
        backgroundColor: colors.primary,
        color: colors.white,
      },
      secondary: {
        backgroundColor: colors.secondary,
        color: colors.white,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
        color: colors.primary,
      },
    },
  }
};