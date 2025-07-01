import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Subscription, 
  SubscriptionPlanType, 
  SubscriptionStatus, 
  BillingCycle,
  UsageMetrics,
  BillingInvoice,
  PaymentProcessingFee
} from '@/types';

// Mock data for current subscription
const initialSubscription: Subscription = {
  id: 'sub_123456',
  userId: 'user_123',
  stripeSubscriptionId: 'sub_stripe123',
  planType: 'professional',
  status: 'active',
  currentPeriodStart: '2025-06-01',
  currentPeriodEnd: '2025-07-01',
  cancelAtPeriodEnd: false,
  billingCycle: 'monthly',
  createdAt: '2025-01-01',
  updatedAt: '2025-06-01',
};

// Mock data for usage metrics
const initialUsageMetrics: UsageMetrics = {
  id: 'usage_123',
  userId: 'user_123',
  monthYear: '2025-06',
  jobsCreated: 15,
  invoicesSent: 8,
  quotesGenerated: 12,
  storageUsedMb: 2560, // 2.5 GB
  paymentVolumeProcessed: 4250.75,
  createdAt: '2025-06-01',
  updatedAt: '2025-06-26',
};

// Mock data for billing history
const initialBillingHistory: BillingInvoice[] = [
  {
    id: 'inv_123456',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123456',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-06-01',
    periodEnd: '2025-07-01',
    pdfUrl: 'https://example.com/invoice/123456.pdf',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'inv_123455',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123455',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-05-01',
    periodEnd: '2025-06-01',
    pdfUrl: 'https://example.com/invoice/123455.pdf',
    createdAt: '2025-05-01',
    updatedAt: '2025-05-01',
  },
  {
    id: 'inv_123454',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123454',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-04-01',
    periodEnd: '2025-05-01',
    pdfUrl: 'https://example.com/invoice/123454.pdf',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-01',
  },
  {
    id: 'inv_123453',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123453',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-03-01',
    periodEnd: '2025-04-01',
    pdfUrl: 'https://example.com/invoice/123453.pdf',
    createdAt: '2025-03-01',
    updatedAt: '2025-03-01',
  },
  {
    id: 'inv_123452',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123452',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-02-01',
    periodEnd: '2025-03-01',
    pdfUrl: 'https://example.com/invoice/123452.pdf',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-01',
  },
  {
    id: 'inv_123451',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123451',
    amount: 99.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2025-01-01',
    periodEnd: '2025-02-01',
    pdfUrl: 'https://example.com/invoice/123451.pdf',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'inv_123450',
    userId: 'user_123',
    stripeInvoiceId: 'in_stripe123450',
    amount: 49.00,
    status: 'paid',
    billingReason: 'subscription_cycle',
    periodStart: '2024-12-01',
    periodEnd: '2025-01-01',
    pdfUrl: 'https://example.com/invoice/123450.pdf',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
  },
];

// Mock data for payment processing fees
const initialProcessingFees: PaymentProcessingFee[] = [
  {
    id: 'fee_123456',
    userId: 'user_123',
    invoiceId: 'cust_inv_123456',
    amount: 1250.00,
    feeAmount: 36.25,
    createdAt: '2025-06-15',
  },
  {
    id: 'fee_123455',
    userId: 'user_123',
    invoiceId: 'cust_inv_123455',
    amount: 980.50,
    feeAmount: 28.44,
    createdAt: '2025-05-15',
  },
  {
    id: 'fee_123454',
    userId: 'user_123',
    invoiceId: 'cust_inv_123454',
    amount: 1450.75,
    feeAmount: 42.07,
    createdAt: '2025-04-15',
  },
];

// Subscription plan details
export const subscriptionPlans = [
  {
    id: 'starter',
    type: 'starter',
    name: 'Starter Plan',
    price: 49,
    features: [
      'Basic job scheduling (up to 20 jobs/month)',
      'Simple customer database (up to 50 customers)',
      'Basic invoicing (up to 10 invoices/month)',
      'Email invoice delivery',
      'Mobile app access',
      'Basic photo storage (1GB)',
      'Standard support (email only)',
    ],
    limitations: [
      'No SMS notifications',
      'No advanced reporting',
      'No team member access',
      'Limited quote templates (2 per category)',
    ],
    limits: {
      jobs: 20,
      customers: 50,
      invoices: 10,
      storage: 1, // in GB
      teamMembers: 0,
      templates: 2,
    },
    isPopular: false,
  },
  {
    id: 'professional',
    type: 'professional',
    name: 'Professional Plan',
    price: 99,
    features: [
      'Unlimited jobs and customers',
      'Professional quote generation with templates',
      'Quote-to-invoice conversion',
      'Stripe payment processing integration',
      'SMS notifications to customers',
      'Advanced photo organization (5GB storage)',
      'Customer portal for quote approval',
      'Basic reporting dashboard',
      'Priority email support',
      '1 team member access',
    ],
    limitations: [],
    limits: {
      jobs: Infinity,
      customers: Infinity,
      invoices: Infinity,
      storage: 5, // in GB
      teamMembers: 1,
      templates: Infinity,
    },
    isPopular: true,
  },
  {
    id: 'enterprise',
    type: 'enterprise',
    name: 'Enterprise Plan',
    price: 149,
    features: [
      'Everything in Professional, plus:',
      'AI-powered quote generation',
      'Advanced analytics and reporting',
      'Custom invoice/quote branding',
      'Recurring billing for maintenance contracts',
      'Multiple team member access (up to 5 users)',
      'API access for integrations',
      'Priority phone + email support',
      'Unlimited photo storage (10GB)',
      'Advanced customer segmentation',
      'Bulk operations and automation',
    ],
    limitations: [],
    limits: {
      jobs: Infinity,
      customers: Infinity,
      invoices: Infinity,
      storage: 10, // in GB
      teamMembers: 5,
      templates: Infinity,
    },
    isPopular: false,
  },
];

