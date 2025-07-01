import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';

interface BusinessProfile {
  name: string;
  owner: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}

interface BusinessState {
  profile: BusinessProfile;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (updates: Partial<BusinessProfile>) => void;
  resetProfile: () => void;
  initializeForUser: (userId: string) => void;
  loadSampleDataForTestUser: () => void;
}

const DEFAULT_PROFILE: BusinessProfile = {
  name: '',
  owner: '',
  email: '',
  phone: '',
  address: '',
};

const TEST_USER_PROFILE: BusinessProfile = {
  name: 'Demo Construction Co.',
  owner: 'John Demo',
  email: 'testuser@simplepro.com',
  phone: '+1 (555) 123-4567',
  address: '123 Demo Street, Demo City, DC 12345',
};

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      isLoading: false,
      error: null,
      
      updateProfile: (updates) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        }));
        
        // Also update the auth store business profile
        useAuthStore.getState().updateProfile(updates);
      },
      
      resetProfile: () => {
        set({ profile: DEFAULT_PROFILE });
      },
      
      initializeForUser: (userId) => {
        // Check if this is the test user
        if (userId === 'test_user_001') {
          get().loadSampleDataForTestUser();
        } else {
          const { user } = useAuthStore.getState();
          if (user?.businessProfile) {
            set({
              profile: {
                name: user.businessProfile.companyName || '',
                owner: user.businessProfile.ownerName || '',
                email: user.businessProfile.email || '',
                phone: user.businessProfile.phone || '',
                address: user.businessProfile.address || '',
                logo: user.businessProfile.logo || '',
              }
            });
          } else {
            set({ profile: DEFAULT_PROFILE });
          }
        }
      },
      
      loadSampleDataForTestUser: () => {
        set({ profile: TEST_USER_PROFILE });
      },
    }),
    {
      name: 'business-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // Only persist if user is authenticated
        const { user } = useAuthStore.getState();
        return user ? { profile: state.profile } : {};
      },
    }
  )
);