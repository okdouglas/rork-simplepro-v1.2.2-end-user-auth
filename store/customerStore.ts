import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, CustomerSegment, CustomerMetrics, CustomerCampaign, ServiceArea, ClientLocation, JobLocation } from '@/types';
import { useAuthStore } from './authStore';

interface CustomerState {
  customers: Customer[];
  metrics: CustomerMetrics;
  selectedSegment: CustomerSegment;
  isLoading: boolean;
  error: string | null;
  
  // Map data
  serviceAreas: ServiceArea[];
  clientLocations: ClientLocation[];
  jobLocations: JobLocation[];
  
  // Actions
  fetchCustomers: () => Promise<void>;
  fetchCustomerMetrics: () => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  filterCustomersBySegment: (segment: CustomerSegment) => Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  setSelectedSegment: (segment: CustomerSegment) => void;
  
  // User-specific actions
  initializeForUser: (userId: string) => void;
  canAddCustomer: () => boolean;
  getCustomerCount: () => number;
  
  // Map data actions
  fetchServiceAreas: () => Promise<void>;
  fetchClientLocations: () => Promise<void>;
  fetchJobLocations: () => Promise<void>;
  getServiceAreaById: (id: string) => ServiceArea | undefined;
  getClientLocationById: (id: string) => ClientLocation | undefined;
  getJobLocationById: (id: string) => JobLocation | undefined;
  
  // CRM Actions
  getHighValueCustomers: () => Customer[];
  getRecurringCustomers: () => Customer[];
  getAtRiskCustomers: () => Customer[];
  getNewCustomers: () => Customer[];
  getCustomersByServiceArea: (area: string) => Customer[];
  calculateCustomerLifetimeValue: (customerId: string) => number;
  getCustomersNeedingFollowUp: () => Customer[];
  getCustomersByEquipmentType: (type: string) => Customer[];
  addCustomerCampaign: (customerId: string, campaignType: string) => Promise<void>;
  
  // Marketing Automation
  addCustomersToCampaign: (customerIds: string[], campaignType: string) => Promise<void>;
  removeCustomerFromCampaign: (customerId: string, campaignId: string) => Promise<void>;
  getCustomersByCampaign: (campaignType: string) => Customer[];
  getCustomersForAutomaticCampaigns: () => {
    newCustomers: Customer[];
    completedServiceCustomers: Customer[];
    inactiveCustomers: Customer[];
  };
  autoAddCustomersToCampaigns: () => Promise<void>;
  getCampaignStatistics: () => {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    scheduledCampaigns: number;
    campaignsByType: Record<string, number>;
    customerCoverage: number;
  };
}

