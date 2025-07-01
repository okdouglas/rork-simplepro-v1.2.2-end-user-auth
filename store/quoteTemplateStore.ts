import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuoteItem } from '@/types';
import { quoteTemplates as initialTemplates } from '@/mocks/quoteTemplates';

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

interface QuoteTemplateState {
  templates: QuoteTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTemplates: () => Promise<void>;
  getTemplateById: (id: string) => QuoteTemplate | undefined;
  getTemplatesByCategory: (category: string) => QuoteTemplate[];
  addTemplate: (template: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<QuoteTemplate>;
  updateTemplate: (id: string, updates: Partial<QuoteTemplate>) => Promise<QuoteTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useQuoteTemplates = create<QuoteTemplateState>()(
  persist(
    (set, get) => ({
      templates: initialTemplates,
      isLoading: false,
      error: null,
      
      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we're just using the mock data
          set({ templates: initialTemplates, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      getTemplateById: (id) => {
        return get().templates.find(template => template.id === id);
      },
      
      getTemplatesByCategory: (category) => {
        return get().templates.filter(template => template.category === category);
      },
      
      addTemplate: async (templateData) => {
        set({ isLoading: true, error: null });
        try {
          const newTemplate: QuoteTemplate = {
            id: Date.now().toString(),
            ...templateData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            templates: [...state.templates, newTemplate],
            isLoading: false,
          }));
          
          return newTemplate;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateTemplate: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTemplates = get().templates.map(template => 
            template.id === id 
              ? { 
                  ...template, 
                  ...updates, 
                  updatedAt: new Date().toISOString() 
                } 
              : template
          );
          
          set({ templates: updatedTemplates, isLoading: false });
          
          const updatedTemplate = updatedTemplates.find(template => template.id === id);
          if (!updatedTemplate) {
            throw new Error('Template not found');
          }
          
          return updatedTemplate;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      deleteTemplate: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            templates: state.templates.filter(template => template.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'quote-templates-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);