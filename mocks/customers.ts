import { Customer, CustomerSegment } from '@/types';

// Helper function to generate a random date within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Current date for reference
const now = new Date();
const oneYearAgo = new Date(now);
oneYearAgo.setFullYear(now.getFullYear() - 1);

const sixMonthsAgo = new Date(now);
sixMonthsAgo.setMonth(now.getMonth() - 6);

const threeMonthsAgo = new Date(now);
threeMonthsAgo.setMonth(now.getMonth() - 3);

const oneMonthAgo = new Date(now);
oneMonthAgo.setMonth(now.getMonth() - 1);

// Generate a random future date for next recommended service
const getNextServiceDate = (): string => {
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + Math.floor(Math.random() * 90) + 15); // 15-105 days in the future
  return futureDate.toISOString();
};

export const customers: Customer[] = [
  // VIP Customers (High Value)
  {
    id: '1',
    name: 'John Smith',
    phone: '(405) 555-1234',
    email: 'john.smith@example.com',
    address: '123 Main St, Norman, OK 73072',
    city: 'Norman',
    state: 'OK',
    zip: '73072',
    notes: 'Prefers afternoon appointments. Has a dog in the backyard.',
    segment: 'vip',
    source: 'referral',
    lifetimeValue: 3850,
    totalJobs: 7,
    lastServiceDate: randomDate(oneMonthAgo, now),
    nextRecommendedService: {
      type: 'HVAC Seasonal Maintenance',
      dueDate: getNextServiceDate(),
      estimatedCost: 150
    },
    coordinates: {
      latitude: 35.2226,
      longitude: -97.4395,
    },
    serviceArea: 'Norman',
    communicationPreference: 'email',
    lastContactDate: randomDate(oneMonthAgo, now),
    property: {
      type: 'residential',
      size: 2400,
      yearBuilt: 2005,
      equipment: [
        {
          id: 'eq1',
          type: 'HVAC',
          brand: 'Trane',
          model: 'XR16',
          serialNumber: 'TR12345678',
          installDate: '2018-06-15T00:00:00.000Z',
          lastServiceDate: randomDate(sixMonthsAgo, now),
        },
        {
          id: 'eq2',
          type: 'Water Heater',
          brand: 'Rheem',
          model: 'Performance Plus',
          serialNumber: 'RH87654321',
          installDate: '2020-03-10T00:00:00.000Z',
          lastServiceDate: randomDate(oneYearAgo, now),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp1',
        type: 'seasonal',
        status: 'scheduled',
        scheduledDate: getNextServiceDate(),
        opened: true,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, oneYearAgo),
    updatedAt: randomDate(oneMonthAgo, now),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '(405) 555-5678',
    email: 'sarah.j@example.com',
    address: '456 Oak Ave, Norman, OK 73071',
    city: 'Norman',
    state: 'OK',
    zip: '73071',
    notes: 'Allergic to certain adhesives. Check before using.',
    segment: 'recurring',
    source: 'google',
    lifetimeValue: 1750,
    totalJobs: 4,
    lastServiceDate: randomDate(threeMonthsAgo, oneMonthAgo),
    nextRecommendedService: {
      type: 'Plumbing Inspection',
      dueDate: getNextServiceDate(),
      estimatedCost: 120
    },
    coordinates: {
      latitude: 35.2337,
      longitude: -97.4298,
    },
    serviceArea: 'Norman',
    communicationPreference: 'sms',
    lastContactDate: randomDate(threeMonthsAgo, oneMonthAgo),
    property: {
      type: 'residential',
      size: 1800,
      yearBuilt: 1998,
      equipment: [
        {
          id: 'eq3',
          type: 'Water Heater',
          brand: 'AO Smith',
          model: 'ProLine',
          serialNumber: 'AO55512345',
          installDate: '2019-11-20T00:00:00.000Z',
          lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp2',
        type: 'reminder',
        status: 'scheduled',
        scheduledDate: getNextServiceDate(),
        opened: false,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, sixMonthsAgo),
    updatedAt: randomDate(threeMonthsAgo, oneMonthAgo),
  },
  {
    id: '3',
    name: 'Mike Williams',
    phone: '(405) 555-9012',
    email: 'mike.w@example.com',
    address: '789 Pine Rd, Norman, OK 73069',
    city: 'Norman',
    state: 'OK',
    zip: '73069',
    segment: 'at_risk',
    source: 'website',
    lifetimeValue: 850,
    totalJobs: 2,
    lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
    coordinates: {
      latitude: 35.2195,
      longitude: -97.4452,
    },
    serviceArea: 'Norman',
    communicationPreference: 'call',
    lastContactDate: randomDate(oneYearAgo, sixMonthsAgo),
    property: {
      type: 'residential',
      size: 1600,
      yearBuilt: 2001,
      equipment: []
    },
    campaigns: [
      {
        id: 'camp3',
        type: 'win_back',
        status: 'sent',
        scheduledDate: randomDate(oneMonthAgo, now),
        sentDate: randomDate(oneMonthAgo, now),
        opened: true,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, sixMonthsAgo),
    updatedAt: randomDate(sixMonthsAgo, threeMonthsAgo),
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '(405) 555-3456',
    email: 'emily.d@example.com',
    address: '321 Cedar Ln, Oklahoma City, OK 73142',
    city: 'Oklahoma City',
    state: 'OK',
    zip: '73142',
    notes: 'Has a keypad entry. Code is 1234#',
    segment: 'vip',
    source: 'referral',
    lifetimeValue: 4200,
    totalJobs: 8,
    lastServiceDate: randomDate(oneMonthAgo, now),
    nextRecommendedService: {
      type: 'Electrical Panel Inspection',
      dueDate: getNextServiceDate(),
      estimatedCost: 180
    },
    coordinates: {
      latitude: 35.5889,
      longitude: -97.5164,
    },
    serviceArea: 'Oklahoma City',
    communicationPreference: 'email',
    lastContactDate: randomDate(oneMonthAgo, now),
    property: {
      type: 'residential',
      size: 3200,
      yearBuilt: 2010,
      equipment: [
        {
          id: 'eq4',
          type: 'HVAC',
          brand: 'Carrier',
          model: 'Infinity',
          serialNumber: 'CA98765432',
          installDate: '2020-05-12T00:00:00.000Z',
          lastServiceDate: randomDate(sixMonthsAgo, now),
        },
        {
          id: 'eq5',
          type: 'Electrical Panel',
          brand: 'Square D',
          model: '200A Main Panel',
          serialNumber: 'SD45678901',
          installDate: '2018-08-22T00:00:00.000Z',
          lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp4',
        type: 'seasonal',
        status: 'completed',
        sentDate: randomDate(threeMonthsAgo, oneMonthAgo),
        completedDate: randomDate(threeMonthsAgo, oneMonthAgo),
        opened: true,
        clicked: true,
        converted: true
      }
    ],
    createdAt: randomDate(oneYearAgo, oneYearAgo),
    updatedAt: randomDate(oneMonthAgo, now),
  },
  {
    id: '5',
    name: 'Robert Brown',
    phone: '(405) 555-7890',
    email: 'robert.b@example.com',
    address: '654 Elm St, Moore, OK 73160',
    city: 'Moore',
    state: 'OK',
    zip: '73160',
    segment: 'new',
    source: 'social_media',
    lifetimeValue: 450,
    totalJobs: 1,
    lastServiceDate: randomDate(oneMonthAgo, now),
    nextRecommendedService: {
      type: 'HVAC Tune-up',
      dueDate: getNextServiceDate(),
      estimatedCost: 95
    },
    coordinates: {
      latitude: 35.3395,
      longitude: -97.4867,
    },
    serviceArea: 'Moore',
    communicationPreference: 'sms',
    lastContactDate: randomDate(oneMonthAgo, now),
    property: {
      type: 'residential',
      size: 1950,
      yearBuilt: 2015,
      equipment: [
        {
          id: 'eq6',
          type: 'HVAC',
          brand: 'Lennox',
          model: 'Merit',
          serialNumber: 'LE12345678',
          installDate: '2015-06-10T00:00:00.000Z',
          lastServiceDate: randomDate(oneMonthAgo, now),
        }
      ]
    },
    campaigns: [],
    createdAt: randomDate(threeMonthsAgo, oneMonthAgo),
    updatedAt: randomDate(oneMonthAgo, now),
  },
  // Additional customers
  {
    id: '6',
    name: 'Jennifer Wilson',
    phone: '(405) 555-2468',
    email: 'jennifer.w@example.com',
    address: '987 Maple Dr, Norman, OK 73072',
    city: 'Norman',
    state: 'OK',
    zip: '73072',
    notes: 'Prefers morning appointments.',
    segment: 'recurring',
    source: 'referral',
    lifetimeValue: 1950,
    totalJobs: 5,
    lastServiceDate: randomDate(threeMonthsAgo, oneMonthAgo),
    nextRecommendedService: {
      type: 'Drain Cleaning',
      dueDate: getNextServiceDate(),
      estimatedCost: 110
    },
    coordinates: {
      latitude: 35.2240,
      longitude: -97.4390,
    },
    serviceArea: 'Norman',
    communicationPreference: 'email',
    lastContactDate: randomDate(threeMonthsAgo, oneMonthAgo),
    property: {
      type: 'residential',
      size: 2100,
      yearBuilt: 2003,
      equipment: [
        {
          id: 'eq7',
          type: 'Water Heater',
          brand: 'Bradford White',
          model: 'Standard',
          serialNumber: 'BW87654321',
          installDate: '2017-09-15T00:00:00.000Z',
          lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp6',
        type: 'reminder',
        status: 'scheduled',
        scheduledDate: getNextServiceDate(),
        opened: false,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, sixMonthsAgo),
    updatedAt: randomDate(threeMonthsAgo, oneMonthAgo),
  },
  {
    id: '7',
    name: 'David Martinez',
    phone: '(405) 555-1357',
    email: 'david.m@example.com',
    address: '753 Birch St, Oklahoma City, OK 73120',
    city: 'Oklahoma City',
    state: 'OK',
    zip: '73120',
    segment: 'new',
    source: 'google',
    lifetimeValue: 350,
    totalJobs: 1,
    lastServiceDate: randomDate(oneMonthAgo, now),
    coordinates: {
      latitude: 35.5722,
      longitude: -97.5137,
    },
    serviceArea: 'Oklahoma City',
    communicationPreference: 'sms',
    lastContactDate: randomDate(oneMonthAgo, now),
    property: {
      type: 'residential',
      size: 1750,
      yearBuilt: 2008,
      equipment: [
        {
          id: 'eq8',
          type: 'HVAC',
          brand: 'Goodman',
          model: 'GSX16',
          serialNumber: 'GM12345678',
          installDate: '2018-04-22T00:00:00.000Z',
          lastServiceDate: randomDate(oneMonthAgo, now),
        }
      ]
    },
    campaigns: [],
    createdAt: randomDate(threeMonthsAgo, oneMonthAgo),
    updatedAt: randomDate(oneMonthAgo, now),
  },
  {
    id: '8',
    name: 'Lisa Thompson',
    phone: '(405) 555-8642',
    email: 'lisa.t@example.com',
    address: '159 Walnut Ave, Edmond, OK 73034',
    city: 'Edmond',
    state: 'OK',
    zip: '73034',
    notes: 'Has security system. Call before arrival.',
    segment: 'at_risk',
    source: 'website',
    lifetimeValue: 1200,
    totalJobs: 3,
    lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
    coordinates: {
      latitude: 35.6528,
      longitude: -97.4781,
    },
    serviceArea: 'Edmond',
    communicationPreference: 'call',
    lastContactDate: randomDate(sixMonthsAgo, threeMonthsAgo),
    property: {
      type: 'residential',
      size: 2800,
      yearBuilt: 1995,
      equipment: [
        {
          id: 'eq9',
          type: 'HVAC',
          brand: 'American Standard',
          model: 'Silver',
          serialNumber: 'AS87654321',
          installDate: '2016-07-18T00:00:00.000Z',
          lastServiceDate: randomDate(oneYearAgo, sixMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp8',
        type: 'win_back',
        status: 'sent',
        sentDate: randomDate(threeMonthsAgo, oneMonthAgo),
        opened: true,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, sixMonthsAgo),
    updatedAt: randomDate(sixMonthsAgo, threeMonthsAgo),
  },
  {
    id: '9',
    name: 'Michael Garcia',
    phone: '(405) 555-9753',
    email: 'michael.g@example.com',
    address: '852 Cherry Ln, Moore, OK 73160',
    city: 'Moore',
    state: 'OK',
    zip: '73160',
    segment: 'vip',
    source: 'referral',
    lifetimeValue: 5200,
    totalJobs: 9,
    lastServiceDate: randomDate(threeMonthsAgo, oneMonthAgo),
    nextRecommendedService: {
      type: 'Electrical System Inspection',
      dueDate: getNextServiceDate(),
      estimatedCost: 200
    },
    coordinates: {
      latitude: 35.3390,
      longitude: -97.4860,
    },
    serviceArea: 'Moore',
    communicationPreference: 'email',
    lastContactDate: randomDate(threeMonthsAgo, oneMonthAgo),
    property: {
      type: 'commercial',
      size: 5000,
      yearBuilt: 2005,
      equipment: [
        {
          id: 'eq10',
          type: 'HVAC',
          brand: 'Carrier',
          model: 'Commercial',
          serialNumber: 'CC12345678',
          installDate: '2015-03-10T00:00:00.000Z',
          lastServiceDate: randomDate(sixMonthsAgo, threeMonthsAgo),
        },
        {
          id: 'eq11',
          type: 'Electrical Panel',
          brand: 'Square D',
          model: '400A Commercial',
          serialNumber: 'SD98765432',
          installDate: '2015-03-15T00:00:00.000Z',
          lastServiceDate: randomDate(sixMonthsAgo, threeMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp9',
        type: 'seasonal',
        status: 'scheduled',
        scheduledDate: getNextServiceDate(),
        opened: false,
        clicked: false,
        converted: false
      }
    ],
    createdAt: randomDate(oneYearAgo, oneYearAgo),
    updatedAt: randomDate(threeMonthsAgo, oneMonthAgo),
  },
  {
    id: '10',
    name: 'Amanda Lee',
    phone: '(405) 555-3579',
    email: 'amanda.l@example.com',
    address: '426 Spruce Ct, Norman, OK 73071',
    city: 'Norman',
    state: 'OK',
    zip: '73071',
    notes: 'Works from home. Flexible scheduling.',
    segment: 'recurring',
    source: 'social_media',
    lifetimeValue: 1650,
    totalJobs: 4,
    lastServiceDate: randomDate(threeMonthsAgo, oneMonthAgo),
    nextRecommendedService: {
      type: 'Plumbing Maintenance',
      dueDate: getNextServiceDate(),
      estimatedCost: 130
    },
    coordinates: {
      latitude: 35.2330,
      longitude: -97.4290,
    },
    serviceArea: 'Norman',
    communicationPreference: 'sms',
    lastContactDate: randomDate(threeMonthsAgo, oneMonthAgo),
    property: {
      type: 'residential',
      size: 1900,
      yearBuilt: 2012,
      equipment: [
        {
          id: 'eq12',
          type: 'Water Heater',
          brand: 'Rheem',
          model: 'Performance',
          serialNumber: 'RH12345678',
          installDate: '2019-02-28T00:00:00.000Z',
          lastServiceDate: randomDate(sixMonthsAgo, threeMonthsAgo),
        }
      ]
    },
    campaigns: [
      {
        id: 'camp10',
        type: 'reminder',
        status: 'completed',
        sentDate: randomDate(threeMonthsAgo, oneMonthAgo),
        completedDate: randomDate(threeMonthsAgo, oneMonthAgo),
        opened: true,
        clicked: true,
        converted: true
      }
    ],
    createdAt: randomDate(oneYearAgo, sixMonthsAgo),
    updatedAt: randomDate(threeMonthsAgo, oneMonthAgo),
  },
];

export const customerMetrics = {
  totalCustomers: customers.length,
  activeCustomers: customers.filter(c => c.lastServiceDate && new Date(c.lastServiceDate) > sixMonthsAgo).length,
  growthRate: 15, // 15% growth
  averageLifetimeValue: Math.round(customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) / customers.length),
  repeatCustomerRate: Math.round((customers.filter(c => (c.totalJobs || 0) > 1).length / customers.length) * 100),
  acquisitionCost: 125, // Average cost to acquire a new customer
  segmentCounts: {
    vip: customers.filter(c => c.segment === 'vip').length,
    recurring: customers.filter(c => c.segment === 'recurring').length,
    atRisk: customers.filter(c => c.segment === 'at_risk').length,
    new: customers.filter(c => c.segment === 'new').length,
  },
  serviceAreaDensity: {
    high: 3, // Norman
    medium: 2, // OKC
    low: 1, // Edmond
  },
  campaignStats: {
    active: customers.reduce((sum, c) => sum + (c.campaigns?.filter(camp => camp.status === 'scheduled' || camp.status === 'sent').length || 0), 0),
    completed: customers.reduce((sum, c) => sum + (c.campaigns?.filter(camp => camp.status === 'completed').length || 0), 0),
    openRate: 75, // 75% open rate
    clickRate: 35, // 35% click rate
    conversionRate: 20, // 20% conversion rate
  },
};