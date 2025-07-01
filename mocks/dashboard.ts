import { DashboardStats, PipelineStage, FinancialMetrics, TemplateAnalytics } from '@/types';
import { colors } from '@/constants/colors';

export const dashboardStats: DashboardStats = {
  todayJobs: 3,
  pendingQuotes: 2,
  overdueInvoices: 1,
  monthlyRevenue: 5842.75,
  
  // Executive Summary
  revenueOverview: {
    currentMonth: 5842.75,
    ytd: 42650.50,
    percentChange: 8.3,
    trend: 'up',
  },
  pipelineValue: {
    total: 28750.00,
    next30Days: 12500.00,
    next60Days: 8750.00,
    next90Days: 7500.00,
  },
  activeProjects: {
    count: 8,
    averageValue: 1450.25,
    completionRate: 92.5,
  },
  conversionRate: {
    current: 68.5,
    previousMonth: 65.2,
    trend: 'up',
  },
};

// Updated Pipeline Management Data with new stages
export const pipelineStages: PipelineStage[] = [
  {
    stage: 'leads',
    name: 'Leads',
    count: 5,
    value: 8500.00,
    color: colors.blue[500],
    icon: 'FileEdit',
    conversionRate: 75.0,
    avgTimeInStage: 3.2,
    items: [
      { 
        id: 'l1', 
        customerId: '6', 
        title: 'HVAC Consultation', 
        value: 2500.00, 
        priority: 'medium', 
        date: '2025-07-05',
        type: 'quote',
        status: 'draft'
      },
      { 
        id: 'l2', 
        customerId: '7', 
        title: 'Water Heater Inquiry', 
        value: 1200.00, 
        priority: 'low', 
        date: '2025-07-08',
        type: 'quote',
        status: 'draft'
      },
      { 
        id: 'l3', 
        customerId: '8', 
        title: 'Bathroom Remodel', 
        value: 4800.00, 
        priority: 'high', 
        date: '2025-07-12',
        type: 'quote',
        status: 'draft'
      },
    ]
  },
  {
    stage: 'warm',
    name: 'Warm',
    count: 3,
    value: 6250.00,
    color: colors.orange[500],
    icon: 'Send',
    conversionRate: 62.5,
    avgTimeInStage: 5.7,
    items: [
      { 
        id: 'q1', 
        customerId: '2', 
        title: 'Water Heater Installation', 
        value: 1201.56, 
        priority: 'medium', 
        date: '2025-06-30',
        type: 'quote',
        status: 'sent'
      },
      { 
        id: 'q2', 
        customerId: '3', 
        title: 'Drain Cleaning', 
        value: 269.53, 
        priority: 'low', 
        date: '2025-07-02',
        type: 'quote',
        status: 'sent'
      },
      { 
        id: 'q3', 
        customerId: '9', 
        title: 'AC System Replacement', 
        value: 4778.91, 
        priority: 'high', 
        date: '2025-07-10',
        type: 'quote',
        status: 'sent'
      },
    ]
  },
  {
    stage: 'open_invoices',
    name: 'Open Invoices',
    count: 7,
    value: 11000.00,
    color: colors.success,
    icon: 'CalendarClock',
    conversionRate: 85.0,
    avgTimeInStage: 12.3,
    items: [
      { 
        id: '1', 
        customerId: '1', 
        title: 'AC Repair', 
        value: 414.05, 
        priority: 'high', 
        date: '2025-06-25',
        type: 'job',
        status: 'scheduled'
      },
      { 
        id: '2', 
        customerId: '2', 
        title: 'Water Heater Installation', 
        value: 1201.56, 
        priority: 'medium', 
        date: '2025-06-25',
        type: 'job',
        status: 'scheduled'
      },
      { 
        id: '3', 
        customerId: '3', 
        title: 'Drain Cleaning', 
        value: 269.53, 
        priority: 'low', 
        date: '2025-06-25',
        type: 'job',
        status: 'scheduled'
      },
      { 
        id: '4', 
        customerId: '4', 
        title: 'HVAC Maintenance', 
        value: 189.99, 
        priority: 'medium', 
        date: '2025-06-26',
        type: 'job',
        status: 'scheduled'
      },
      { 
        id: '5', 
        customerId: '5', 
        title: 'Toilet Replacement', 
        value: 450.75, 
        priority: 'urgent', 
        date: '2025-06-26',
        type: 'job',
        status: 'scheduled'
      },
      { 
        id: 'ip1', 
        customerId: '10', 
        title: 'Electrical Panel Upgrade', 
        value: 2250.00, 
        priority: 'medium', 
        date: '2025-06-25',
        type: 'job',
        status: 'in_progress'
      },
      { 
        id: 'ip2', 
        customerId: '11', 
        title: 'Sump Pump Installation', 
        value: 1250.00, 
        priority: 'high', 
        date: '2025-06-25',
        type: 'job',
        status: 'in_progress'
      },
    ]
  },
  {
    stage: 'closed_won',
    name: 'Closed-Won',
    count: 4,
    value: 3000.00,
    color: '#8B5CF6', // Purple
    icon: 'CheckCircle',
    conversionRate: 100.0,
    avgTimeInStage: 0, // Already completed
    items: [
      { 
        id: 'c1', 
        customerId: '12', 
        title: 'Faucet Replacement', 
        value: 350.00, 
        priority: 'low', 
        date: '2025-06-22',
        type: 'job',
        status: 'completed'
      },
      { 
        id: 'c2', 
        customerId: '13', 
        title: 'Thermostat Installation', 
        value: 250.00, 
        priority: 'low', 
        date: '2025-06-23',
        type: 'job',
        status: 'completed'
      },
      { 
        id: 'c3', 
        customerId: '14', 
        title: 'Garbage Disposal Repair', 
        value: 175.00, 
        priority: 'medium', 
        date: '2025-06-24',
        type: 'job',
        status: 'completed'
      },
      { 
        id: 'c4', 
        customerId: '15', 
        title: 'Ceiling Fan Installation', 
        value: 225.00, 
        priority: 'low', 
        date: '2025-06-24',
        type: 'job',
        status: 'completed'
      },
    ]
  },
];

