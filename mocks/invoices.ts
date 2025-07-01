import { Invoice } from '@/types';

export const invoices: Invoice[] = [
  {
    id: '1',
    quoteId: '2',
    customerId: '2',
    jobId: '2',
    amount: 1201.56,
    status: 'sent',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    notes: 'Payment due within 15 days',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    customerId: '4',
    jobId: '4',
    amount: 189.99,
    status: 'overdue',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    notes: 'Second notice',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    customerId: '5',
    amount: 450.75,
    status: 'paid',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    paidAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
  },
];