import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface CustomerActionBarProps {
  onAddCustomer: () => void;
}

export default function CustomerActionBar({
  onAddCustomer,
}: CustomerActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={onAddCustomer}
        activeOpacity={0.8}
      >
        <Plus size={18} color={colors.white} />
        <Text style={styles.primaryButtonText}>Add Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});