import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, JobStatus, JobPriority } from '@/types';
import { jobs as initialJobs } from '@/mocks/jobs';
import { useQuoteStore } from './quoteStore';

interface JobState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchJobs: () => Promise<void>;
  getJobById: (id: string) => Job | undefined;
  getJobsByDate: (date: string) => Job[];
  getJobsByStatus: (status: JobStatus) => Job[];
  getJobsByPriority: (priority: JobPriority) => Job[];
  getJobsByQuoteId: (quoteId: string) => Job | undefined;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<Job>;
  
  // Quote-to-Job Conversion
  createJobFromQuote: (quoteId: string) => Promise<Job>;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: initialJobs,
      isLoading: false,
      error: null,
      
      fetchJobs: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we're just using the mock data
          set({ jobs: initialJobs, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      getJobById: (id) => {
        return get().jobs.find(job => job.id === id);
      },
      
      getJobsByDate: (date) => {
        return get().jobs.filter(job => job.scheduledDate === date);
      },
      
      getJobsByStatus: (status) => {
        return get().jobs.filter(job => job.status === status);
      },
      
      getJobsByPriority: (priority) => {
        return get().jobs.filter(job => job.priority === priority);
      },
      
      getJobsByQuoteId: (quoteId) => {
        return get().jobs.find(job => job.quoteId === quoteId);
      },
      
      addJob: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
          const newJob: Job = {
            id: Date.now().toString(),
            ...jobData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            jobs: [...state.jobs, newJob],
            isLoading: false,
          }));
          
          return newJob;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateJob: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedJobs = get().jobs.map(job => 
            job.id === id 
              ? { 
                  ...job, 
                  ...updates, 
                  updatedAt: new Date().toISOString() 
                } 
              : job
          );
          
          set({ jobs: updatedJobs, isLoading: false });
          
          const updatedJob = updatedJobs.find(job => job.id === id);
          if (!updatedJob) {
            throw new Error('Job not found');
          }
          
          return updatedJob;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      deleteJob: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            jobs: state.jobs.filter(job => job.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateJobStatus: async (id, status) => {
        return get().updateJob(id, { 
          status,
          ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
        });
      },
      
      createJobFromQuote: async (quoteId) => {
        set({ isLoading: true, error: null });
        try {
          // Get the quote from the quote store
          const quoteStore = useQuoteStore.getState();
          const quote = quoteStore.getQuoteById(quoteId);
          
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          if (quote.status !== 'approved' && quote.status !== 'scheduled') {
            throw new Error('Only approved or scheduled quotes can be converted to jobs');
          }
          
          // Check if a job already exists for this quote
          const existingJob = get().getJobsByQuoteId(quoteId);
          if (existingJob) {
            throw new Error('A job already exists for this quote');
          }
          
          // Create a new job from the quote
          const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
            customerId: quote.customerId,
            quoteId: quote.id,
            title: `Job from Quote #${quote.id}`,
            description: `Job created from quote #${quote.id}`,
            status: 'scheduled',
            priority: 'medium', // Default priority
            scheduledDate: quote.scheduledDate || new Date().toISOString().split('T')[0],
            scheduledTime: quote.scheduledTime || '09:00',
            notes: quote.notes,
            calendarEventId: quote.calendarEventId,
          };
          
          const createdJob = await get().addJob(newJob);
          
          // Update the quote to mark it as converted
          await quoteStore.updateQuote(quoteId, {
            status: 'converted',
            jobId: createdJob.id
          });
          
          return createdJob;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'job-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);