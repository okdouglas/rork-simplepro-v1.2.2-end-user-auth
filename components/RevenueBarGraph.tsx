import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueBarGraphProps {
  data: FinancialData;
  maxValue?: number;
}

export default function RevenueBarGraph({ data, maxValue }: RevenueBarGraphProps) {
  // Calculate margin percentage
  const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
  
  // Determine the maximum value for scaling the bars
  const calculatedMaxValue = maxValue || Math.max(data.revenue, data.expenses, data.profit);
  
  // Calculate the width percentage for each bar
  const getBarWidth = (value: number) => {
    return `${(value / calculatedMaxValue) * 100}%`;
  };
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format percentage values
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={styles.title}>Financial Performance</Text>
      
      <View style={styles.barContainer}>
        {/* Revenue Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Revenue</Text>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: getBarWidth(data.revenue),
                  backgroundColor: colors.primary,
                }
              ]}
            >
              <Text style={styles.barValue}>{formatCurrency(data.revenue)}</Text>
            </View>
          </View>
        </View>
        
        {/* Expenses Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Costs</Text>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: getBarWidth(data.expenses),
                  backgroundColor: colors.danger,
                }
              ]}
            >
              <Text style={styles.barValue}>{formatCurrency(data.expenses)}</Text>
            </View>
          </View>
        </View>
        
        {/* Profit Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Profit</Text>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: getBarWidth(data.profit),
                  backgroundColor: colors.success,
                }
              ]}
            >
              <Text style={styles.barValue}>{formatCurrency(data.profit)}</Text>
            </View>
          </View>
        </View>
        
        {/* Margin Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Margin</Text>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${margin}%`,
                  backgroundColor: colors.secondary,
                }
              ]}
            >
              <Text style={styles.barValue}>{formatPercent(margin)}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Revenue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendText}>Costs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Profit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
          <Text style={styles.legendText}>Margin</Text>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  barContainer: {
    marginBottom: theme.spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  barLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  barValue: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray[600],
  },
});