interface SubscriptionState {
  subscription: Subscription;
  usageMetrics: UsageMetrics;
  billingHistory: BillingInvoice[];
  processingFees: PaymentProcessingFee[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSubscription: () => Promise<void>;
  fetchUsageMetrics: () => Promise<void>;
  fetchBillingHistory: () => Promise<void>;
  fetchProcessingFees: () => Promise<void>;
  
  updateSubscription: (updates: Partial<Subscription>) => Promise<void>;
  changePlan: (planType: SubscriptionPlanType, billingCycle: BillingCycle) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  
  // Stripe-related actions
  createStripeSubscription: (planType: SubscriptionPlanType, paymentMethodId: string, billingCycle: BillingCycle) => Promise<void>;
  updateStripeSubscription: (planType: SubscriptionPlanType, billingCycle: BillingCycle) => Promise<void>;
  cancelStripeSubscription: (atPeriodEnd: boolean) => Promise<void>;
  
  // Utility methods
  getCurrentPlan: () => typeof subscriptionPlans[0];
  isFeatureAvailable: (feature: string) => boolean;
  getRemainingUsage: (resource: 'jobs' | 'customers' | 'invoices' | 'storage') => { used: number; limit: number | string; percentage: number };
  calculateProcessingFees: (amount: number) => number;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: initialSubscription,
      usageMetrics: initialUsageMetrics,
      billingHistory: initialBillingHistory,
      processingFees: initialProcessingFees,
      isLoading: false,
      error: null,
      
      fetchSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call to fetch the subscription from Stripe
          // For now, we're just using the mock data
          set({ subscription: initialSubscription, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchUsageMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call to fetch usage metrics
          set({ usageMetrics: initialUsageMetrics, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchBillingHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call to fetch billing history from Stripe
          set({ billingHistory: initialBillingHistory, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchProcessingFees: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call to fetch processing fees
          set({ processingFees: initialProcessingFees, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateSubscription: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call to update the subscription
          set(state => ({
            subscription: {
              ...state.subscription,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      changePlan: async (planType, billingCycle) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call Stripe API to update the subscription
          const currentPlan = get().subscription.planType;
          
          // If downgrading, set cancelAtPeriodEnd to true
          const isDowngrade = 
            (currentPlan === 'enterprise' && (planType === 'professional' || planType === 'starter')) ||
            (currentPlan === 'professional' && planType === 'starter');
          
          if (isDowngrade) {
            set(state => ({
              subscription: {
                ...state.subscription,
                cancelAtPeriodEnd: true,
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            }));
          } else {
            // If upgrading, update immediately
            set(state => ({
              subscription: {
                ...state.subscription,
                planType,
                billingCycle,
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      cancelSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call Stripe API to cancel the subscription
          set(state => ({
            subscription: {
              ...state.subscription,
              cancelAtPeriodEnd: true,
              status: 'active', // Still active until the end of the period
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // Stripe-related actions
      createStripeSubscription: async (planType, paymentMethodId, billingCycle) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call Stripe API to create a subscription
          // For now, we're just updating the local state
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          
          set({
            subscription: {
              ...initialSubscription,
              planType,
              billingCycle,
              currentPeriodStart: now.toISOString(),
              currentPeriodEnd: nextMonth.toISOString(),
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
            },
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateStripeSubscription: async (planType, billingCycle) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call Stripe API to update a subscription
          // For now, we're just updating the local state
          set(state => ({
            subscription: {
              ...state.subscription,
              planType,
              billingCycle,
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      cancelStripeSubscription: async (atPeriodEnd) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call Stripe API to cancel a subscription
          // For now, we're just updating the local state
          if (atPeriodEnd) {
            set(state => ({
              subscription: {
                ...state.subscription,
                cancelAtPeriodEnd: true,
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            }));
          } else {
            set(state => ({
              subscription: {
                ...state.subscription,
                status: 'canceled',
                updatedAt: new Date().toISOString(),
              },
              isLoading: false,
            }));
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // Utility methods
      getCurrentPlan: () => {
        const planType = get().subscription.planType;
        return subscriptionPlans.find(plan => plan.type === planType) || subscriptionPlans[1]; // Default to Professional
      },
      
      isFeatureAvailable: (feature) => {
        const currentPlan = get().getCurrentPlan();
        return currentPlan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
      },
      
      getRemainingUsage: (resource) => {
        const { usageMetrics } = get();
        const currentPlan = get().getCurrentPlan();
        const limit = currentPlan.limits[resource];
        
        let used = 0;
        switch (resource) {
          case 'jobs':
            used = usageMetrics.jobsCreated;
            break;
          case 'customers':
            // This would need to be fetched from the customer store in a real app
            used = 35; // Mock value
            break;
          case 'invoices':
            used = usageMetrics.invoicesSent;
            break;
          case 'storage':
            used = usageMetrics.storageUsedMb / 1024; // Convert MB to GB
            break;
        }
        
        const percentage = limit === Infinity ? 0 : (used / limit) * 100;
        const limitDisplay = limit === Infinity ? 'Unlimited' : limit;
        
        return { used, limit: limitDisplay, percentage };
      },
      
      calculateProcessingFees: (amount) => {
        // Professional and Enterprise plans: 2.9% + 30¢ per processed payment
        return amount * 0.029 + 0.30;
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);