import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { ArrowRight, CreditCard, FileText, Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { formatCurrency } from '@/constants/stripe';

export default function BillingScreen() {
  const router = useRouter();
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  
  const { 
    subscription, 
    usageMetrics, 
    isLoading,
    error,
    fetchSubscription,
    fetchUsageMetrics,
    getCurrentPlan,
    getRemainingUsage,
    cancelSubscription
  } = useSubscriptionStore();
  
  useEffect(() => {
    fetchSubscription();
    fetchUsageMetrics();
  }, []);
  
  const currentPlan = getCurrentPlan();
  
  const handleUpgrade = () => {
    router.push('/profile/billing/upgrade');
  };
  
  const handleViewHistory = () => {
    router.push('/profile/billing/history');
  };
  
  const handleManagePaymentMethods = () => {
    router.push('/profile/payment-methods');
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert(
                'Subscription Canceled', 
                `Your subscription has been canceled and will end on ${formatDate(subscription.currentPeriodEnd)}.`
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          }
        },
      ]
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const calculatePercentage = (used, total) => {
    if (total === 'Unlimited') return 0;
    return (used / total) * 100;
  };
  
  const formatStorageSize = (sizeInMb) => {
    if (sizeInMb >= 1024) {
      return `${(sizeInMb / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMb} MB`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load subscription details</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => {
            fetchSubscription();
            fetchUsageMetrics();
          }}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  // Get usage metrics
  const jobsUsage = getRemainingUsage('jobs');
  const invoicesUsage = getRemainingUsage('invoices');
  const storageUsage = getRemainingUsage('storage');

  return (
    <>
      <Stack.Screen options={{ title: 'Billing & Subscription' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan Card */}
          <View style={styles.currentPlanCard}>
            <View style={styles.planHeaderRow}>
              <View>
                <Text style={styles.currentPlanLabel}>Current Plan</Text>
                <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
              </View>
              <StatusBadge status={subscription.status} type="subscription" />
            </View>
            
            <View style={styles.planDetailsRow}>
              <View style={styles.planDetail}>
                <Calendar size={16} color={colors.gray[600]} />
                <Text style={styles.planDetailText}>
                  Renews {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
              <View style={styles.planDetail}>
                <CreditCard size={16} color={colors.gray[600]} />
                <Text style={styles.planDetailText}>
                  ${currentPlan.price}/{subscription.billingCycle === 'annual' ? 'year' : 'month'}
                </Text>
              </View>
            </View>
            
            <View style={styles.planActions}>
              <Button
                title="Upgrade Plan"
                onPress={handleUpgrade}
                variant="primary"
                size="md"
                style={styles.upgradeButton}
              />
              <Button
                title="View Billing History"
                onPress={handleViewHistory}
                variant="outline"
                size="md"
                icon={<FileText size={16} color={colors.primary} />}
                style={styles.historyButton}
              />
            </View>
          </View>
          
          {/* Usage Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage This Month</Text>
            
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Jobs Created</Text>
                <Text style={styles.usageValue}>
                  {usageMetrics.jobsCreated} / {jobsUsage.limit}
                </Text>
              </View>
              {jobsUsage.limit !== 'Unlimited' && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${jobsUsage.percentage}%`,
                        backgroundColor: jobsUsage.percentage > 80 ? colors.warning : colors.primary
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
            
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Invoices Sent</Text>
                <Text style={styles.usageValue}>
                  {usageMetrics.invoicesSent} / {invoicesUsage.limit}
                </Text>
              </View>
              {invoicesUsage.limit !== 'Unlimited' && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${invoicesUsage.percentage}%`,
                        backgroundColor: invoicesUsage.percentage > 80 ? colors.warning : colors.primary
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
            
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Storage Used</Text>
                <Text style={styles.usageValue}>
                  {formatStorageSize(usageMetrics.storageUsedMb)} / {typeof storageUsage.limit === 'number' ? `${storageUsage.limit} GB` : storageUsage.limit}
                </Text>
              </View>
              {storageUsage.limit !== 'Unlimited' && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${storageUsage.percentage}%`,
                        backgroundColor: storageUsage.percentage > 80 ? colors.warning : colors.primary
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
            
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Payment Processing</Text>
                <Text style={styles.usageValue}>
                  {formatCurrency(usageMetrics.paymentVolumeProcessed)}
                </Text>
              </View>
              <Text style={styles.processingFeeText}>
                Fees earned: {formatCurrency(usageMetrics.paymentVolumeProcessed * 0.029 + usageMetrics.invoicesSent * 0.3)}
              </Text>
            </View>
          </View>
          
          {/* Plan Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{currentPlan.name} Features</Text>
            
            <View style={styles.featuresList}>
              {currentPlan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <CheckCircle2 size={18} color={colors.secondary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              
              {currentPlan.limitations && currentPlan.limitations.map((limitation, index) => (
                <View key={`limit-${index}`} style={styles.featureItem}>
                  <AlertCircle size={18} color={colors.gray[400]} />
                  <Text style={styles.limitationText}>{limitation}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Payment Methods */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <TouchableOpacity onPress={handleManagePaymentMethods}>
                <Text style={styles.manageLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentMethodCard}>
              <View style={styles.cardBrandContainer}>
                <Image 
                  source={{ uri: 'https://i.imgur.com/QGTIO76.png' }} // Visa logo
                  style={styles.cardBrandImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.cardNumber}>Visa •••• 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/2026</Text>
              </View>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            </View>
          </View>
          
          {/* Cancel Subscription */}
          <TouchableOpacity 
            style={styles.cancelSubscriptionButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelSubscriptionText}>Cancel Subscription</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Your subscription will automatically renew on {formatDate(subscription.currentPeriodEnd)}.
            You can cancel anytime before this date.
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
  currentPlanCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.md,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  currentPlanLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.tertiary,
  },
  planDetailsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  planDetailText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 6,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  upgradeButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  historyButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
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
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  manageLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  usageItem: {
    marginBottom: theme.spacing.md,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  usageLabel: {
    fontSize: 15,
    color: colors.gray[800],
  },
  usageValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[900],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  processingFeeText: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 4,
  },
  featuresList: {
    marginTop: theme.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 15,
    color: colors.gray[800],
    marginLeft: theme.spacing.sm,
  },
  limitationText: {
    fontSize: 15,
    color: colors.gray[500],
    marginLeft: theme.spacing.sm,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardBrandContainer: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardBrandImage: {
    width: 40,
    height: 25,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  cardExpiry: {
    fontSize: 14,
    color: colors.gray[600],
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
  cancelSubscriptionButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cancelSubscriptionText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '500',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
});