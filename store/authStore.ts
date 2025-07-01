import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  businessProfile?: {
    companyName?: string;
    ownerName?: string;
    phone?: string;
    address?: string;
  };
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'trial';
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User }>;
  logout: () => void;
  register: (email: string, password: string, companyName?: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<User>) => void;
  clearError: () => void;
}

// Test credentials
export const ADMIN_TEST_CREDENTIALS = {
  email: 'admin@simplepro.com',
  password: 'Admin007!',
};

export const TEST_USER_CREDENTIALS = {
  email: 'testuser@simplepro.com',
  password: 'TestUser123!',
};

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: 'admin_user',
    email: ADMIN_TEST_CREDENTIALS.email,
    emailVerified: true,
    role: 'admin',
    businessProfile: {
      companyName: 'SimplePro Admin',
      ownerName: 'Admin User',
      phone: '+1 (555) 123-4567',
      address: '123 Admin St, Admin City, AC 12345',
    },
    subscriptionTier: 'enterprise',
    subscriptionStatus: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'test_user_001',
    email: TEST_USER_CREDENTIALS.email,
    emailVerified: true,
    role: 'user',
    businessProfile: {
      companyName: 'Demo Construction Co.',
      ownerName: 'John Demo',
      phone: '+1 (555) 987-6543',
      address: '456 Demo Ave, Demo City, DC 54321',
    },
    subscriptionTier: 'pro',
    subscriptionStatus: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const validatePassword = (password: string, isLogin: boolean = true): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (isLogin) {
    // More lenient validation for login
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
  } else {
    // Stricter validation for registration
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
  }
  
  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const trimmedEmail = email.toLowerCase().trim();
          
          // Check admin credentials
          if (trimmedEmail === ADMIN_TEST_CREDENTIALS.email && password === ADMIN_TEST_CREDENTIALS.password) {
            const adminUser = MOCK_USERS.find(u => u.email === ADMIN_TEST_CREDENTIALS.email);
            if (adminUser) {
              const updatedUser = { ...adminUser, lastLogin: new Date().toISOString() };
              set({ 
                user: updatedUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              return { user: updatedUser };
            }
          }
          
          // Check test user credentials
          if (trimmedEmail === TEST_USER_CREDENTIALS.email && password === TEST_USER_CREDENTIALS.password) {
            const testUser = MOCK_USERS.find(u => u.email === TEST_USER_CREDENTIALS.email);
            if (testUser) {
              const updatedUser = { ...testUser, lastLogin: new Date().toISOString() };
              set({ 
                user: updatedUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              return { user: updatedUser };
            }
          }
          
          // For any other email/password combination, create a new user
          const newUser: User = {
            id: 'user_' + Date.now(),
            email: trimmedEmail,
            emailVerified: true,
            role: 'user',
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return { user: newUser };
          
        } catch (error) {
          set({ 
            error: 'Login failed. Please try again.', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      register: async (email: string, password: string, companyName?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user already exists
          const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            throw new Error('User already exists with this email');
          }
          
          // Create new user
          const newUser: User = {
            id: 'user_' + Date.now(),
            email: email.toLowerCase().trim(),
            emailVerified: false,
            role: 'user',
            businessProfile: companyName ? { companyName } : undefined,
            subscriptionTier: 'free',
            subscriptionStatus: 'trial',
            createdAt: new Date().toISOString(),
          };
          
          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
        } catch (error) {
          set({ 
            error: (error as Error).message, 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { user } = get();
          if (!user) {
            throw new Error('No user found');
          }
          
          if (code.length !== 6) {
            throw new Error('Invalid verification code');
          }
          
          const updatedUser = { ...user, emailVerified: true };
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
          
        } catch (error) {
          set({ 
            error: (error as Error).message, 
            isLoading: false 
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: 'Failed to send reset email', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateProfile: (profile: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...profile } });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);