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
}

const DEFAULT_PROFILE: BusinessProfile = {
  name: '',
  owner: '',
  email: '',
  phone: '',
  address: '',
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