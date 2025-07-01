import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteStatus, QuoteCommunication } from '@/types';
import { quotes as initialQuotes } from '@/mocks/quotes';
import { 
  sendSMS, 
  sendEmail, 
  generateQuotePDF,
  generateInvoicePDF,
  createSignableDocument, 
  checkSignatureStatus,
  storeCommunicationHistory,
  getCommunicationHistory,
  exportToQuickBooks,
  exportMultipleQuotesToQuickBooks,
  exportQuotesToExcel
} from '@/services/twilio';
import { useCustomerStore } from './customerStore';

interface QuoteState {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchQuotes: () => Promise<void>;
  getQuoteById: (id: string) => Quote | undefined;
  getQuotesByStatus: (status: QuoteStatus) => Quote[];
  getQuotesByCustomerId: (customerId: string) => Quote[];
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<Quote>;
  deleteQuote: (id: string) => Promise<void>;
  
  // Bulk operations
  bulkUpdateQuotes: (ids: string[], updates: Partial<Quote>) => Promise<Quote[]>;
  bulkDeleteQuotes: (ids: string[]) => Promise<void>;
  bulkExportQuotes: (ids: string[]) => Promise<string[]>; // Returns array of PDF URLs
  
  // Search and filter
  searchQuotes: (query: string) => Quote[];
  filterQuotesByDateRange: (startDate: string, endDate: string) => Quote[];
  filterQuotesByAmountRange: (minAmount: number, maxAmount: number) => Quote[];
  getExpiringQuotes: (daysThreshold: number) => Quote[];
  
  // Customer helpers
  getCustomerNameById: (customerId: string) => string | undefined;
  
  // Workflow Actions
  sendQuote: (id: string) => Promise<Quote>;
  approveQuote: (id: string, signedBy?: string) => Promise<Quote>;
  rejectQuote: (id: string, reason?: string) => Promise<Quote>;
  scheduleQuote: (id: string, date: string, time: string) => Promise<Quote>;
  convertQuoteToJob: (id: string) => Promise<{ quote: Quote, jobId: string }>;
  
  // Twilio Integration Actions
  sendQuoteViaSMS: (id: string, phoneNumber: string, message?: string) => Promise<Quote>;
  sendQuoteViaEmail: (id: string, email: string, subject?: string, message?: string) => Promise<Quote>;
  generatePDF: (id: string) => Promise<string>;
  createInvoicePDF: (quoteId: string, invoiceId: string, dueDate: string, notes?: string) => Promise<string>;
  createSignableQuote: (id: string, customerName: string, customerEmail: string) => Promise<{ quote: Quote, signatureUrl: string }>;
  checkQuoteSignatureStatus: (id: string) => Promise<{ status: string, signedBy?: string, signedAt?: string }>;
  getQuoteCommunicationHistory: (id: string) => Promise<QuoteCommunication[]>;
  exportQuoteToQuickBooks: (id: string) => Promise<{ success: boolean, fileUri: string }>;
  
  // QuickBooks Integration
  exportQuotesToQuickBooks: (ids: string[], type: 'estimate' | 'invoice' | 'sales_receipt') => Promise<{ success: boolean, fileUris: string[] }>;
  exportQuotesToExcel: (ids: string[]) => Promise<{ success: boolean, fileUri: string }>;
  
  // Analytics
  getQuoteConversionRate: () => number;
  getQuoteValueByStatus: (status: QuoteStatus) => number;
  getQuoteCountByStatus: (status: QuoteStatus) => number;
  getAverageQuoteValue: () => number;
  getMonthlyQuoteData: () => { month: string; revenue: number; expenses: number; profit: number }[];
  getWorkflowMetrics: () => {
    avgTimeToApproval: number; // in days
    avgTimeToSchedule: number; // in days
    avgTimeToConversion: number; // in days
    conversionRate: number; // percentage
  };
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: initialQuotes,
      isLoading: false,
      error: null,
      
