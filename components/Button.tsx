import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  rightIcon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const getButtonStyles = () => {
    let buttonStyle = {};
    let textStyle = {};

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: disabled ? colors.gray[300] : colors.primary,
        };
        textStyle = { color: colors.white };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: disabled ? colors.gray[300] : colors.secondary,
        };
        textStyle = { color: colors.white };
        break;
      case 'success':
        buttonStyle = {
          backgroundColor: disabled ? colors.gray[300] : colors.success,
        };
        textStyle = { color: colors.white };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.gray[300] : colors.primary,
        };
        textStyle = { color: disabled ? colors.gray[400] : colors.primary };
        break;
      case 'danger':
        buttonStyle = {
          backgroundColor: disabled ? colors.gray[300] : colors.danger,
        };
        textStyle = { color: colors.white };
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
        };
        textStyle = { color: disabled ? colors.gray[400] : colors.primary };
        break;
    }

    // Size styles
    switch (size) {
      case 'xs':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 4,
          paddingHorizontal: 8,
        };
        textStyle = { ...textStyle, fontSize: 12 };
        break;
      case 'sm':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 6,
          paddingHorizontal: 12,
        };
        textStyle = { ...textStyle, fontSize: 14 };
        break;
      case 'md':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 10,
          paddingHorizontal: 16,
        };
        textStyle = { ...textStyle, fontSize: 16 };
        break;
      case 'lg':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 14,
          paddingHorizontal: 20,
        };
        textStyle = { ...textStyle, fontSize: 18 };
        break;
    }

    // Width style
    if (fullWidth) {
      buttonStyle = {
        ...buttonStyle,
        width: '100%',
        alignItems: 'center',
      };
    }

    return { buttonStyle, textStyle };
  };

  const { buttonStyle, textStyle } = getButtonStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        disabled || loading ? styles.disabled : {},
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '600',
  },
});