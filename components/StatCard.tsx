import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.container, theme.shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
});