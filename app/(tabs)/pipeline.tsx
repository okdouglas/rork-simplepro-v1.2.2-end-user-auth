import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import PipelineSection from '@/components/PipelineSection';
import FinancialMetricsSection from '@/components/FinancialMetricsSection';
import MonthlyRevenueBarGraph from '@/components/MonthlyRevenueBarGraph';
import { pipelineStages, financialMetrics } from '@/mocks/dashboard';
import { useQuoteStore } from '@/store/quoteStore';
import { useJobStore } from '@/store/jobStore';
import { router } from 'expo-router';
import { 
  TrendingUp,
  Send
} from 'lucide-react-native';

// Define the MonthlyData interface to match what MonthlyRevenueBarGraph expects
interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Define the PipelineItem interface to match what PipelineSection expects
interface PipelineItem {
  id: string;
  customerId: string;
  title: string;
  value: number;
  priority: string;
  date: string;
  type: string;
  status: string;
}

// Define the PipelineStage interface to match what PipelineSection expects
interface PipelineStage {
  stage: string;
  name: string;
  count: number;
  value: number;
  color: string;
  icon: string;
  conversionRate?: number;
  avgTimeInStage?: number;
  items: PipelineItem[];
}

export default function FinancialsScreen() {
  const { quotes, getQuotesByStatus } = useQuoteStore();
  const { jobs } = useJobStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>(pipelineStages as PipelineStage[]);
  
  // Get sent quotes that haven't been approved yet
  const sentQuotes = getQuotesByStatus('sent');
  const openQuotesCount = sentQuotes.length;
  const openQuotesValue = sentQuotes.reduce((sum, quote) => sum + quote.total, 0);
  
  // Calculate pipeline metrics
  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const totalPipelineItems = stages.reduce((sum, stage) => sum + stage.count, 0);
  const avgConversionRate = stages
    .filter(stage => stage.conversionRate !== undefined)
    .reduce((sum, stage) => sum + (stage.conversionRate || 0), 0) / 
    stages.filter(stage => stage.conversionRate !== undefined).length;
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddItem = (stage: string) => {
    switch (stage) {
      case 'leads':
        router.push('/quotes/new');
        break;
      case 'warm':
        // This would typically show a list of draft quotes that can be sent
        router.push({
          pathname: '/quotes',
          params: { status: 'draft' }
        } as any);
        break;
      case 'open_invoices':
        // This would typically show a list of approved quotes that can be scheduled
        router.push({
          pathname: '/quotes',
          params: { status: 'approved' }
        } as any);
        break;
      case 'closed_won':
        router.push({
          pathname: '/jobs',
          params: { status: 'completed' }
        } as any);
        break;
    }
  };

  const handleMoveItem = (itemId: string, fromStage: string, toStage: string) => {
    // In a real app, this would update the item's stage in the database
    console.log(`Moving item ${itemId} from ${fromStage} to ${toStage}`);
  };

  const navigateToSentQuotes = () => {
    router.push({
      pathname: '/quotes',
      params: { status: 'sent' }
    } as any);
  };

  // Ensure monthlyTrend is not undefined before passing it to MonthlyRevenueBarGraph
  const monthlyTrendData: MonthlyData[] = financialMetrics.monthlyTrend || [];

  // Check if we have any pipeline stages with items
  const hasPipelineData = stages.some(stage => stage.items.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Financials" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pipeline Summary Cards */}
        <View style={styles.summaryCardsContainer}>
          <TouchableOpacity 
            style={[styles.summaryCard, { backgroundColor: colors.primary + '10' }]}
            onPress={navigateToSentQuotes}
          >
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardValue}>{openQuotesCount}</Text>
              <Text style={styles.summaryCardLabel}>Open Quotes</Text>
              <Text style={styles.summaryCardSubvalue}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(openQuotesValue)}
              </Text>
            </View>
            <View style={[styles.summaryCardIcon, { backgroundColor: colors.primary + '20' }]}>
              <Send size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.success + '10' }]}>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardValue}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(totalPipelineValue)}
              </Text>
              <Text style={styles.summaryCardLabel}>Pipeline Value</Text>
            </View>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: colors.secondary + '10' }]}>
            <View style={styles.summaryCardContent}>
              <Text style={styles.summaryCardValue}>{avgConversionRate.toFixed(1)}%</Text>
              <Text style={styles.summaryCardLabel}>Conversion Rate</Text>
            </View>
            <View style={[styles.summaryCardIcon, { backgroundColor: colors.secondary + '20' }]}>
              <TrendingUp size={20} color={colors.secondary} />
            </View>
          </View>
        </View>
        
        {/* Monthly Revenue Bar Graph */}
        {monthlyTrendData.length > 0 && (
          <MonthlyRevenueBarGraph data={monthlyTrendData} />
        )}
        
        {/* Pipeline Stages - Only render if there's data */}
        {hasPipelineData && (
          <PipelineSection 
            stages={stages} 
            onAddItem={handleAddItem}
            onMoveItem={handleMoveItem}
          />
        )}
        
        {/* Action Button - Always visible for creating quotes */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/quotes/new')}
        >
          <Text style={styles.actionButtonText}>Create Quote</Text>
        </TouchableOpacity>
        
        {/* Financial Metrics Section - hide the title */}
        <FinancialMetricsSection 
          metrics={financialMetrics} 
          hideTitle={true} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  summaryCardSubvalue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 2,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  summaryCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});