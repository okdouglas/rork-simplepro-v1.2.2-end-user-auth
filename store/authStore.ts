import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  userType: 'admin' | 'user';
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
  
  // Admin helpers
  isAdmin: () => boolean;
  
  // Subscription helpers
  canCreateCustomer: () => boolean;
  canCreateQuote: () => boolean;
  canCreateJob: () => boolean;
  getCustomerLimit: () => number;
  getQuoteLimit: () => number;
  getJobLimit: () => number;
  isFeatureAvailable: (feature: string) => boolean;
}

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@simplepro.com',
  password: 'Admin007!',
};

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

// Password validation function
const validatePassword = (password: string, isAdmin: boolean = false): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  
  // For admin, enforce stronger password requirements
  if (isAdmin) {
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Admin password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Admin password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Admin password must contain at least one number';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'Admin password must contain at least one special character (!@#$%^&*)';
    }
  }
  
  return null;
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
          const trimmedEmail = email.toLowerCase().trim();
          
          // Check if this is admin login
          if (trimmedEmail === ADMIN_CREDENTIALS.email) {
            if (password !== ADMIN_CREDENTIALS.password) {
              throw new Error('Invalid admin credentials');
            }
            
            // Validate admin password format
            const passwordError = validatePassword(password, true);
            if (passwordError) {
              throw new Error(passwordError);
            }
            
            // Create admin user
            const adminUser: User = {
              id: 'admin_user',
              email: ADMIN_CREDENTIALS.email,
              emailVerified: true,
              userType: 'admin',
              subscriptionTier: 'enterprise', // Admin gets all features
              subscriptionStatus: 'active',
              businessProfile: {
                companyName: 'SimplePro Admin',
                ownerName: 'System Administrator',
                email: ADMIN_CREDENTIALS.email,
              },
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              onboardingCompleted: true,
            };
            
            const adminToken = 'admin_jwt_token_' + Date.now();
            
            set({
              user: adminUser,
              token: adminToken,
              isAuthenticated: true,
              isLoading: false,
            });
            
            console.log('Admin login successful');
            return;
          }
          
          // Regular user login validation
          const passwordError = validatePassword(password, false);
          if (passwordError) {
            throw new Error(passwordError);
          }
          
          // Regular user login (mock implementation)
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email: trimmedEmail,
            emailVerified: true,
            userType: 'user',
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            businessProfile: {
              companyName: 'My Company',
              ownerName: 'John Doe',
              email: trimmedEmail,
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
          
          console.log('User login successful');
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      register: async (email, password, companyName) => {
        set({ isLoading: true, error: null });
        try {
          const trimmedEmail = email.toLowerCase().trim();
          
          // Prevent registration with admin email
          if (trimmedEmail === ADMIN_CREDENTIALS.email) {
            throw new Error('Cannot register with admin email address');
          }
          
          // Validate password (minimum 6 characters for regular users)
          const passwordError = validatePassword(password, false);
          if (passwordError) {
            throw new Error(passwordError);
          }
          
          // Additional validation for user registration
          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters for new accounts');
          }
          
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain uppercase, lowercase, and number');
          }
          
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email: trimmedEmail,
            emailVerified: false, // Requires email verification
            userType: 'user',
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            businessProfile: {
              companyName,
              email: trimmedEmail,
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
          console.log('Logout successful');
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
          const trimmedEmail = email.toLowerCase().trim();
          
          // Prevent password reset for admin email
          if (trimmedEmail === ADMIN_CREDENTIALS.email) {
            throw new Error('Admin password cannot be reset through this method. Contact system administrator.');
          }
          
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
          const newToken = token.includes('admin') ? 'admin_jwt_token_' + Date.now() : 'jwt_token_' + Date.now();
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
      
      // Admin helpers
      isAdmin: () => {
        const user = get().user;
        return user?.userType === 'admin' || false;
      },
      
      // Subscription helpers
      canCreateCustomer: () => {
        const user = get().user;
        if (!user) return false;
        
        // Admin can create unlimited
        if (user.userType === 'admin') return true;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        // In a real app, you'd check the actual count from the customer store
        return limits.customers === Infinity || true; // Simplified for demo
      },
      
      canCreateQuote: () => {
        const user = get().user;
        if (!user) return false;
        
        // Admin can create unlimited
        if (user.userType === 'admin') return true;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        return limits.quotes === Infinity || true; // Simplified for demo
      },
      
      canCreateJob: () => {
        const user = get().user;
        if (!user) return false;
        
        // Admin can create unlimited
        if (user.userType === 'admin') return true;
        
        const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier];
        return limits.jobs === Infinity || true; // Simplified for demo
      },
      
      getCustomerLimit: () => {
        const user = get().user;
        if (!user) return 0;
        
        // Admin has unlimited
        if (user.userType === 'admin') return Infinity;
        
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].customers;
      },
      
      getQuoteLimit: () => {
        const user = get().user;
        if (!user) return 0;
        
        // Admin has unlimited
        if (user.userType === 'admin') return Infinity;
        
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].quotes;
      },
      
      getJobLimit: () => {
        const user = get().user;
        if (!user) return 0;
        
        // Admin has unlimited
        if (user.userType === 'admin') return Infinity;
        
        return SUBSCRIPTION_LIMITS[user.subscriptionTier].jobs;
      },
      
      isFeatureAvailable: (feature) => {
        const user = get().user;
        if (!user) return false;
        
        // Admin has access to all features
        if (user.userType === 'admin') return true;
        
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

// Export admin credentials for testing purposes
export const ADMIN_TEST_CREDENTIALS = {
  email: ADMIN_CREDENTIALS.email,
  password: ADMIN_CREDENTIALS.password,
};

// Export password validation function for use in components
export { validatePassword };