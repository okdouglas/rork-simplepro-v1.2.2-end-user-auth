import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Users, Repeat, DollarSign, TrendingUp } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { CustomerMetrics } from '@/types';
import MetricCard from '@/components/MetricCard';

interface CustomerMetricsSectionProps {
  metrics: CustomerMetrics;
}

export default function CustomerMetricsSection({ metrics }: CustomerMetricsSectionProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MetricCard
          title="Active Customers"
          mainValue={metrics.activeCustomers}
          secondaryValue={`${metrics.growthRate}% growth`}
          icon={<Users size={20} color={colors.white} />}
          color={colors.primary}
          trend="up"
          trendValue={`+${metrics.segmentCounts.new} new`}
          subtitle="Total customers in database"
          onPress={() => {}}
        />
        
        <MetricCard
          title="Lifetime Value"
          mainValue={`$${metrics.averageLifetimeValue}`}
          secondaryValue="per customer"
          icon={<DollarSign size={20} color={colors.white} />}
          color={colors.secondary}
          trend="up"
          trendValue="12% increase"
          subtitle="Average revenue per customer"
          onPress={() => {}}
        />
        
        <MetricCard
          title="Repeat Rate"
          mainValue={`${metrics.repeatCustomerRate}%`}
          secondaryValue={`${metrics.segmentCounts.recurring} recurring`}
          icon={<Repeat size={20} color={colors.white} />}
          color={colors.primaryLight}
          trend="stable"
          trendValue="Consistent"
          subtitle="Customers with multiple jobs"
          onPress={() => {}}
        />
        
        <MetricCard
          title="Acquisition Cost"
          mainValue={`$${metrics.acquisitionCost}`}
          secondaryValue="per new customer"
          icon={<TrendingUp size={20} color={colors.white} />}
          color={colors.warningLight}
          trend="down"
          trendValue="5% decrease"
          subtitle="Cost to acquire new customers"
          onPress={() => {}}
        />
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
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
});