import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import { useCustomerStore } from '@/store/customerStore';
import { useAuthStore } from '@/store/authStore';
import { CustomerSegment } from '@/types';
import CustomerMetricsSection from '@/components/customers/CustomerMetricsSection';
import CustomerSegmentTabs from '@/components/customers/CustomerSegmentTabs';
import CustomerCard from '@/components/customers/CustomerCard';
import CustomerAutomationSection from '@/components/customers/CustomerAutomationSection';
import CustomerActionBar from '@/components/customers/CustomerActionBar';
import UsageLimitIndicator from '@/components/UsageLimitIndicator';
import SubscriptionGate from '@/components/SubscriptionGate';

export default function CustomersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    customers, 
    metrics,
    selectedSegment,
    isLoading,
    fetchCustomers, 
    fetchCustomerMetrics,
    filterCustomersBySegment,
    setSelectedSegment,
    addCustomerCampaign,
    canAddCustomer,
    getCustomerCount,
  } = useCustomerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
    fetchCustomerMetrics();
  }, [fetchCustomers, fetchCustomerMetrics]);
  
  const handleAddCustomer = () => {
    if (!canAddCustomer()) {
      setShowSubscriptionGate(true);
      return;
    }
    router.push('/customers/new');
  };
  
  const handleCustomerPress = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };
  
  const handleSegmentChange = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
  };
  
  const handleCreateCampaign = (campaignType: string, templateId?: string) => {
    // Check if user has access to marketing automation
    if (!user?.isFeatureAvailable('marketing_automation')) {
      Alert.alert(
        'Feature Unavailable',
        'Marketing automation is available in Pro and Enterprise plans.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/profile/billing/upgrade') }
        ]
      );
      return;
    }
    
    const segmentCustomers = filterCustomersBySegment(selectedSegment);
    if (segmentCustomers.length > 0) {
      addCustomerCampaign(segmentCustomers[0].id, campaignType);
      console.log(`Creating ${campaignType} campaign${templateId ? ` with template ${templateId}` : ''}`);
    }
  };
  
  // Filter customers by search query and segment
  const filteredCustomers = searchQuery 
    ? customers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filterCustomersBySegment(selectedSegment);
  
  // Sort customers by name
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Customers" showAdd onAddPress={handleAddCustomer} />
      
      {/* Usage Limit Indicator */}
      <UsageLimitIndicator 
        type="customers" 
        currentCount={getCustomerCount()} 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Metrics Section */}
          <CustomerMetricsSection metrics={metrics} />
          
          {/* Customer Segment Tabs */}
          <CustomerSegmentTabs 
            selectedSegment={selectedSegment}
            onSelectSegment={handleSegmentChange}
            metrics={metrics}
          />
          
          {/* Customer Automation Section - Gated for Pro+ */}
          <SubscriptionGate
            feature="marketing_automation"
            title="Marketing Automation"
            description="Automate customer communications with smart campaigns and follow-ups."
            requiredTier="pro"
          >
            <CustomerAutomationSection 
              onCreateCampaign={handleCreateCampaign}
              stats={metrics.campaignStats}
            />
          </SubscriptionGate>
          
          {/* Customer List */}
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>
              {selectedSegment === 'all' 
                ? 'All Customers' 
                : `${selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)} Customers`}
            </Text>
            
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  onPress={() => handleCustomerPress(customer.id)} 
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {customers.length === 0 
                    ? "No customers yet. Add your first customer to get started!" 
                    : "No customers found"}
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={handleAddCustomer}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color={colors.white} />
                  <Text style={styles.emptyStateButtonText}>
                    {customers.length === 0 ? "Add Your First Customer" : "Add New Customer"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Subscription Gate Modal */}
      <SubscriptionGate
        feature="unlimited_customers"
        title="Customer Limit Reached"
        description={`You've reached your limit of ${user?.subscriptionTier === 'free' ? '1 customer' : '25 customers'}. Upgrade to add more customers and grow your business.`}
        requiredTier={user?.subscriptionTier === 'free' ? 'basic' : 'pro'}
        showModal={showSubscriptionGate}
        onClose={() => setShowSubscriptionGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});