// Empty initial state for new users
const EMPTY_METRICS: CustomerMetrics = {
  totalCustomers: 0,
  activeCustomers: 0,
  inactiveCustomers: 0,
  newCustomersThisMonth: 0,
  growthRate: 0,
  averageLifetimeValue: 0,
  repeatCustomerRate: 0,
  acquisitionCost: 0,
  segmentCounts: {
    all: 0,
    new: 0,
    recurring: 0,
    vip: 0,
    at_risk: 0,
  },
  campaignStats: {
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    scheduledCampaigns: 0,
    campaignsByType: {
      reminder: 0,
      seasonal: 0,
      win_back: 0,
      new_customer: 0,
      follow_up: 0,
    },
    customerCoverage: 0,
  },
};

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      metrics: EMPTY_METRICS,
      selectedSegment: 'all',
      isLoading: false,
      error: null,
      
      // Map data
      serviceAreas: [],
      clientLocations: [],
      jobLocations: [],
      
      fetchCustomers: async () => {
        set({ isLoading: true, error: null });
        try {
          // For new users, customers array is already empty
          // In a real app, this would fetch user-specific customers from API
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchCustomerMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const customers = get().customers;
          const totalCustomers = customers.length;
          
          // Calculate metrics based on actual customer data
          const metrics: CustomerMetrics = {
            totalCustomers,
            activeCustomers: customers.filter(c => c.segment !== 'at_risk').length,
            inactiveCustomers: customers.filter(c => c.segment === 'at_risk').length,
            newCustomersThisMonth: customers.filter(c => {
              const createdDate = new Date(c.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length,
            growthRate: 0, // Would calculate based on historical data
            averageLifetimeValue: customers.length > 0 
              ? customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) / customers.length 
              : 0,
            repeatCustomerRate: 0, // Would calculate based on job history
            acquisitionCost: 0, // Would calculate based on marketing spend
            segmentCounts: {
              all: totalCustomers,
              new: customers.filter(c => c.segment === 'new').length,
              recurring: customers.filter(c => c.segment === 'recurring').length,
              vip: customers.filter(c => c.segment === 'vip').length,
              at_risk: customers.filter(c => c.segment === 'at_risk').length,
            },
            campaignStats: get().getCampaignStatistics(),
          };
          
          set({ metrics, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // Map data actions
      fetchServiceAreas: async () => {
        set({ isLoading: true, error: null });
        try {
          // For new users, start with empty service areas
          set({ serviceAreas: [], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchClientLocations: async () => {
        set({ isLoading: true, error: null });
        try {
          set({ clientLocations: [], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchJobLocations: async () => {
        set({ isLoading: true, error: null });
        try {
          set({ jobLocations: [], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      getServiceAreaById: (id) => {
        return get().serviceAreas.find(area => area.id === id);
      },
      
      getClientLocationById: (id) => {
        return get().clientLocations.find(client => client.id === id);
      },
      
      getJobLocationById: (id) => {
        return get().jobLocations.find(job => job.id === id);
      },
      
      getCustomerById: (id) => {
        return get().customers.find(customer => customer.id === id);
      },
      
      searchCustomers: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().customers.filter(customer => 
          customer.name.toLowerCase().includes(lowerQuery) ||
          customer.phone.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(lowerQuery)) ||
          customer.address.toLowerCase().includes(lowerQuery) ||
          (customer.city && customer.city.toLowerCase().includes(lowerQuery)) ||
          (customer.zip && customer.zip.includes(query))
        );
      },
      
      filterCustomersBySegment: (segment) => {
        if (segment === 'all') {
          return get().customers;
        }
        return get().customers.filter(customer => customer.segment === segment);
      },
      
      addCustomer: async (customerData) => {
        const { user, canCreateCustomer } = useAuthStore.getState();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        if (!canCreateCustomer()) {
          throw new Error('Customer limit reached. Please upgrade your plan.');
        }
        
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();
          const newCustomer: Customer = {
            id: Date.now().toString(),
            ...customerData,
            createdAt: now,
            updatedAt: now,
          };
          
          set(state => ({
            customers: [...state.customers, newCustomer],
            isLoading: false,
          }));
          
          // Refresh metrics
          await get().fetchCustomerMetrics();
          
          return newCustomer;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateCustomer: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCustomers = get().customers.map(customer => 
            customer.id === id 
              ? { 
                  ...customer, 
                  ...updates,
                  updatedAt: new Date().toISOString(),
                } 
              : customer
          );
          
          set({ customers: updatedCustomers, isLoading: false });
          
          const updatedCustomer = updatedCustomers.find(customer => customer.id === id);
          if (!updatedCustomer) {
            throw new Error('Customer not found');
          }
          
          // Refresh metrics
          await get().fetchCustomerMetrics();
          
          return updatedCustomer;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      deleteCustomer: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            customers: state.customers.filter(customer => customer.id !== id),
            isLoading: false,
          }));
          
          // Refresh metrics
          await get().fetchCustomerMetrics();
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      setSelectedSegment: (segment) => {
        set({ selectedSegment: segment });
      },
      
      // User-specific actions
      initializeForUser: (userId) => {
        // Reset to empty state for new user
        set({
          customers: [],
          metrics: EMPTY_METRICS,
          selectedSegment: 'all',
          serviceAreas: [],
          clientLocations: [],
          jobLocations: [],
        });
      },
      
      canAddCustomer: () => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        
        const currentCount = get().customers.length;
        const limit = user.subscriptionTier === 'free' ? 1 : 
                     user.subscriptionTier === 'basic' ? 25 : Infinity;
        
        return currentCount < limit;
      },
      
      getCustomerCount: () => {
        return get().customers.length;
      },
      
      // CRM Actions (simplified for new users)
      getHighValueCustomers: () => {
        return get().customers.filter(customer => customer.segment === 'vip');
      },
      
      getRecurringCustomers: () => {
        return get().customers.filter(customer => customer.segment === 'recurring');
      },
      
      getAtRiskCustomers: () => {
        return get().customers.filter(customer => customer.segment === 'at_risk');
      },
      
      getNewCustomers: () => {
        return get().customers.filter(customer => customer.segment === 'new');
      },
      
      getCustomersByServiceArea: (area) => {
        return get().customers.filter(customer => 
          customer.serviceArea === area || 
          customer.city === area
        );
      },
      
      calculateCustomerLifetimeValue: (customerId) => {
        const customer = get().getCustomerById(customerId);
        return customer?.lifetimeValue || 0;
      },
      
      getCustomersNeedingFollowUp: () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        return get().customers.filter(customer => {
          if (!customer.lastServiceDate) return false;
          const lastServiceDate = new Date(customer.lastServiceDate);
          return lastServiceDate < sixMonthsAgo;
        });
      },
      
      getCustomersByEquipmentType: (type) => {
        return get().customers.filter(customer => 
          customer.property?.equipment?.some(equipment => 
            equipment.type.toLowerCase() === type.toLowerCase()
          )
        );
      },
      
      addCustomerCampaign: async (customerId, campaignType) => {
        set({ isLoading: true, error: null });
        try {
          const customer = get().getCustomerById(customerId);
          if (!customer) {
            throw new Error('Customer not found');
          }
          
          const now = new Date();
          const futureDate = new Date();
          futureDate.setDate(now.getDate() + 7);
          
          const newCampaign: CustomerCampaign = {
            id: `camp${Date.now()}`,
            type: campaignType as any,
            status: 'scheduled',
            scheduledDate: futureDate.toISOString(),
          };
          
          const existingCampaign = customer.campaigns?.find(
            camp => camp.type === campaignType && 
            (camp.status === 'scheduled' || camp.status === 'sent')
          );
          
          if (existingCampaign) {
            set({ isLoading: false });
            return;
          }
          
          const updatedCampaigns = [...(customer.campaigns || []), newCampaign];
          
          await get().updateCustomer(customerId, {
            campaigns: updatedCampaigns,
            lastContactDate: now.toISOString(),
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      // Marketing Automation (simplified)
      addCustomersToCampaign: async (customerIds, campaignType) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date();
          const futureDate = new Date();
          futureDate.setDate(now.getDate() + 7);
          
          const campaignId = `camp${Date.now()}`;
          
          const updatedCustomers = get().customers.map(customer => {
            if (customerIds.includes(customer.id)) {
              const existingCampaign = customer.campaigns?.find(
                camp => camp.type === campaignType && 
                (camp.status === 'scheduled' || camp.status === 'sent')
              );
              
              if (existingCampaign) {
                return customer;
              }
              
              const newCampaign: CustomerCampaign = {
                id: campaignId,
                type: campaignType as any,
                status: 'scheduled',
                scheduledDate: futureDate.toISOString(),
              };
              
              return {
                ...customer,
                campaigns: [...(customer.campaigns || []), newCampaign],
                lastContactDate: now.toISOString(),
                updatedAt: now.toISOString(),
              };
            }
            return customer;
          });
          
          set({ customers: updatedCustomers, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      removeCustomerFromCampaign: async (customerId, campaignId) => {
        set({ isLoading: true, error: null });
        try {
          const customer = get().getCustomerById(customerId);
          if (!customer) {
            throw new Error('Customer not found');
          }
          
          const updatedCampaigns = (customer.campaigns || []).filter(
            campaign => campaign.id !== campaignId
          );
          
          await get().updateCustomer(customerId, {
            campaigns: updatedCampaigns,
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      getCustomersByCampaign: (campaignType) => {
        return get().customers.filter(customer => 
          customer.campaigns?.some(campaign => 
            campaign.type === campaignType && 
            (campaign.status === 'scheduled' || campaign.status === 'sent')
          )
        );
      },
      
      getCustomersForAutomaticCampaigns: () => {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        const newCustomers = get().customers.filter(customer => {
          const createdAt = new Date(customer.createdAt);
          return createdAt >= thirtyDaysAgo;
        });
        
        const completedServiceCustomers = get().customers.filter(customer => {
          if (!customer.lastServiceDate) return false;
          const lastServiceDate = new Date(customer.lastServiceDate);
          return lastServiceDate >= thirtyDaysAgo;
        });
        
        const inactiveCustomers = get().customers.filter(customer => {
          if (!customer.lastServiceDate) return true;
          const lastServiceDate = new Date(customer.lastServiceDate);
          return lastServiceDate <= sixMonthsAgo;
        });
        
        return {
          newCustomers,
          completedServiceCustomers,
          inactiveCustomers,
        };
      },
      
      autoAddCustomersToCampaigns: async () => {
        try {
          const { 
            newCustomers, 
            completedServiceCustomers, 
            inactiveCustomers 
          } = get().getCustomersForAutomaticCampaigns();
          
          for (const customer of newCustomers) {
            await get().addCustomerCampaign(customer.id, 'new_customer');
          }
          
          for (const customer of completedServiceCustomers) {
            await get().addCustomerCampaign(customer.id, 'reminder');
          }
          
          for (const customer of inactiveCustomers) {
            await get().addCustomerCampaign(customer.id, 'win_back');
          }
        } catch (error) {
          console.error('Error auto-adding customers to campaigns:', error);
          throw error;
        }
      },
      
      getCampaignStatistics: () => {
        const allCustomers = get().customers;
        const totalCustomers = allCustomers.length;
        
        let totalCampaigns = 0;
        let activeCampaigns = 0;
        let completedCampaigns = 0;
        let scheduledCampaigns = 0;
        const campaignsByType: Record<string, number> = {
          reminder: 0,
          seasonal: 0,
          win_back: 0,
          new_customer: 0,
          follow_up: 0,
        };
        
        let customersWithCampaigns = 0;
        
        allCustomers.forEach(customer => {
          if (customer.campaigns && customer.campaigns.length > 0) {
            customersWithCampaigns++;
            
            customer.campaigns.forEach(campaign => {
              totalCampaigns++;
              
              if (campaign.status === 'scheduled' || campaign.status === 'sent') activeCampaigns++;
              if (campaign.status === 'completed') completedCampaigns++;
              if (campaign.status === 'scheduled') scheduledCampaigns++;
              
              if (campaignsByType[campaign.type] !== undefined) {
                campaignsByType[campaign.type]++;
              }
            });
          }
        });
        
        const customerCoverage = totalCustomers > 0 
          ? Math.round((customersWithCampaigns / totalCustomers) * 100) 
          : 0;
        
        return {
          totalCampaigns,
          activeCampaigns,
          completedCampaigns,
          scheduledCampaigns,
          campaignsByType,
          customerCoverage,
        };
      },
    }),
    {
      name: 'customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // Only persist if user is authenticated
        const { user } = useAuthStore.getState();
        return user ? {
          customers: state.customers,
          metrics: state.metrics,
          selectedSegment: state.selectedSegment,
          serviceAreas: state.serviceAreas,
          clientLocations: state.clientLocations,
          jobLocations: state.jobLocations,
        } : {};
      },
    }
  )
);