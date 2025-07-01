import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_CONFIG, validateAdminCredentials, isAdminEmail } from '@/constants/admin';

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
  permissions?: Record<string, boolean>;
  features?: Record<string, boolean>;
  sessionExpiry?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Test user management
  testUsers: User[];
  
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
  hasAdminPermission: (permission: string) => boolean;
  
  // Test user management
  createTestUser: () => Promise<User>;
  getTestUsers: () => User[];
  deleteTestUser: (userId: string) => Promise<void>;
  
  // Subscription helpers
  canCreateCustomer: () => boolean;
  canCreateQuote: () => boolean;
  canCreateJob: () => boolean;
  getCustomerLimit: () => number;
  getQuoteLimit: () => number;
  getJobLimit: () => number;
  isFeatureAvailable: (feature: string) => boolean;
  
  // Session management
  isSessionValid: () => boolean;
  getSessionTimeRemaining: () => number;
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

// Test user configuration
const TEST_USER_CONFIG = {
  email: 'testuser@simplepro.com',
  password: 'TestUser123!',
  companyName: 'Demo Construction Co.',
  ownerName: 'John Demo',
  phone: '+1 (555) 123-4567',
  address: '123 Demo Street, Demo City, DC 12345',
  taxId: 'TX123456789',
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
      testUsers: [],
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const trimmedEmail = email.toLowerCase().trim();
          
          // Check if this is admin login
          if (isAdminEmail(trimmedEmail)) {
            // Validate admin credentials
            const credentialValidation = validateAdminCredentials(trimmedEmail, password);
            if (!credentialValidation.isValid) {
              throw new Error(`Admin login failed: ${credentialValidation.errors.join(', ')}`);
            }
            
            // Create admin user
            const adminUser: User = {
              id: 'admin_user',
              email: ADMIN_CONFIG.DEFAULT_EMAIL,
              emailVerified: true,
              userType: 'admin',
              subscriptionTier: 'enterprise', // Admin gets all features
              subscriptionStatus: 'active',
              businessProfile: {
                companyName: 'SimplePro Admin',
                ownerName: 'System Administrator',
                email: ADMIN_CONFIG.DEFAULT_EMAIL,
                phone: '+1 (555) 123-4567',
                address: 'System Administration',
              },
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              onboardingCompleted: true,
              permissions: ADMIN_CONFIG.PERMISSIONS,
              features: ADMIN_CONFIG.FEATURES,
              sessionExpiry: new Date(Date.now() + ADMIN_CONFIG.SESSION_TIMEOUT).toISOString(),
            };
            
            const adminToken = `admin_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            set({
              user: adminUser,
              token: adminToken,
              isAuthenticated: true,
              isLoading: false,
            });
            
            console.log('Admin login successful:', {
              email: trimmedEmail,
              timestamp: new Date().toISOString(),
              sessionExpiry: adminUser.sessionExpiry,
            });
            return;
          }
          
          // Check if this is test user login
          if (trimmedEmail === TEST_USER_CONFIG.email && password === TEST_USER_CONFIG.password) {
            // Create test user
            const testUser: User = {
              id: 'test_user_001',
              email: TEST_USER_CONFIG.email,
              emailVerified: true,
              userType: 'user',
              subscriptionTier: 'pro', // Give test user pro features for demo
              subscriptionStatus: 'active',
              businessProfile: {
                companyName: TEST_USER_CONFIG.companyName,
                ownerName: TEST_USER_CONFIG.ownerName,
                email: TEST_USER_CONFIG.email,
                phone: TEST_USER_CONFIG.phone,
                address: TEST_USER_CONFIG.address,
                taxId: TEST_USER_CONFIG.taxId,
              },
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              onboardingCompleted: true,
            };
            
            const testToken = `test_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            set({
              user: testUser,
              token: testToken,
              isAuthenticated: true,
              isLoading: false,
            });
            
            console.log('Test user login successful');
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
          console.error('Login error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      register: async (email, password, companyName) => {
        set({ isLoading: true, error: null });
        try {
          const trimmedEmail = email.toLowerCase().trim();
          
          // Prevent registration with admin email
          if (isAdminEmail(trimmedEmail)) {
            throw new Error('Cannot register with admin email address');
          }
          
          // Prevent registration with test user email
          if (trimmedEmail === TEST_USER_CONFIG.email) {
            throw new Error('Cannot register with test user email address');
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
          if (isAdminEmail(trimmedEmail)) {
            throw new Error('Admin password cannot be reset through this method. Contact system administrator.');
          }
          
          // Prevent password reset for test user email
          if (trimmedEmail === TEST_USER_CONFIG.email) {
            throw new Error('Test user password cannot be reset. Use default credentials.');
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
          const newToken = token.includes('admin') ? 
            `admin_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : 
            token.includes('test') ?
            `test_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` :
            'jwt_token_' + Date.now();
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
      
      hasAdminPermission: (permission: string) => {
        const user = get().user;
        if (!user || user.userType !== 'admin') return false;
        
        return user.permissions?.[permission] === true || false;
      },
      
      // Test user management
      createTestUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const testUser: User = {
            id: 'test_user_001',
            email: TEST_USER_CONFIG.email,
            emailVerified: true,
            userType: 'user',
            subscriptionTier: 'pro',
            subscriptionStatus: 'active',
            businessProfile: {
              companyName: TEST_USER_CONFIG.companyName,
              ownerName: TEST_USER_CONFIG.ownerName,
              email: TEST_USER_CONFIG.email,
              phone: TEST_USER_CONFIG.phone,
              address: TEST_USER_CONFIG.address,
              taxId: TEST_USER_CONFIG.taxId,
            },
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            onboardingCompleted: true,
          };
          
          set(state => ({
            testUsers: [...state.testUsers.filter(u => u.id !== testUser.id), testUser],
            isLoading: false,
          }));
          
          return testUser;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      getTestUsers: () => {
        return get().testUsers;
      },
      
      deleteTestUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            testUsers: state.testUsers.filter(u => u.id !== userId),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
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
      
      // Session management
      isSessionValid: () => {
        const user = get().user;
        if (!user || !user.sessionExpiry) return true; // Regular users don't have session expiry
        
        return new Date() < new Date(user.sessionExpiry);
      },
      
      getSessionTimeRemaining: () => {
        const user = get().user;
        if (!user || !user.sessionExpiry) return Infinity;
        
        const remaining = new Date(user.sessionExpiry).getTime() - Date.now();
        return Math.max(0, remaining);
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
  email: ADMIN_CONFIG.DEFAULT_EMAIL,
  password: ADMIN_CONFIG.DEFAULT_PASSWORD,
};

// Export test user credentials
export const TEST_USER_CREDENTIALS = {
  email: TEST_USER_CONFIG.email,
  password: TEST_USER_CONFIG.password,
};

// Export password validation function for use in components
export { validatePassword };