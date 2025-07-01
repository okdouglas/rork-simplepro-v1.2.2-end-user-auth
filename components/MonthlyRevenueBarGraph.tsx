import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import RevenueBarGraph from './RevenueBarGraph';

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface MonthlyRevenueBarGraphProps {
  data: MonthlyData[];
}

export default function MonthlyRevenueBarGraph({ data }: MonthlyRevenueBarGraphProps) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(data.length - 1); // Default to latest month
  
  const selectedMonth = data[selectedMonthIndex];
  
  // Find the maximum value across all months for consistent scaling
  const maxValue = data.reduce((max, month) => {
    return Math.max(max, month.revenue, month.expenses, month.profit);
  }, 0);
  
  const handlePreviousMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonthIndex < data.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Performance</Text>
        
        <View style={styles.monthSelector}>
          <TouchableOpacity 
            style={[
              styles.monthButton, 
              selectedMonthIndex === 0 && styles.disabledButton
            ]}
            onPress={handlePreviousMonth}
            disabled={selectedMonthIndex === 0}
          >
            <ChevronLeft size={18} color={selectedMonthIndex === 0 ? colors.gray[400] : colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>{selectedMonth.month}</Text>
          
          <TouchableOpacity 
            style={[
              styles.monthButton, 
              selectedMonthIndex === data.length - 1 && styles.disabledButton
            ]}
            onPress={handleNextMonth}
            disabled={selectedMonthIndex === data.length - 1}
          >
            <ChevronRight size={18} color={selectedMonthIndex === data.length - 1 ? colors.gray[400] : colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <RevenueBarGraph 
        data={{
          revenue: selectedMonth.revenue,
          expenses: selectedMonth.expenses,
          profit: selectedMonth.profit,
        }}
        maxValue={maxValue}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthsContainer}
      >
        {data.map((month, index) => (
          <TouchableOpacity 
            key={month.month}
            style={[
              styles.monthTab,
              index === selectedMonthIndex && styles.selectedMonthTab
            ]}
            onPress={() => setSelectedMonthIndex(index)}
          >
            <Text 
              style={[
                styles.monthTabText,
                index === selectedMonthIndex && styles.selectedMonthTabText
              ]}
            >
              {month.month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  disabledButton: {
    opacity: 0.5,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  monthsContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  monthTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  selectedMonthTab: {
    backgroundColor: colors.primary,
  },
  monthTabText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  selectedMonthTabText: {
    color: colors.white,
    fontWeight: '500',
  },
});