// Financial Metrics
export const financialMetrics: FinancialMetrics = {
  invoiceAging: {
    current: { count: 5, value: 3250.75 },
    days30: { count: 3, value: 1850.50 },
    days60: { count: 2, value: 1200.25 },
    days90Plus: { count: 1, value: 750.00 },
  },
  quotePerformance: {
    byServiceType: [
      { type: 'hvac', count: 12, conversionRate: 75.0, averageValue: 1850.50 },
      { type: 'plumbing', count: 18, conversionRate: 82.5, averageValue: 750.25 },
      { type: 'electrical', count: 8, conversionRate: 62.5, averageValue: 1250.75 },
    ],
    byStatus: {
      draft: { count: 3, value: 2500.00 },
      sent: { count: 5, value: 6250.00 },
      approved: { count: 8, value: 12500.00 },
      rejected: { count: 2, value: 3500.00 },
      expired: { count: 1, value: 1250.00 },
    }
  },
  // Updated monthly trend with accurate expense and profit calculations based on margins
  monthlyTrend: [
    { 
      month: 'Jan', 
      revenue: 3250.50, 
      expenses: 1950.30, 
      profit: 1300.20 
    },
    { 
      month: 'Feb', 
      revenue: 3750.75, 
      expenses: 2100.42, 
      profit: 1650.33 
    },
    { 
      month: 'Mar', 
      revenue: 4250.25, 
      expenses: 2380.14, 
      profit: 1870.11 
    },
    { 
      month: 'Apr', 
      revenue: 5100.50, 
      expenses: 2958.29, 
      profit: 2142.21 
    },
    { 
      month: 'May', 
      revenue: 5500.75, 
      expenses: 3135.43, 
      profit: 2365.32 
    },
    { 
      month: 'Jun', 
      revenue: 5842.75, 
      expenses: 3272.00, 
      profit: 2570.75 
    },
  ]
};

// Template Analytics
export const templateAnalytics: TemplateAnalytics[] = [
  {
    templateId: 'p1', // Water Heater Replacement
    name: 'Water Heater Replacement',
    category: 'plumbing',
    conversionRate: 85.5,
    averageJobValue: 1250.75,
    jobCount: 12,
    averageCompletionTime: 5.5, // hours
    customerSatisfaction: 4.8, // out of 5
    profitMargin: 42.5, // percentage
  },
  {
    templateId: 'h1', // Central AC Unit Replacement
    name: 'Central AC Unit Replacement',
    category: 'hvac',
    conversionRate: 72.5,
    averageJobValue: 4250.50,
    jobCount: 8,
    averageCompletionTime: 7.5,
    customerSatisfaction: 4.7,
    profitMargin: 38.5,
  },
  {
    templateId: 'p4', // Drain Cleaning Service
    name: 'Drain Cleaning Service',
    category: 'plumbing',
    conversionRate: 90.0,
    averageJobValue: 275.50,
    jobCount: 25,
    averageCompletionTime: 1.5,
    customerSatisfaction: 4.9,
    profitMargin: 65.0,
  },
  {
    templateId: 'e1', // Electrical Panel Upgrade
    name: 'Electrical Panel Upgrade',
    category: 'electrical',
    conversionRate: 65.0,
    averageJobValue: 1750.25,
    jobCount: 6,
    averageCompletionTime: 6.5,
    customerSatisfaction: 4.6,
    profitMargin: 35.0,
  },
];