      fetchQuotes: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we're just using the mock data
          set({ quotes: initialQuotes, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      getQuoteById: (id) => {
        return get().quotes.find(quote => quote.id === id);
      },
      
      getQuotesByStatus: (status) => {
        return get().quotes.filter(quote => quote.status === status);
      },
      
      getQuotesByCustomerId: (customerId) => {
        return get().quotes.filter(quote => quote.customerId === customerId);
      },
      
      addQuote: async (quoteData) => {
        set({ isLoading: true, error: null });
        try {
          const newQuote: Quote = {
            id: Date.now().toString(),
            ...quoteData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            quotes: [...state.quotes, newQuote],
            isLoading: false,
          }));
          
          return newQuote;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateQuote: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedQuotes = get().quotes.map(quote => 
            quote.id === id 
              ? { 
                  ...quote, 
                  ...updates, 
                  updatedAt: new Date().toISOString() 
                } 
              : quote
          );
          
          set({ quotes: updatedQuotes, isLoading: false });
          
          const updatedQuote = updatedQuotes.find(quote => quote.id === id);
          if (!updatedQuote) {
            throw new Error('Quote not found');
          }
          
          return updatedQuote;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      deleteQuote: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            quotes: state.quotes.filter(quote => quote.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      // Bulk operations
      bulkUpdateQuotes: async (ids, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedQuotes = get().quotes.map(quote => 
            ids.includes(quote.id)
              ? { 
                  ...quote, 
                  ...updates, 
                  updatedAt: new Date().toISOString() 
                } 
              : quote
          );
          
          set({ quotes: updatedQuotes, isLoading: false });
          
          return updatedQuotes.filter(quote => ids.includes(quote.id));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      bulkDeleteQuotes: async (ids) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            quotes: state.quotes.filter(quote => !ids.includes(quote.id)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      bulkExportQuotes: async (ids) => {
        set({ isLoading: true, error: null });
        try {
          const pdfUrls: string[] = [];
          
          // If no IDs provided, export all quotes
          const quotesToExport = ids.length > 0 
            ? get().quotes.filter(quote => ids.includes(quote.id))
            : get().quotes;
          
          for (const quote of quotesToExport) {
            const pdfUrl = await get().generatePDF(quote.id);
            pdfUrls.push(pdfUrl);
          }
          
          set({ isLoading: false });
          return pdfUrls;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      // Search and filter
      searchQuotes: (query) => {
        const searchTerm = query.toLowerCase();
        return get().quotes.filter(quote => {
          const customerName = get().getCustomerNameById(quote.customerId)?.toLowerCase() || '';
          return (
            quote.id.toLowerCase().includes(searchTerm) ||
            customerName.includes(searchTerm) ||
            (quote.title || '').toLowerCase().includes(searchTerm) ||
            quote.total.toString().includes(searchTerm)
          );
        });
      },
      
      filterQuotesByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return get().quotes.filter(quote => {
          const createdAt = new Date(quote.createdAt);
          return createdAt >= start && createdAt <= end;
        });
      },
      
      filterQuotesByAmountRange: (minAmount, maxAmount) => {
        return get().quotes.filter(quote => 
          quote.total >= minAmount && quote.total <= maxAmount
        );
      },
      
      getExpiringQuotes: (daysThreshold) => {
        const now = new Date();
        const thresholdDate = new Date(now);
        thresholdDate.setDate(now.getDate() + daysThreshold);
        
        return get().quotes.filter(quote => {
          if (!quote.expiresAt) return false;
          
          const expiryDate = new Date(quote.expiresAt);
          return expiryDate <= thresholdDate && expiryDate >= now;
        });
      },
      
      // Customer helpers
      getCustomerNameById: (customerId) => {
        // This is a bit of a hack to access the customer store from within this store
        // In a real app, you might want to use a more robust solution
        const customerStore = useCustomerStore.getState();
        const customer = customerStore.getCustomerById(customerId);
        return customer?.name;
      },
      
      // Workflow Actions
      sendQuote: async (id) => {
        const quote = get().getQuoteById(id);
        if (!quote) {
          throw new Error('Quote not found');
        }
        
        if (quote.status !== 'draft') {
          throw new Error('Only draft quotes can be sent');
        }
        
        return get().updateQuote(id, { 
          status: 'sent',
          sentAt: new Date().toISOString(),
          // Set expiration date to 30 days from now if not already set
          expiresAt: quote.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      },
      
      approveQuote: async (id, signedBy) => {
        const quote = get().getQuoteById(id);
        if (!quote) {
          throw new Error('Quote not found');
        }
        
        if (quote.status !== 'sent') {
          throw new Error('Only sent quotes can be approved');
        }
        
        // Generate a fake signature ID
        const signatureId = `sig_${Date.now()}`;
        
        return get().updateQuote(id, { 
          status: 'approved',
          approvedAt: new Date().toISOString(),
          signatureId,
          signedBy: signedBy || 'Customer',
          signedAt: new Date().toISOString()
        });
      },
      
      rejectQuote: async (id, reason) => {
        const quote = get().getQuoteById(id);
        if (!quote) {
          throw new Error('Quote not found');
        }
        
        if (quote.status !== 'sent') {
          throw new Error('Only sent quotes can be rejected');
        }
        
        return get().updateQuote(id, { 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          notes: reason ? `Rejection reason: ${reason}` : quote.notes
        });
      },
      
      scheduleQuote: async (id, date, time) => {
        const quote = get().getQuoteById(id);
        if (!quote) {
          throw new Error('Quote not found');
        }
        
        if (quote.status !== 'approved') {
          throw new Error('Only approved quotes can be scheduled');
        }
        
        // Generate a fake calendar event ID
        const calendarEventId = `cal_${Date.now()}`;
        
        return get().updateQuote(id, { 
          status: 'scheduled',
          scheduledDate: date,
          scheduledTime: time,
          calendarEventId
        });
      },
      
      convertQuoteToJob: async (id) => {
        const quote = get().getQuoteById(id);
        if (!quote) {
          throw new Error('Quote not found');
        }
        
        if (quote.status !== 'scheduled' && quote.status !== 'approved') {
          throw new Error('Only scheduled or approved quotes can be converted to jobs');
        }
        
        // This would normally call the job store to create a job
        // For now, we'll just update the quote status and return a fake job ID
        const jobId = `job_${Date.now()}`;
        
        const updatedQuote = await get().updateQuote(id, { 
          status: 'converted',
          jobId
        });
        
        return { quote: updatedQuote, jobId };
      },
      
      // Twilio Integration Actions
      sendQuoteViaSMS: async (id, phoneNumber, message) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Generate PDF for the quote
          const pdfUrl = await generateQuotePDF(id);
          
          // Default message if not provided
          const smsMessage = message || 
            `Your quote #${id} for $${quote.total.toFixed(2)} is ready. View and sign here: ${pdfUrl}`;
          
          // Send SMS via Twilio
          const smsResult = await sendSMS(phoneNumber, smsMessage, pdfUrl);
          
          // Store communication history
          await storeCommunicationHistory(id, 'sms', {
            to: phoneNumber,
            sentAt: smsResult.sentAt,
            status: smsResult.status,
            messageId: smsResult.sid,
            mediaUrl: pdfUrl
          });
          
          // Update quote status if it's still in draft
          if (quote.status === 'draft') {
            return get().updateQuote(id, {
              status: 'sent',
              sentAt: new Date().toISOString(),
              pdfUrl,
              // Set expiration date to 30 days from now if not already set
              expiresAt: quote.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          } else {
            // Just update the PDF URL if already sent
            return get().updateQuote(id, { pdfUrl });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      sendQuoteViaEmail: async (id, email, subject, message) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Generate PDF for the quote
          const pdfUrl = await generateQuotePDF(id);
          
          // Default subject and message if not provided
          const emailSubject = subject || `Your Quote #${id} is Ready`;
          const emailMessage = message || 
            `<p>Thank you for your interest. Your quote #${id} for $${quote.total.toFixed(2)} is attached.</p>
             <p>You can review and sign the quote by clicking the button below:</p>
             <p><a href="${pdfUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View and Sign Quote</a></p>
             <p>If you have any questions, please don't hesitate to contact us.</p>`;
          
          // Send email via SendGrid
          const emailResult = await sendEmail(email, emailSubject, emailMessage, [
            {
              content: 'base64-encoded-content', // In a real app, this would be the base64 encoded PDF
              filename: `Quote_${id}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            }
          ]);
          
          // Store communication history
          await storeCommunicationHistory(id, 'email', {
            to: email,
            sentAt: emailResult.sentAt,
            status: emailResult.status,
            messageId: emailResult.messageId,
            mediaUrl: pdfUrl
          });
          
          // Update quote status if it's still in draft
          if (quote.status === 'draft') {
            return get().updateQuote(id, {
              status: 'sent',
              sentAt: new Date().toISOString(),
              pdfUrl,
              // Set expiration date to 30 days from now if not already set
              expiresAt: quote.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          } else {
            // Just update the PDF URL if already sent
            return get().updateQuote(id, { pdfUrl });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      generatePDF: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Generate PDF for the quote
          const pdfUrl = await generateQuotePDF(id, {
            includeSignature: true,
            includeTerms: true,
            includeCompanyLogo: true
          });
          
          // Update quote with PDF URL
          await get().updateQuote(id, { pdfUrl });
          
          return pdfUrl;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      createInvoicePDF: async (quoteId, invoiceId, dueDate, notes) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(quoteId);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Generate invoice PDF
          const pdfUrl = await generateInvoicePDF(quoteId, invoiceId, dueDate, notes);
          
          return pdfUrl;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      createSignableQuote: async (id, customerName, customerEmail) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Create signable document
          const signatureResult = await createSignableDocument(id, customerName, customerEmail);
          
          // Update quote with signature URL and ID
          const updatedQuote = await get().updateQuote(id, {
            signatureUrl: signatureResult.signatureUrl,
            signatureId: signatureResult.signatureId
          });
          
          return {
            quote: updatedQuote,
            signatureUrl: signatureResult.signatureUrl
          };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      checkQuoteSignatureStatus: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          if (!quote.signatureId) {
            throw new Error('Quote does not have a signature request');
          }
          
          // Check signature status
          const statusResult = await checkSignatureStatus(quote.signatureId);
          
          // If signed, update quote status
          if (statusResult.status === 'completed' && quote.status === 'sent') {
            await get().updateQuote(id, {
              status: 'approved',
              approvedAt: statusResult.signedAt,
              signedBy: statusResult.signedBy,
              signedAt: statusResult.signedAt
            });
          }
          
          return {
            status: statusResult.status,
            signedBy: statusResult.signedBy,
            signedAt: statusResult.signedAt
          };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      getQuoteCommunicationHistory: async (id) => {
        try {
          const history = await getCommunicationHistory(id);
          return history;
        } catch (error) {
          console.error('Error getting communication history:', error);
          return [];
        }
      },
      
      exportQuoteToQuickBooks: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const quote = get().getQuoteById(id);
          if (!quote) {
            throw new Error('Quote not found');
          }
          
          // Get customer data
          const customerStore = useCustomerStore.getState();
          const customer = customerStore.getCustomerById(quote.customerId);
          
          if (!customer) {
            throw new Error('Customer not found');
          }
          
          // Format quote data for QuickBooks
          const quoteData = {
            id: quote.id,
            customerId: customer.id,
            customerName: customer.name,
            createdAt: quote.createdAt,
            expiresAt: quote.expiresAt,
            items: quote.items,
            subtotal: quote.subtotal,
            tax: quote.tax,
            total: quote.total,
            notes: quote.notes
          };
          
          // Export to QuickBooks format
          const result = await exportToQuickBooks(quoteData, 'invoice');
          
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      // QuickBooks Integration
      exportQuotesToQuickBooks: async (ids, type) => {
        set({ isLoading: true, error: null });
        try {
          // Get quotes to export
          const quotesToExport = ids.length > 0 
            ? get().quotes.filter(quote => ids.includes(quote.id))
            : get().quotes;
          
          if (quotesToExport.length === 0) {
            throw new Error('No quotes to export');
          }
          
          // Get customer store
          const customerStore = useCustomerStore.getState();
          
          // Process each quote
          const fileUris: string[] = [];
          
          for (const quote of quotesToExport) {
            const customer = customerStore.getCustomerById(quote.customerId);
            
            if (!customer) {
              console.warn(`Customer not found for quote ${quote.id}, skipping`);
              continue;
            }
            
            // Format quote data for QuickBooks
            const quoteData = {
              id: quote.id,
              customerId: customer.id,
              customerName: customer.name,
              createdAt: quote.createdAt,
              expiresAt: quote.expiresAt,
              items: quote.items,
              subtotal: quote.subtotal,
              tax: quote.tax,
              total: quote.total,
              notes: quote.notes,
              status: quote.status,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            };
            
            // Export to QuickBooks format
            const result = await exportToQuickBooks(quoteData, type);
            
            if (result.success && result.fileUri) {
              fileUris.push(result.fileUri);
            }
          }
          
          return {
            success: fileUris.length > 0,
            fileUris
          };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Export to Excel
      exportQuotesToExcel: async (ids) => {
        set({ isLoading: true, error: null });
        try {
          // Get quotes to export
          const quotesToExport = ids.length > 0 
            ? get().quotes.filter(quote => ids.includes(quote.id))
            : get().quotes;
          
          if (quotesToExport.length === 0) {
            throw new Error('No quotes to export');
          }
          
          // Get customer store
          const customerStore = useCustomerStore.getState();
          
          // Format quotes for Excel export
          const formattedQuotes = quotesToExport.map(quote => {
            const customer = customerStore.getCustomerById(quote.customerId);
            return {
              id: quote.id,
              customerName: customer?.name || 'Unknown',
              createdAt: quote.createdAt,
              expiresAt: quote.expiresAt,
              status: quote.status,
              total: quote.total,
              items: quote.items,
              notes: quote.notes
            };
          });
          
          // Export to Excel format
          const result = await exportQuotesToExcel(formattedQuotes);
          
          return result;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Analytics methods
      getQuoteConversionRate: () => {
        const quotes = get().quotes;
        const approvedQuotes = quotes.filter(quote => 
          quote.status === 'approved' || 
          quote.status === 'scheduled' || 
          quote.status === 'converted'
        ).length;
        const sentQuotes = quotes.filter(quote => 
          quote.status === 'sent' || 
          quote.status === 'approved' || 
          quote.status === 'rejected' || 
          quote.status === 'scheduled' || 
          quote.status === 'converted'
        ).length;
        
        return sentQuotes > 0 ? (approvedQuotes / sentQuotes) * 100 : 0;
      },
      
      getQuoteValueByStatus: (status) => {
        const quotes = get().getQuotesByStatus(status);
        return quotes.reduce((sum, quote) => sum + quote.total, 0);
      },
      
      getQuoteCountByStatus: (status) => {
        return get().getQuotesByStatus(status).length;
      },
      
      getAverageQuoteValue: () => {
        const quotes = get().quotes;
        const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
        
        return quotes.length > 0 ? totalValue / quotes.length : 0;
      },
      
      getMonthlyQuoteData: () => {
        const quotes = get().quotes;
        const approvedQuotes = quotes.filter(quote => 
          quote.status === 'approved' || 
          quote.status === 'scheduled' || 
          quote.status === 'converted'
        );
        
        // Group quotes by month
        const monthlyData: Record<string, { revenue: number; expenses: number; profit: number }> = {};
        
        // Define months we want to track
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        // Initialize monthly data
        months.forEach(month => {
          monthlyData[month] = { revenue: 0, expenses: 0, profit: 0 };
        });
        
        // Process quotes
        approvedQuotes.forEach(quote => {
          const date = new Date(quote.createdAt);
          const month = date.toLocaleString('en-US', { month: 'short' });
          
          if (monthlyData[month]) {
            const revenue = quote.total;
            // Calculate expenses based on margin percentage
            const margin = quote.margin || 40; // Default 40% if not specified
            const expenses = revenue * (1 - margin / 100);
            const profit = revenue - expenses;
            
            monthlyData[month].revenue += revenue;
            monthlyData[month].expenses += expenses;
            monthlyData[month].profit += profit;
          }
        });
        
        // Convert to array format
        return months.map(month => ({
          month,
          revenue: monthlyData[month].revenue,
          expenses: monthlyData[month].expenses,
          profit: monthlyData[month].profit
        }));
      },
      
      getWorkflowMetrics: () => {
        const quotes = get().quotes;
        
        // Calculate average time from sent to approval
        let totalTimeToApproval = 0;
        let approvalCount = 0;
        
        // Calculate average time from approval to schedule
        let totalTimeToSchedule = 0;
        let scheduleCount = 0;
        
        // Calculate average time from schedule to conversion
        let totalTimeToConversion = 0;
        let conversionCount = 0;
        
        quotes.forEach(quote => {
          // Time to approval
          if (quote.sentAt && quote.approvedAt) {
            const sentDate = new Date(quote.sentAt);
            const approvedDate = new Date(quote.approvedAt);
            const daysToApproval = (approvedDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
            totalTimeToApproval += daysToApproval;
            approvalCount++;
          }
          
          // Time to schedule
          if (quote.approvedAt && quote.scheduledDate) {
            const approvedDate = new Date(quote.approvedAt);
            const scheduledDate = new Date(quote.scheduledDate);
            const daysToSchedule = (scheduledDate.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24);
            totalTimeToSchedule += daysToSchedule;
            scheduleCount++;
          }
          
          // Time to conversion
          if (quote.scheduledDate && quote.status === 'converted') {
            const scheduledDate = new Date(quote.scheduledDate);
            const updatedDate = new Date(quote.updatedAt); // Using updatedAt as a proxy for conversion date
            const daysToConversion = (updatedDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24);
            totalTimeToConversion += daysToConversion;
            conversionCount++;
          }
        });
        
        return {
          avgTimeToApproval: approvalCount > 0 ? totalTimeToApproval / approvalCount : 0,
          avgTimeToSchedule: scheduleCount > 0 ? totalTimeToSchedule / scheduleCount : 0,
          avgTimeToConversion: conversionCount > 0 ? totalTimeToConversion / conversionCount : 0,
          conversionRate: get().getQuoteConversionRate()
        };
      }
    }),
    {
      name: 'quote-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);