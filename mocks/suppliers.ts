import { Supplier } from '@/types';

export const suppliers: Supplier[] = [
  {
    id: 'ferguson',
    name: 'Ferguson',
    description: 'Largest HVAC/Plumbing distributor',
    logoUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80',
    integrationStatus: 'live',
    categories: ['plumbing', 'hvac'],
  },
  {
    id: 'supplyhouse',
    name: 'Supply House',
    description: 'HVAC specialist with competitive pricing',
    logoUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80',
    integrationStatus: 'live',
    categories: ['hvac'],
  },
  {
    id: 'homedepot',
    name: 'Home Depot Pro',
    description: 'Same-day pickup availability',
    logoUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80',
    integrationStatus: 'coming_soon',
    categories: ['plumbing', 'hvac', 'electrical'],
  },
  {
    id: 'lowes',
    name: 'Lowes Pro',
    description: 'Alternative big box with regional pricing',
    logoUrl: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80',
    integrationStatus: 'coming_soon',
    categories: ['plumbing', 'hvac', 'electrical'],
  },
];