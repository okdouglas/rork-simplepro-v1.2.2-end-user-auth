import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { DollarSign, Clock, AlertTriangle, CheckCircle, Filter, ChevronDown, ArrowRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface ServiceType {
  type: string;
  count: number;
  conversionRate: number;
  averageValue: number;
}

interface StatusMetrics {
  count: number;
  value: number;
}

interface FinancialMetricsProps {
  invoiceAging: {
    current: { count: number; value: number };
    days30: { count: number; value: number };
    days60: { count: number; value: number };
    days90Plus: { count: number; value: number };
  };
  quotePerformance: {
    byServiceType: ServiceType[];
    byStatus: {
      draft: StatusMetrics;
      sent: StatusMetrics;
      approved: StatusMetrics;
      rejected: StatusMetrics;
      expired?: StatusMetrics;
    };
  };
  monthlyTrend?: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

interface FinancialMetricsSectionProps {
  metrics: FinancialMetricsProps;
  hideTitle?: boolean; // Add prop to optionally hide the title
}

const FILTER_OPTIONS = ['All', 'HVAC', 'Plumbing', 'Electrical'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

export default function FinancialMetricsSection({ metrics, hideTitle = false }: FinancialMetricsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const handleInvoicePress = (status: string) => {
    // Navigate to filtered invoices view
    router.push({
      pathname: '/invoices',
      params: { status }
    } as any);
  };
  
  const handleStatusPress = (status: string) => {
    // Navigate to quotes filtered by status
    router.push({
      pathname: '/quotes',
      params: { status }
    } as any);
  };
  
  const selectFilter = (filter: FilterOption) => {
    setActiveFilter(filter);
    setShowFilterOptions(false);
  };

  return (
    <View style={styles.container}>
      {!hideTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Financial Metrics</Text>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowFilterOptions(!showFilterOptions)}
            >
              <Text style={styles.filterButtonText}>{activeFilter}</Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
            
            {showFilterOptions && (
              <View style={[styles.filterDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {FILTER_OPTIONS.map(option => (
                  <TouchableOpacity 
                    key={option}
                    style={[
                      styles.filterOption,
                      option === activeFilter && { backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => selectFilter(option)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      option === activeFilter && { color: colors.primary, fontWeight: '600' }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Invoice Aging */}
      <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricsCardHeader}>
          <Text style={styles.metricsCardTitle}>Invoice Aging</Text>
          <TouchableOpacity onPress={() => router.push('/invoices')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.agingContainer}>
            <TouchableOpacity 
              style={[styles.agingCard, styles.currentCard]}
              onPress={() => handleInvoicePress('current')}
            >
              <Text style={styles.agingTitle}>Current</Text>
              <Text style={styles.agingValue}>{formatCurrency(metrics.invoiceAging.current.value)}</Text>
              <View style={styles.agingDetails}>
                <Text style={styles.agingCount}>{metrics.invoiceAging.current.count} invoices</Text>
                <CheckCircle size={14} color={colors.success} style={styles.agingIcon} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.agingCard, styles.days30Card]}
              onPress={() => handleInvoicePress('days30')}
            >
              <Text style={styles.agingTitle}>30 Days</Text>
              <Text style={styles.agingValue}>{formatCurrency(metrics.invoiceAging.days30.value)}</Text>
              <View style={styles.agingDetails}>
                <Text style={styles.agingCount}>{metrics.invoiceAging.days30.count} invoices</Text>
                <Clock size={14} color={colors.warning} style={styles.agingIcon} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.agingCard, styles.days60Card]}
              onPress={() => handleInvoicePress('days60')}
            >
              <Text style={styles.agingTitle}>60 Days</Text>
              <Text style={styles.agingValue}>{formatCurrency(metrics.invoiceAging.days60.value)}</Text>
              <View style={styles.agingDetails}>
                <Text style={styles.agingCount}>{metrics.invoiceAging.days60.count} invoices</Text>
                <AlertTriangle size={14} color={colors.warningDark} style={styles.agingIcon} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.agingCard, styles.days90Card]}
              onPress={() => handleInvoicePress('days90Plus')}
            >
              <Text style={styles.agingTitle}>90+ Days</Text>
              <Text style={styles.agingValue}>{formatCurrency(metrics.invoiceAging.days90Plus.value)}</Text>
              <View style={styles.agingDetails}>
                <Text style={styles.agingCount}>{metrics.invoiceAging.days90Plus.count} invoices</Text>
                <AlertTriangle size={14} color={colors.danger} style={styles.agingIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      
      {/* Quote Status */}
      <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricsCardHeader}>
          <Text style={styles.metricsCardTitle}>Quote Performance</Text>
          <TouchableOpacity onPress={() => router.push('/quotes')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statusContainer}>
            <TouchableOpacity 
              style={[styles.statusCard, styles.draftCard]}
              onPress={() => handleStatusPress('draft')}
            >
              <Text style={styles.statusTitle}>Draft</Text>
              <Text style={styles.statusValue}>{formatCurrency(metrics.quotePerformance.byStatus.draft.value)}</Text>
              <View style={styles.statusFooter}>
                <Text style={styles.statusCount}>{metrics.quotePerformance.byStatus.draft.count} quotes</Text>
                <ArrowRight size={14} color={colors.gray[500]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusCard, styles.sentCard]}
              onPress={() => handleStatusPress('sent')}
            >
              <Text style={styles.statusTitle}>Sent</Text>
              <Text style={styles.statusValue}>{formatCurrency(metrics.quotePerformance.byStatus.sent.value)}</Text>
              <View style={styles.statusFooter}>
                <Text style={styles.statusCount}>{metrics.quotePerformance.byStatus.sent.count} quotes</Text>
                <ArrowRight size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusCard, styles.approvedCard]}
              onPress={() => handleStatusPress('approved')}
            >
              <Text style={styles.statusTitle}>Approved</Text>
              <Text style={styles.statusValue}>{formatCurrency(metrics.quotePerformance.byStatus.approved.value)}</Text>
              <View style={styles.statusFooter}>
                <Text style={styles.statusCount}>{metrics.quotePerformance.byStatus.approved.count} quotes</Text>
                <ArrowRight size={14} color={colors.success} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusCard, styles.rejectedCard]}
              onPress={() => handleStatusPress('rejected')}
            >
              <Text style={styles.statusTitle}>Rejected</Text>
              <Text style={styles.statusValue}>{formatCurrency(metrics.quotePerformance.byStatus.rejected.value)}</Text>
              <View style={styles.statusFooter}>
                <Text style={styles.statusCount}>{metrics.quotePerformance.byStatus.rejected.count} quotes</Text>
                <ArrowRight size={14} color={colors.danger} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      
      {/* Service Type Performance */}
      <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricsCardHeader}>
          <Text style={styles.metricsCardTitle}>Service Type Performance</Text>
        </View>
        
        <View style={styles.serviceTypeContainer}>
          {metrics.quotePerformance.byServiceType.map((service: ServiceType, index: number) => (
            <View key={index} style={styles.serviceTypeItem}>
              <View style={styles.serviceTypeHeader}>
                <Text style={styles.serviceTypeTitle}>{service.type.toUpperCase()}</Text>
                <Text style={styles.serviceTypeCount}>{service.count} quotes</Text>
              </View>
              
              <View style={styles.serviceTypeMetrics}>
                <View style={styles.serviceTypeMetric}>
                  <Text style={styles.serviceTypeMetricLabel}>Conversion</Text>
                  <Text style={styles.serviceTypeMetricValue}>{formatPercent(service.conversionRate)}</Text>
                </View>
                
                <View style={styles.serviceTypeMetric}>
                  <Text style={styles.serviceTypeMetricLabel}>Avg Value</Text>
                  <Text style={styles.serviceTypeMetricValue}>{formatCurrency(service.averageValue)}</Text>
                </View>
              </View>
              
              <View style={styles.conversionBarContainer}>
                <View 
                  style={[
                    styles.conversionBar, 
                    { 
                      width: `${service.conversionRate}%`,
                      backgroundColor: service.type === 'hvac' ? colors.primary : 
                                      service.type === 'plumbing' ? colors.secondary : 
                                      colors.warning
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  filterContainer: {
    position: 'relative',
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.xs,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    marginRight: theme.spacing.xs,
  },
  filterDropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 140,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    ...theme.shadows.md,
    zIndex: 100,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  metricsCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  metricsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  metricsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  agingContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  agingCard: {
    width: 130,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.xs,
  },
  currentCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
    borderWidth: 1,
  },
  days30Card: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
    borderWidth: 1,
  },
  days60Card: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning + '40',
    borderWidth: 1,
  },
  days90Card: {
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger + '30',
    borderWidth: 1,
  },
  agingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 4,
  },
  agingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  agingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agingCount: {
    fontSize: 12,
    color: colors.gray[600],
  },
  agingIcon: {
    marginLeft: theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusCard: {
    width: 130,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.xs,
  },
  draftCard: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
    borderWidth: 1,
  },
  sentCard: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
    borderWidth: 1,
  },
  approvedCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
    borderWidth: 1,
  },
  rejectedCard: {
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger + '30',
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusCount: {
    fontSize: 12,
    color: colors.gray[600],
  },
  serviceTypeContainer: {
    gap: theme.spacing.md,
  },
  serviceTypeItem: {
    marginBottom: theme.spacing.sm,
  },
  serviceTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serviceTypeCount: {
    fontSize: 12,
    color: colors.gray[600],
  },
  serviceTypeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceTypeMetric: {
    flex: 1,
  },
  serviceTypeMetricLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  serviceTypeMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  conversionBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
  },
  conversionBar: {
    height: '100%',
    borderRadius: 4,
  },
});