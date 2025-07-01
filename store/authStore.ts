import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'trial';
  subscriptionExpiry?: string;
  businessProfile: {
    companyName?: string;
    ownerName?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    logo?: string;
  };
  createdAt: string;
  lastLogin?: string;
  onboardingCompleted: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User['businessProfile']>) => Promise<void>;
  refreshToken: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  
  // Subscription helpers
  canCreateCustomer: () => boolean;
  canCreateQuote: () => boolean;
  canCreateJob: () => boolean;
  getCustomerLimit: () => number;
  getQuoteLimit: () => number;
  getJobLimit: () => number;
  isFeatureAvailable: (feature: string) => boolean;
}

// Subscription limits by tier
const SUBSCRIPTION_LIMITS = {
  free: {
    customers: 1,
    quotes: 1,
    jobs: 1,
    features: ['basic_profile', 'basic_quotes', 'basic_jobs']
  },
  basic: {
    customers: 25,
    quotes: 50,
    jobs: 50,
    features: ['basic_profile', 'basic_quotes', 'basic_jobs', 'email_notifications', 'basic_reports']
  },
  pro: {
    customers: Infinity,
    quotes: Infinity,
    jobs: Infinity,
    features: ['all_features', 'advanced_reports', 'sms_notifications', 'custom_branding', 'api_access']
  },
  enterprise: {
    customers: Infinity,
    quotes: Infinity,
    jobs: Infinity,
    features: ['all_features', 'priority_support', 'custom_integrations', 'white_label']
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For demo purposes, we'll simulate a successful login
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email,
            emailVerified: true,
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            businessProfile: {
              companyName: 'My Company',
              ownerName: 'John Doe',
              email: email,
            },
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            onboardingCompleted: false,
          };
          
          const mockToken = 'jwt_token_' + Date.now();
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      register: async (email, password, companyName) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email,
            emailVerified: false, // Requires email verification
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            businessProfile: {
              companyName,
              email: email,
            },
            createdAt: new Date().toISOString(),
            onboardingCompleted: false,
          };
          
          set({
            user: mockUser,
            isAuthenticated: false, // Not authenticated until email is verified
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would invalidate the token on the server
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would verify the token with the server
          const user = get().user;
          if (user) {
            const updatedUser = {
              ...user,
              emailVerified: true,
            };
            
            const authToken = 'jwt_token_' + Date.now();
            
            set({
              user: updatedUser,
              token: authToken,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would send a password reset email
          // For demo, we'll just simulate success
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const user = get().user;
          if (user) {
            const updatedUser = {
              ...user,
              businessProfile: {
                ...user.businessProfile,
                ...updates,
              },
            };
            
            set({
              user: updatedUser,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      refreshToken: async () => {
        // In a real app, this would refresh the JWT token
        const token = get().token;
        if (token) {
          // Simulate token refresh
          const newToken = 'jwt_token_' + Date.now();
          set({ token: newToken });
        }
      },
      
      completeOnboarding: async () => {
        const user = get().user;
        if (user) {
          const updatedUser = {
            ...user,
            onboardingCompleted: true,
          };
          
          set({ user: updatedUser });
        }
      },
      
      // Subscription helpers
      canCreateCustomer: () => {
        const user = get().user;
        if (!user) return false;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        // In a real app, you'd check the actual count from the customer store
        return limits.customers === Infinity || true; // Simplified for demo
      },
      
      canCreateQuote: () => {
        const user = get().user;
        if (!user) return false;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        return limits.quotes === Infinity || true; // Simplified for demo
      },
      
      canCreateJob: () => {
        const user = get().user;
        if (!user) return false;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        return limits.jobs === Infinity || true; // Simplified for demo
      },
      
      getCustomerLimit: () => {
        const user = get().user;
        if (!user) return 0;
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].customers;
      },
      
      getQuoteLimit: () => {
        const user = get().user;
        if (!user) return 0;
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].quotes;
      },
      
      getJobLimit: () => {
        const user = get().user;
        if (!user) return 0;
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].jobs;
      },
      
      isFeatureAvailable: (feature) => {
        const user = get().user;
        if (!user) return false;
        
        const features = SUBSCRIPTION_LIMITS[user.subscriptionTier].features;
        return features.includes('all_features') || features.includes(feature);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);