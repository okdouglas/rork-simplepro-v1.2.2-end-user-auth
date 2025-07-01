// Customer types
export type CustomerSegment = 'all' | 'vip' | 'recurring' | 'at_risk' | 'new';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  segment: CustomerSegment;
  lifetimeValue?: number;
  totalJobs?: number;
  lastServiceDate?: string;
  nextRecommendedService?: {
    type: string;
    dueDate: string;
    estimatedCost?: number;
  };
  property?: {
    type: 'residential' | 'commercial';
    size?: number;
    yearBuilt?: number;
    equipment?: Array<{
      id: string;
      type: string;
      brand: string;
      model: string;
      serialNumber: string;
      installDate: string;
      lastServiceDate?: string;
    }>;
  };
  notes?: string;
  serviceArea?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  campaigns?: CustomerCampaign[];
  communicationPreference?: 'email' | 'sms' | 'call';
}

export interface CustomerCampaign {
  id: string;
  type: 'reminder' | 'seasonal' | 'win_back' | 'follow_up' | 'new_customer';
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  scheduledDate?: string;
  sentDate?: string;
  completedDate?: string;
  templateId?: string;
  results?: {
    opened: boolean;
    clicked: boolean;
    converted: boolean;
    revenue?: number;
  };
  opened?: boolean;
  clicked?: boolean;
  converted?: boolean;
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomersThisMonth: number;
  growthRate: number;
  averageLifetimeValue: number;
  repeatCustomerRate: number;
  acquisitionCost: number;
  segmentCounts: {
    vip: number;
    recurring: number;
    atRisk: number;
    new: number;
  };
  campaignStats: {
    active: number;
    completed: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

// Service area types
export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  color: string;
  customerCount: number;
  jobCount: number;
  revenue: number;
}

export interface ClientLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  customerType: 'residential' | 'commercial';
  jobCount: number;
  lastServiceDate?: string;
}

export interface JobLocation {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  jobType: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: string;
  completedDate?: string;
  description: string;
  revenue: number;
}

// Pipeline types
export type PipelineStageType = 'leads' | 'warm' | 'open_invoices' | 'closed_won';

export interface PipelineItem {
  id: string;
  title: string;
  customerId: string;
  value: number;
  priority: string; // Make this required to match the component
  date: string; // Make this required to match the component
  status: string; // Make this required to match the component
  type: string; // Make this required to match the component
}

export interface PipelineStage {
  stage: string;
  name: string;
  count: number;
  value: number;
  color: string;
  icon: string;
  conversionRate?: number;
  avgTimeInStage?: number;
  items: PipelineItem[];
}

// Add other types as needed for your application
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledDate: string;
  estimatedDuration: number; // in minutes
  assignedTo: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  jobType: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  invoiceId?: string;
  quoteId?: string;
  totalAmount: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'scheduled' | 'converted';

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName?: string;
  title?: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  calendarEventId?: string;
  signatureId?: string;
  signedBy?: string;
  signedAt?: string;
  jobId?: string;
  items: QuoteItem[];
  subtotal: number;
  markedUpSubtotal?: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  templateId?: string;
  margin?: number; // Markup percentage
  // New fields for Twilio integration
  communicationHistory?: QuoteCommunication[];
  signatureUrl?: string;
  pdfUrl?: string;
}

export interface QuoteCommunication {
  id: string;
  type: 'sms' | 'email';
  to: string;
  sentAt: string;
  status: string;
  messageId?: string;
  mediaUrl?: string;
  subject?: string; // For emails
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultLineItems: Array<{
    id: string;
    description: string;
    defaultQuantity: number;
    unitPrice: number;
  }>;
  defaultTaxRate: number;
  defaultTerms: string;
  defaultNotes: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  conversionRate: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  jobId?: string;
  quoteId?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  sentAt?: string;
  paidAt?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  total: number;
  amountPaid: number;
  balance: number;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  serviceAreas: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  employees: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  settings: {
    currency: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
    defaultTaxRate: number;
    defaultTerms: string;
    defaultNotes: string;
  };
}

export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    customers: number;
    jobs: number;
    quotes: number;
    invoices: number;
    storage: number;
    users: number;
  };
  paymentMethod?: {
    id: string;
    type: 'card' | 'bank_account';
    last4: string;
    expMonth?: number;
    expYear?: number;
    brand?: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  isDefault: boolean;
  last4: string;
  expMonth?: number;
  expYear?: number;
  brand?: string;
  name?: string;
  bankName?: string;
  country?: string;
  createdAt: string;
}

export interface BillingHistory {
  id: string;
  type: 'subscription' | 'one_time';
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  paymentMethod: {
    type: 'card' | 'bank_account';
    last4: string;
    brand?: string;
  };
  invoice?: string;
  receiptUrl?: string;
}

// Financial metrics types
export interface FinancialMetrics {
  invoiceAging: {
    current: {
      count: number;
      value: number;
    };
    days30: {
      count: number;
      value: number;
    };
    days60: {
      count: number;
      value: number;
    };
    days90Plus: {
      count: number;
      value: number;
    };
  };
  quotePerformance: {
    byStatus: {
      draft: {
        count: number;
        value: number;
      };
      sent: {
        count: number;
        value: number;
      };
      approved: {
        count: number;
        value: number;
      };
      rejected: {
        count: number;
        value: number;
      };
      expired?: {
        count: number;
        value: number;
      };
    };
    byServiceType: Array<{
      type: string;
      count: number;
      conversionRate: number;
      averageValue: number;
    }>;
  };
  monthlyTrend?: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export interface DashboardStats {
  todayJobs: number;
  pendingQuotes: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  revenueOverview: {
    currentMonth: number;
    ytd: number;
    percentChange: number;
    trend: 'up' | 'down';
  };
  pipelineValue: {
    total: number;
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
  activeProjects: {
    count: number;
    averageValue: number;
    completionRate: number;
  };
  conversionRate: {
    current: number;
    previousMonth: number;
    trend: 'up' | 'down';
  };
}

export interface TemplateAnalytics {
  templateId: string;
  name: string;
  category: string;
  conversionRate: number;
  averageJobValue: number;
  jobCount: number;
  averageCompletionTime: number;
  customerSatisfaction: number;
  profitMargin: number;
}

// Notification types
export type NotificationType = 'reminder' | 'payment' | 'alert' | 'update' | 'signature';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  relatedId?: string; // ID of related item (quote, job, etc.)
  relatedType?: 'quote' | 'job' | 'invoice' | 'customer';
  actionUrl?: string; // URL to navigate to when notification is tapped
}