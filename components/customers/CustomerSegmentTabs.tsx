import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Users, Award, Repeat, AlertTriangle, UserPlus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { CustomerSegment, CustomerMetrics } from '@/types';

interface CustomerSegmentTabsProps {
  selectedSegment: CustomerSegment;
  onSelectSegment: (segment: CustomerSegment) => void;
  metrics: CustomerMetrics;
}

export default function CustomerSegmentTabs({ 
  selectedSegment, 
  onSelectSegment,
  metrics,
}: CustomerSegmentTabsProps) {
  const tabs: Array<{
    id: CustomerSegment;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  }> = [
    {
      id: 'all',
      label: 'All',
      icon: <Users size={16} color={selectedSegment === 'all' ? colors.white : colors.gray[600]} />,
      count: metrics.totalCustomers,
      color: colors.primary,
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: <Award size={16} color={selectedSegment === 'vip' ? colors.white : colors.gray[600]} />,
      count: metrics.segmentCounts.vip,
      color: colors.secondary,
    },
    {
      id: 'recurring',
      label: 'Recurring',
      icon: <Repeat size={16} color={selectedSegment === 'recurring' ? colors.white : colors.gray[600]} />,
      count: metrics.segmentCounts.recurring,
      color: colors.primaryLight,
    },
    {
      id: 'at_risk',
      label: 'At Risk',
      icon: <AlertTriangle size={16} color={selectedSegment === 'at_risk' ? colors.white : colors.gray[600]} />,
      count: metrics.segmentCounts.atRisk,
      color: colors.danger,
    },
    {
      id: 'new',
      label: 'New',
      icon: <UserPlus size={16} color={selectedSegment === 'new' ? colors.white : colors.gray[600]} />,
      count: metrics.segmentCounts.new,
      color: colors.warningLight,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedSegment === tab.id && { backgroundColor: tab.color },
            ]}
            onPress={() => onSelectSegment(tab.id)}
            activeOpacity={0.7}
          >
            {tab.icon}
            <Text
              style={[
                styles.tabLabel,
                selectedSegment === tab.id && styles.selectedTabLabel,
              ]}
            >
              {tab.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                selectedSegment === tab.id && { backgroundColor: colors.white },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  selectedSegment === tab.id && { color: tab.color },
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  selectedTabLabel: {
    color: colors.white,
  },
  countBadge: {
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
});