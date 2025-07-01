import { Quote, QuoteStatus } from '@/types';

// Generate 30 sample quotes with realistic data
export const quotes: Quote[] = [
  // Original quotes
  {
    id: '1',
    jobId: '1',
    customerId: '1',
    items: [
      {
        id: '1-1',
        name: 'Diagnostic Fee',
        description: 'Comprehensive system diagnostic',
        quantity: 1,
        unitPrice: 89.99,
        total: 89.99,
      },
      {
        id: '1-2',
        name: 'Refrigerant Recharge',
        description: 'R-410A refrigerant',
        quantity: 2,
        unitPrice: 75.00,
        total: 150.00,
      },
      {
        id: '1-3',
        name: 'Labor',
        description: 'Repair and service',
        quantity: 1.5,
        unitPrice: 95.00,
        total: 142.50,
      },
    ],
    subtotal: 382.49,
    tax: 31.56,
    total: 414.05,
    status: 'sent',
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    updatedAt: new Date().toISOString(),
    margin: 35, // Added margin percentage
  },
  {
    id: '2',
    jobId: '2',
    customerId: '2',
    items: [
      {
        id: '2-1',
        name: 'Rheem 40-Gallon Water Heater',
        description: 'Model XE40M06ST45U1',
        quantity: 1,
        unitPrice: 649.99,
        total: 649.99,
      },
      {
        id: '2-2',
        name: 'Installation Kit',
        description: 'Includes pipes, fittings, and expansion tank',
        quantity: 1,
        unitPrice: 125.00,
        total: 125.00,
      },
      {
        id: '2-3',
        name: 'Labor',
        description: 'Installation and removal of old unit',
        quantity: 3,
        unitPrice: 95.00,
        total: 285.00,
      },
      {
        id: '2-4',
        name: 'Disposal Fee',
        description: 'Removal and proper disposal of old unit',
        quantity: 1,
        unitPrice: 50.00,
        total: 50.00,
      },
    ],
    subtotal: 1109.99,
    tax: 91.57,
    total: 1201.56,
    status: 'approved',
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    updatedAt: new Date().toISOString(),
    margin: 42, // Added margin percentage
  },
  {
    id: '3',
    jobId: '3',
    customerId: '3',
    items: [
      {
        id: '3-1',
        name: 'Drain Cleaning',
        description: 'Kitchen sink drain',
        quantity: 1,
        unitPrice: 149.99,
        total: 149.99,
      },
      {
        id: '3-2',
        name: 'Camera Inspection',
        description: 'Video inspection of drain line',
        quantity: 1,
        unitPrice: 99.00,
        total: 99.00,
      },
    ],
    subtotal: 248.99,
    tax: 20.54,
    total: 269.53,
    status: 'draft',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updatedAt: new Date().toISOString(),
    margin: 45, // Added margin percentage
  },
  
  // Additional quotes - January
  {
    id: '4',
    jobId: '4',
    customerId: '4',
    items: [
      { id: '4-1', name: 'HVAC Maintenance', description: 'Annual service', quantity: 1, unitPrice: 189.99, total: 189.99 }
    ],
    subtotal: 189.99,
    tax: 15.67,
    total: 205.66,
    status: 'approved',
    createdAt: '2025-01-05T10:30:00.000Z',
    updatedAt: '2025-01-05T10:30:00.000Z',
    margin: 40,
  },
  {
    id: '5',
    jobId: '5',
    customerId: '5',
    items: [
      { id: '5-1', name: 'Toilet Replacement', description: 'Standard model', quantity: 1, unitPrice: 350.00, total: 350.00 },
      { id: '5-2', name: 'Labor', description: 'Installation', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 520.00,
    tax: 42.90,
    total: 562.90,
    status: 'approved',
    createdAt: '2025-01-12T14:15:00.000Z',
    updatedAt: '2025-01-12T14:15:00.000Z',
    margin: 38,
  },
  {
    id: '6',
    jobId: '6',
    customerId: '6',
    items: [
      { id: '6-1', name: 'Electrical Panel Upgrade', description: '200A panel', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
      { id: '6-2', name: 'Labor', description: 'Installation', quantity: 8, unitPrice: 95.00, total: 760.00 }
    ],
    subtotal: 1960.00,
    tax: 161.70,
    total: 2121.70,
    status: 'approved',
    createdAt: '2025-01-18T09:45:00.000Z',
    updatedAt: '2025-01-18T09:45:00.000Z',
    margin: 35,
  },
  {
    id: '7',
    jobId: '7',
    customerId: '7',
    items: [
      { id: '7-1', name: 'Drain Cleaning', description: 'Main line', quantity: 1, unitPrice: 275.00, total: 275.00 }
    ],
    subtotal: 275.00,
    tax: 22.69,
    total: 297.69,
    status: 'approved',
    createdAt: '2025-01-25T16:20:00.000Z',
    updatedAt: '2025-01-25T16:20:00.000Z',
    margin: 65,
  },
  
  // February
  {
    id: '8',
    jobId: '8',
    customerId: '8',
    items: [
      { id: '8-1', name: 'Water Heater Replacement', description: '50-gallon gas', quantity: 1, unitPrice: 950.00, total: 950.00 },
      { id: '8-2', name: 'Labor', description: 'Installation', quantity: 4, unitPrice: 85.00, total: 340.00 }
    ],
    subtotal: 1290.00,
    tax: 106.43,
    total: 1396.43,
    status: 'approved',
    createdAt: '2025-02-03T11:30:00.000Z',
    updatedAt: '2025-02-03T11:30:00.000Z',
    margin: 42,
  },
  {
    id: '9',
    jobId: '9',
    customerId: '9',
    items: [
      { id: '9-1', name: 'Faucet Installation', description: 'Kitchen sink', quantity: 1, unitPrice: 175.00, total: 175.00 },
      { id: '9-2', name: 'Labor', description: 'Installation', quantity: 1.5, unitPrice: 85.00, total: 127.50 }
    ],
    subtotal: 302.50,
    tax: 24.96,
    total: 327.46,
    status: 'approved',
    createdAt: '2025-02-10T13:45:00.000Z',
    updatedAt: '2025-02-10T13:45:00.000Z',
    margin: 48,
  },
  {
    id: '10',
    jobId: '10',
    customerId: '10',
    items: [
      { id: '10-1', name: 'AC Repair', description: 'Capacitor replacement', quantity: 1, unitPrice: 85.00, total: 85.00 },
      { id: '10-2', name: 'Labor', description: 'Diagnostic and repair', quantity: 2, unitPrice: 95.00, total: 190.00 }
    ],
    subtotal: 275.00,
    tax: 22.69,
    total: 297.69,
    status: 'approved',
    createdAt: '2025-02-15T10:15:00.000Z',
    updatedAt: '2025-02-15T10:15:00.000Z',
    margin: 55,
  },
  {
    id: '11',
    jobId: '11',
    customerId: '11',
    items: [
      { id: '11-1', name: 'Thermostat Installation', description: 'Smart thermostat', quantity: 1, unitPrice: 225.00, total: 225.00 },
      { id: '11-2', name: 'Labor', description: 'Installation and setup', quantity: 1, unitPrice: 85.00, total: 85.00 }
    ],
    subtotal: 310.00,
    tax: 25.58,
    total: 335.58,
    status: 'approved',
    createdAt: '2025-02-22T14:30:00.000Z',
    updatedAt: '2025-02-22T14:30:00.000Z',
    margin: 50,
  },
  {
    id: '12',
    jobId: '12',
    customerId: '12',
    items: [
      { id: '12-1', name: 'Garbage Disposal', description: 'New installation', quantity: 1, unitPrice: 175.00, total: 175.00 },
      { id: '12-2', name: 'Labor', description: 'Installation', quantity: 1.5, unitPrice: 85.00, total: 127.50 }
    ],
    subtotal: 302.50,
    tax: 24.96,
    total: 327.46,
    status: 'approved',
    createdAt: '2025-02-28T09:00:00.000Z',
    updatedAt: '2025-02-28T09:00:00.000Z',
    margin: 45,
  },
  
  // March
  {
    id: '13',
    jobId: '13',
    customerId: '13',
    items: [
      { id: '13-1', name: 'Ductwork Repair', description: 'Seal and insulate', quantity: 1, unitPrice: 450.00, total: 450.00 },
      { id: '13-2', name: 'Labor', description: 'Repair work', quantity: 4, unitPrice: 85.00, total: 340.00 }
    ],
    subtotal: 790.00,
    tax: 65.18,
    total: 855.18,
    status: 'approved',
    createdAt: '2025-03-05T11:15:00.000Z',
    updatedAt: '2025-03-05T11:15:00.000Z',
    margin: 40,
  },
  {
    id: '14',
    jobId: '14',
    customerId: '14',
    items: [
      { id: '14-1', name: 'Sump Pump Installation', description: 'New installation', quantity: 1, unitPrice: 375.00, total: 375.00 },
      { id: '14-2', name: 'Labor', description: 'Installation', quantity: 3, unitPrice: 85.00, total: 255.00 }
    ],
    subtotal: 630.00,
    tax: 51.98,
    total: 681.98,
    status: 'approved',
    createdAt: '2025-03-12T13:30:00.000Z',
    updatedAt: '2025-03-12T13:30:00.000Z',
    margin: 38,
  },
  {
    id: '15',
    jobId: '15',
    customerId: '15',
    items: [
      { id: '15-1', name: 'Ceiling Fan Installation', description: 'New installation', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { id: '15-2', name: 'Labor', description: 'Installation', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 320.00,
    tax: 26.40,
    total: 346.40,
    status: 'approved',
    createdAt: '2025-03-18T15:45:00.000Z',
    updatedAt: '2025-03-18T15:45:00.000Z',
    margin: 52,
  },
  {
    id: '16',
    jobId: '16',
    customerId: '16',
    items: [
      { id: '16-1', name: 'AC Tune-up', description: 'Spring maintenance', quantity: 1, unitPrice: 149.99, total: 149.99 }
    ],
    subtotal: 149.99,
    tax: 12.37,
    total: 162.36,
    status: 'approved',
    createdAt: '2025-03-25T10:00:00.000Z',
    updatedAt: '2025-03-25T10:00:00.000Z',
    margin: 60,
  },
  
  // April
  {
    id: '17',
    jobId: '17',
    customerId: '17',
    items: [
      { id: '17-1', name: 'AC Replacement', description: '3-ton unit', quantity: 1, unitPrice: 3200.00, total: 3200.00 },
      { id: '17-2', name: 'Labor', description: 'Installation', quantity: 8, unitPrice: 95.00, total: 760.00 }
    ],
    subtotal: 3960.00,
    tax: 326.70,
    total: 4286.70,
    status: 'approved',
    createdAt: '2025-04-03T09:30:00.000Z',
    updatedAt: '2025-04-03T09:30:00.000Z',
    margin: 35,
  },
  {
    id: '18',
    jobId: '18',
    customerId: '18',
    items: [
      { id: '18-1', name: 'Pipe Leak Repair', description: 'Under sink', quantity: 1, unitPrice: 125.00, total: 125.00 },
      { id: '18-2', name: 'Labor', description: 'Repair', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 295.00,
    tax: 24.34,
    total: 319.34,
    status: 'approved',
    createdAt: '2025-04-10T14:15:00.000Z',
    updatedAt: '2025-04-10T14:15:00.000Z',
    margin: 48,
  },
  {
    id: '19',
    jobId: '19',
    customerId: '19',
    items: [
      { id: '19-1', name: 'Shower Valve Replacement', description: 'Complete replacement', quantity: 1, unitPrice: 185.00, total: 185.00 },
      { id: '19-2', name: 'Labor', description: 'Replacement', quantity: 3, unitPrice: 85.00, total: 255.00 }
    ],
    subtotal: 440.00,
    tax: 36.30,
    total: 476.30,
    status: 'approved',
    createdAt: '2025-04-18T11:45:00.000Z',
    updatedAt: '2025-04-18T11:45:00.000Z',
    margin: 42,
  },
  {
    id: '20',
    jobId: '20',
    customerId: '20',
    items: [
      { id: '20-1', name: 'Refrigerant Leak Repair', description: 'Locate and fix', quantity: 1, unitPrice: 350.00, total: 350.00 },
      { id: '20-2', name: 'Labor', description: 'Diagnostic and repair', quantity: 3, unitPrice: 95.00, total: 285.00 }
    ],
    subtotal: 635.00,
    tax: 52.39,
    total: 687.39,
    status: 'approved',
    createdAt: '2025-04-25T13:00:00.000Z',
    updatedAt: '2025-04-25T13:00:00.000Z',
    margin: 45,
  },
  
  // May
  {
    id: '21',
    jobId: '21',
    customerId: '21',
    items: [
      { id: '21-1', name: 'Water Softener Installation', description: 'Whole house system', quantity: 1, unitPrice: 850.00, total: 850.00 },
      { id: '21-2', name: 'Labor', description: 'Installation', quantity: 4, unitPrice: 85.00, total: 340.00 }
    ],
    subtotal: 1190.00,
    tax: 98.18,
    total: 1288.18,
    status: 'approved',
    createdAt: '2025-05-02T10:30:00.000Z',
    updatedAt: '2025-05-02T10:30:00.000Z',
    margin: 40,
  },
  {
    id: '22',
    jobId: '22',
    customerId: '22',
    items: [
      { id: '22-1', name: 'GFCI Outlet Installation', description: '4 outlets', quantity: 4, unitPrice: 45.00, total: 180.00 },
      { id: '22-2', name: 'Labor', description: 'Installation', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 350.00,
    tax: 28.88,
    total: 378.88,
    status: 'approved',
    createdAt: '2025-05-09T15:15:00.000Z',
    updatedAt: '2025-05-09T15:15:00.000Z',
    margin: 50,
  },
  {
    id: '23',
    jobId: '23',
    customerId: '23',
    items: [
      { id: '23-1', name: 'AC Coil Cleaning', description: 'Deep cleaning', quantity: 1, unitPrice: 225.00, total: 225.00 },
      { id: '23-2', name: 'Labor', description: 'Service', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 395.00,
    tax: 32.59,
    total: 427.59,
    status: 'approved',
    createdAt: '2025-05-16T11:00:00.000Z',
    updatedAt: '2025-05-16T11:00:00.000Z',
    margin: 55,
  },
  {
    id: '24',
    jobId: '24',
    customerId: '24',
    items: [
      { id: '24-1', name: 'Heat Pump Installation', description: '3-ton system', quantity: 1, unitPrice: 4200.00, total: 4200.00 },
      { id: '24-2', name: 'Labor', description: 'Installation', quantity: 10, unitPrice: 95.00, total: 950.00 }
    ],
    subtotal: 5150.00,
    tax: 424.88,
    total: 5574.88,
    status: 'approved',
    createdAt: '2025-05-23T09:45:00.000Z',
    updatedAt: '2025-05-23T09:45:00.000Z',
    margin: 38,
  },
  {
    id: '25',
    jobId: '25',
    customerId: '25',
    items: [
      { id: '25-1', name: 'Backflow Preventer', description: 'Installation', quantity: 1, unitPrice: 325.00, total: 325.00 },
      { id: '25-2', name: 'Labor', description: 'Installation', quantity: 3, unitPrice: 85.00, total: 255.00 }
    ],
    subtotal: 580.00,
    tax: 47.85,
    total: 627.85,
    status: 'approved',
    createdAt: '2025-05-30T14:30:00.000Z',
    updatedAt: '2025-05-30T14:30:00.000Z',
    margin: 45,
  },
  
  // June
  {
    id: '26',
    jobId: '26',
    customerId: '26',
    items: [
      { id: '26-1', name: 'Condenser Fan Motor', description: 'Replacement', quantity: 1, unitPrice: 175.00, total: 175.00 },
      { id: '26-2', name: 'Labor', description: 'Replacement', quantity: 2, unitPrice: 95.00, total: 190.00 }
    ],
    subtotal: 365.00,
    tax: 30.11,
    total: 395.11,
    status: 'approved',
    createdAt: '2025-06-05T10:15:00.000Z',
    updatedAt: '2025-06-05T10:15:00.000Z',
    margin: 52,
  },
  {
    id: '27',
    jobId: '27',
    customerId: '27',
    items: [
      { id: '27-1', name: 'Main Water Line Repair', description: 'Excavation and repair', quantity: 1, unitPrice: 950.00, total: 950.00 },
      { id: '27-2', name: 'Labor', description: 'Repair', quantity: 6, unitPrice: 95.00, total: 570.00 }
    ],
    subtotal: 1520.00,
    tax: 125.40,
    total: 1645.40,
    status: 'approved',
    createdAt: '2025-06-12T09:30:00.000Z',
    updatedAt: '2025-06-12T09:30:00.000Z',
    margin: 40,
  },
  {
    id: '28',
    jobId: '28',
    customerId: '28',
    items: [
      { id: '28-1', name: 'Exhaust Fan Installation', description: 'Bathroom fan', quantity: 1, unitPrice: 125.00, total: 125.00 },
      { id: '28-2', name: 'Labor', description: 'Installation', quantity: 2, unitPrice: 85.00, total: 170.00 }
    ],
    subtotal: 295.00,
    tax: 24.34,
    total: 319.34,
    status: 'approved',
    createdAt: '2025-06-18T13:45:00.000Z',
    updatedAt: '2025-06-18T13:45:00.000Z',
    margin: 48,
  },
  {
    id: '29',
    jobId: '29',
    customerId: '29',
    items: [
      { id: '29-1', name: 'Furnace Tune-up', description: 'Annual maintenance', quantity: 1, unitPrice: 149.99, total: 149.99 }
    ],
    subtotal: 149.99,
    tax: 12.37,
    total: 162.36,
    status: 'approved',
    createdAt: '2025-06-22T11:30:00.000Z',
    updatedAt: '2025-06-22T11:30:00.000Z',
    margin: 65,
  },
  {
    id: '30',
    jobId: '30',
    customerId: '30',
    items: [
      { id: '30-1', name: 'Toilet Repair', description: 'Flapper and fill valve', quantity: 1, unitPrice: 85.00, total: 85.00 },
      { id: '30-2', name: 'Labor', description: 'Repair', quantity: 1, unitPrice: 85.00, total: 85.00 }
    ],
    subtotal: 170.00,
    tax: 14.03,
    total: 184.03,
    status: 'approved',
    createdAt: '2025-06-25T15:00:00.000Z',
    updatedAt: '2025-06-25T15:00:00.000Z',
    margin: 55,
  },
];