import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Download, FileText, AlertCircle } from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { formatCurrency } from '@/constants/stripe';
import Button from '@/components/Button';

export default function BillingHistoryScreen() {
  const { 
    billingHistory, 
    processingFees, 
    isLoading, 
    error, 
    fetchBillingHistory, 
    fetchProcessingFees 
  } = useSubscriptionStore();
  
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    fetchBillingHistory();
    fetchProcessingFees();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const handleDownloadInvoice = async (invoice) => {
    try {
      setIsDownloading(prev => ({ ...prev, [invoice.id]: true }));
      
      // In a real app, this would download the PDF from Stripe
      // For now, we'll just simulate a download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to open the PDF URL
      if (invoice.pdfUrl) {
        const supported = await Linking.canOpenURL(invoice.pdfUrl);
        if (supported) {
          await Linking.openURL(invoice.pdfUrl);
        } else {
          Alert.alert('Error', 'Cannot open PDF URL');
        }
      } else {
        Alert.alert('Download Invoice', `Invoice ${invoice.id} will be downloaded.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download invoice');
    } finally {
      setIsDownloading(prev => ({ ...prev, [invoice.id]: false }));
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return colors.secondary;
      case 'open':
        return colors.warning;
      case 'void':
      case 'uncollectible':
        return colors.danger;
      default:
        return colors.gray[500];
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading billing history...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load billing history</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => {
            fetchBillingHistory();
            fetchProcessingFees();
          }}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Billing History' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Invoices</Text>
            
            {billingHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No invoices found</Text>
              </View>
            ) : (
              billingHistory.map((invoice) => (
                <View key={invoice.id} style={styles.invoiceItem}>
                  <View style={styles.invoiceIcon}>
                    <FileText size={24} color={colors.primary} />
                  </View>
                  <View style={styles.invoiceDetails}>
                    <Text style={styles.invoiceDescription}>
                      {invoice.billingReason === 'subscription_create' ? 'Subscription Created' : 
                       invoice.billingReason === 'subscription_cycle' ? 'Subscription Renewal' :
                       invoice.billingReason === 'subscription_update' ? 'Subscription Updated' :
                       'Subscription Payment'}
                    </Text>
                    <Text style={styles.invoiceDate}>{formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}</Text>
                  </View>
                  <View style={styles.invoiceActions}>
                    <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                      <Text style={styles.statusText}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleDownloadInvoice(invoice)}
                      disabled={isDownloading[invoice.id]}
                    >
                      {isDownloading[invoice.id] ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Download size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Processing Fees</Text>
            
            {processingFees.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No processing fees found</Text>
              </View>
            ) : (
              processingFees.map((fee) => (
                <View key={fee.id} style={styles.feeItem}>
                  <View style={styles.feeDetails}>
                    <Text style={styles.feeDescription}>Payment Processing Fees</Text>
                    <Text style={styles.feeDate}>{formatDate(fee.createdAt)}</Text>
                    <Text style={styles.feeVolume}>Processing volume: {formatCurrency(fee.amount)}</Text>
                  </View>
                  <View style={styles.feeAmount}>
                    <Text style={styles.feeEarnings}>+{formatCurrency(fee.feeAmount)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
          
          <Text style={styles.footerText}>
            Need help with your billing? Contact our support team at support@simplepro.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
  },
  errorSubtext: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  invoiceItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  invoiceDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  invoiceDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 13,
    color: colors.gray[500],
  },
  invoiceActions: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  feeItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  feeDetails: {
    flex: 1,
  },
  feeDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 4,
  },
  feeDate: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 4,
  },
  feeVolume: {
    fontSize: 13,
    color: colors.gray[600],
  },
  feeAmount: {
    justifyContent: 'center',
    paddingLeft: theme.spacing.md,
  },
  feeEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.gray[500],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
});