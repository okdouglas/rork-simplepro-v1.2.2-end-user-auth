import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { Check, CheckCircle2, X, AlertCircle } from 'lucide-react-native';
import { useSubscriptionStore, subscriptionPlans } from '@/store/subscriptionStore';
import { formatCurrency } from '@/constants/stripe';

export default function UpgradePlanScreen() {
  const router = useRouter();
  const { 
    subscription, 
    isLoading, 
    error, 
    changePlan, 
    getCurrentPlan 
  } = useSubscriptionStore();
  
  const [selectedPlan, setSelectedPlan] = useState(subscription.planType);
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const currentPlan = getCurrentPlan();
  
  useEffect(() => {
    // Set initial values based on current subscription
    setSelectedPlan(subscription.planType);
    setBillingCycle(subscription.billingCycle);
  }, [subscription]);
  
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };
  
  const handleBillingCycleChange = (cycle) => {
    setBillingCycle(cycle);
  };
  
  const handleUpgrade = async () => {
    // Check if user is trying to downgrade
    const currentPlanIndex = subscriptionPlans.findIndex(plan => plan.type === subscription.planType);
    const newPlanIndex = subscriptionPlans.findIndex(plan => plan.type === selectedPlan);
    
    if (currentPlanIndex > newPlanIndex) {
      Alert.alert(
        'Confirm Downgrade',
        'Downgrading your plan will take effect at the end of your current billing cycle. Some features will no longer be available. Are you sure you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm Downgrade', 
            onPress: async () => {
              try {
                setIsUpdating(true);
                await changePlan(selectedPlan, billingCycle);
                Alert.alert(
                  'Plan Changed', 
                  `Your subscription will be changed to the ${subscriptionPlans.find(p => p.type === selectedPlan).name} at the end of your current billing cycle.`
                );
                router.back();
              } catch (err) {
                Alert.alert('Error', 'Failed to change plan. Please try again.');
              } finally {
                setIsUpdating(false);
              }
            }
          },
        ]
      );
    } else if (subscription.planType === selectedPlan && subscription.billingCycle === billingCycle) {
      Alert.alert('No Change', 'You are already subscribed to this plan with this billing cycle.');
    } else {
      Alert.alert(
        'Confirm Upgrade',
        `You will be charged ${billingCycle === 'annual' ? 
          formatCurrency(subscriptionPlans.find(p => p.type === selectedPlan).price * 10) + ' annually' : 
          formatCurrency(subscriptionPlans.find(p => p.type === selectedPlan).price) + ' monthly'}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm Upgrade', 
            onPress: async () => {
              try {
                setIsUpdating(true);
                await changePlan(selectedPlan, billingCycle);
                Alert.alert(
                  'Plan Upgraded', 
                  `Your subscription has been upgraded to the ${subscriptionPlans.find(p => p.type === selectedPlan).name}.`
                );
                router.back();
              } catch (err) {
                Alert.alert('Error', 'Failed to upgrade plan. Please try again.');
              } finally {
                setIsUpdating(false);
              }
            }
          },
        ]
      );
    }
  };
  
  const getAnnualPrice = (monthlyPrice) => {
    return (monthlyPrice * 10).toFixed(2); // 2 months free
  };
  
  const getSavingsText = (monthlyPrice) => {
    const monthlyCost = monthlyPrice * 12;
    const annualCost = monthlyPrice * 10;
    const savings = monthlyCost - annualCost;
    return `Save ${formatCurrency(savings)} per year`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load subscription plans</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => router.replace('/profile/billing/upgrade')}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Choose a Plan' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Billing Cycle Selector */}
          <View style={styles.billingCycleContainer}>
            <TouchableOpacity
              style={[
                styles.billingCycleOption,
                billingCycle === 'monthly' && styles.billingCycleSelected
              ]}
              onPress={() => handleBillingCycleChange('monthly')}
            >
              <Text style={[
                styles.billingCycleText,
                billingCycle === 'monthly' && styles.billingCycleTextSelected
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.billingCycleOption,
                billingCycle === 'annual' && styles.billingCycleSelected
              ]}
              onPress={() => handleBillingCycleChange('annual')}
            >
              <Text style={[
                styles.billingCycleText,
                billingCycle === 'annual' && styles.billingCycleTextSelected
              ]}>
                Annual
              </Text>
              <Text style={styles.savingsText}>2 months free</Text>
            </TouchableOpacity>
          </View>
          
          {/* Plan Cards */}
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.type && styles.selectedPlanCard,
                plan.isPopular && styles.popularPlanCard,
              ]}
              onPress={() => handlePlanSelect(plan.type)}
              activeOpacity={0.8}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              {plan.type === subscription.planType && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current Plan</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Text style={styles.planPrice}>
                    {billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price}
                  </Text>
                  <View style={styles.billingPeriodContainer}>
                    <Text style={styles.billingPeriod}>
                      {billingCycle === 'annual' ? '/year' : '/month'}
                    </Text>
                    {billingCycle === 'annual' && (
                      <Text style={styles.monthlyEquivalent}>
                        ${(plan.price * 10 / 12).toFixed(2)}/mo
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <CheckCircle2 size={18} color={colors.secondary} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                
                {plan.limitations && plan.limitations.map((limitation, index) => (
                  <View key={`limit-${index}`} style={styles.featureItem}>
                    <X size={18} color={colors.gray[400]} />
                    <Text style={styles.limitationText}>{limitation}</Text>
                  </View>
                ))}
              </View>
              
              {selectedPlan === plan.type && (
                <View style={styles.selectedIndicator}>
                  <Check size={20} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          <Button
            title={selectedPlan === subscription.planType && billingCycle === subscription.billingCycle ? 'Keep Current Plan' : 'Confirm Selection'}
            onPress={handleUpgrade}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.confirmButton}
            loading={isUpdating}
          />
          
          <Text style={styles.footerText}>
            {billingCycle === 'annual' ? 
              'Annual subscriptions are billed for 10 months, giving you 2 months free.' :
              'Monthly subscriptions are billed every month and can be canceled anytime.'}
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
  billingCycleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  billingCycleOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billingCycleSelected: {
    backgroundColor: colors.primary,
  },
  billingCycleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  billingCycleTextSelected: {
    color: colors.white,
  },
  savingsText: {
    fontSize: 12,
    color: colors.white,
    marginTop: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: colors.primary,
    ...theme.shadows.md,
  },
  popularPlanCard: {
    borderColor: colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: theme.spacing.md,
    backgroundColor: colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    left: theme.spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  currentBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.tertiary,
    marginBottom: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray[900],
  },
  billingPeriodContainer: {
    marginLeft: 4,
    marginTop: 8,
  },
  billingPeriod: {
    fontSize: 16,
    color: colors.gray[600],
  },
  monthlyEquivalent: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  planFeatures: {
    marginTop: theme.spacing.md,
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
    flex: 1,
  },
  limitationText: {
    fontSize: 15,
    color: colors.gray[500],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    marginTop: theme.spacing.md,
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