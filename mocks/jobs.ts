import { Job, JobStatus, JobPriority } from '@/types';

// Helper function to generate dates
const generateDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Format date to YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Generate random time between 8:00 AM and 6:00 PM
const generateRandomTime = () => {
  const hour = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Job titles
const jobTitles = [
  'AC Repair',
  'Furnace Maintenance',
  'Water Heater Installation',
  'Drain Cleaning',
  'Toilet Replacement',
  'Pipe Leak Repair',
  'HVAC Tune-up',
  'Sump Pump Installation',
  'Garbage Disposal Repair',
  'Faucet Replacement',
  'Thermostat Installation',
  'Duct Cleaning',
  'Electrical Panel Upgrade',
  'Ceiling Fan Installation',
  'Shower Valve Replacement',
  'Gas Line Installation',
  'Tankless Water Heater Service',
  'Sewer Line Inspection',
  'Bathroom Remodel Estimate',
  'Kitchen Sink Installation'
];

// Job descriptions
const jobDescriptions = [
  'Unit not cooling properly, possible refrigerant leak',
  'Annual maintenance and filter replacement',
  'Replace old unit with new model',
  'Slow draining sink needs snaking',
  'Cracked toilet needs replacement',
  'Water leaking from pipe under sink',
  'Seasonal maintenance and system check',
  'Install new sump pump in basement',
  'Disposal making loud noise and not working',
  'Old faucet leaking and needs replacement',
  'Install smart thermostat for better efficiency',
  'Clean ducts to improve air quality',
  'Upgrade electrical panel for more capacity',
  'Install new ceiling fan in living room',
  'Shower valve leaking behind wall',
  'Run new gas line for stove installation',
  'Annual service for tankless water heater',
  'Camera inspection of sewer line for blockage',
  'Provide estimate for bathroom renovation',
  'Replace old kitchen sink with new model'
];

// Job notes
const jobNotes = [
  'Customer mentioned unusual noise from outdoor unit',
  'Bring replacement filters (16x25x1)',
  'Old unit needs to be hauled away',
  'Customer has tried drain cleaner without success',
  'Customer selected Kohler Cimarron model',
  'Shut off water valve before arrival',
  'System is 10 years old, may need parts',
  'Basement has flooded twice this year',
  'Disposal is 5 years old, may recommend replacement',
  'Customer prefers brushed nickel finish',
  'Customer purchased Nest thermostat already',
  'Customer reports allergies and dust concerns',
  'Home built in 1985, may need wiring updates',
  'Ceiling height is 9 feet, bring extension ladder',
  'Water damage visible on drywall',
  'Need to coordinate with kitchen contractor',
  'Unit is 3 years old, still under warranty',
  'Customer reports recurring backups',
  'Customer wants to upgrade to walk-in shower',
  'Countertops are granite, need appropriate sink'
];

// Job priorities
const priorities: JobPriority[] = ['low', 'medium', 'high', 'urgent'];

// Job statuses
const statuses: JobStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

// Generate 35 jobs (5 existing + 30 new)
export const jobs: Job[] = [];

// Add the original 5 jobs
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

jobs.push({
  id: '1',
  customerId: '1',
  title: 'AC Repair',
  description: 'Unit not cooling properly, possible refrigerant leak',
  status: 'scheduled',
  priority: 'high',
  scheduledDate: formatDate(today),
  scheduledTime: '09:00',
  notes: 'Customer mentioned unusual noise from outdoor unit',
  photos: [],
  voiceNotes: [],
  createdAt: new Date(today.setDate(today.getDate() - 2)).toISOString(),
  updatedAt: new Date().toISOString(),
});

jobs.push({
  id: '2',
  customerId: '2',
  title: 'Water Heater Installation',
  description: 'Replace old 40-gallon water heater with new unit',
  status: 'scheduled',
  priority: 'medium',
  scheduledDate: formatDate(today),
  scheduledTime: '13:00',
  notes: 'Bring 40-gallon Rheem unit. Old unit needs to be hauled away.',
  photos: [],
  voiceNotes: [],
  createdAt: new Date(today.setDate(today.getDate() - 1)).toISOString(),
  updatedAt: new Date().toISOString(),
});

jobs.push({
  id: '3',
  customerId: '3',
  title: 'Drain Cleaning',
  description: 'Kitchen sink draining slowly',
  status: 'scheduled',
  priority: 'low',
  scheduledDate: formatDate(today),
  scheduledTime: '16:00',
  photos: [],
  voiceNotes: [],
  createdAt: new Date(today.setDate(today.getDate() - 3)).toISOString(),
  updatedAt: new Date().toISOString(),
});

jobs.push({
  id: '4',
  customerId: '4',
  title: 'HVAC Maintenance',
  description: 'Annual maintenance and filter replacement',
  status: 'scheduled',
  priority: 'medium',
  scheduledDate: formatDate(tomorrow),
  scheduledTime: '10:00',
  notes: 'Bring 16x25x1 filters (3)',
  photos: [],
  voiceNotes: [],
  createdAt: new Date(today.setDate(today.getDate() - 5)).toISOString(),
  updatedAt: new Date().toISOString(),
});

jobs.push({
  id: '5',
  customerId: '5',
  title: 'Toilet Replacement',
  description: 'Replace cracked toilet in master bathroom',
  status: 'scheduled',
  priority: 'urgent',
  scheduledDate: formatDate(tomorrow),
  scheduledTime: '14:00',
  notes: 'Customer selected Kohler Cimarron model',
  photos: [],
  voiceNotes: [],
  createdAt: new Date(today.setDate(today.getDate() - 1)).toISOString(),
  updatedAt: new Date().toISOString(),
});

// Generate 30 more jobs spanning the next 6 weeks
for (let i = 0; i < 30; i++) {
  const daysFromNow = Math.floor(Math.random() * 42) + 1; // 1 to 42 days (6 weeks)
  const jobDate = generateDate(daysFromNow);
  
  const titleIndex = Math.floor(Math.random() * jobTitles.length);
  const descriptionIndex = Math.floor(Math.random() * jobDescriptions.length);
  const notesIndex = Math.floor(Math.random() * jobNotes.length);
  const priorityIndex = Math.floor(Math.random() * priorities.length);
  const statusIndex = Math.floor(Math.random() * (statuses.length - 1)); // Exclude 'cancelled' for most jobs
  
  const customerId = Math.floor(Math.random() * 10) + 1; // Customers 1-10
  
  jobs.push({
    id: (i + 6).toString(),
    customerId: customerId.toString(),
    title: jobTitles[titleIndex],
    description: jobDescriptions[descriptionIndex],
    status: statuses[statusIndex],
    priority: priorities[priorityIndex],
    scheduledDate: formatDate(jobDate),
    scheduledTime: generateRandomTime(),
    notes: jobNotes[notesIndex],
    photos: [],
    voiceNotes: [],
    createdAt: new Date(today.setDate(today.getDate() - Math.floor(Math.random() * 10))).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Add a few cancelled jobs
for (let i = 0; i < 5; i++) {
  const daysFromNow = Math.floor(Math.random() * 42) + 1;
  const jobDate = generateDate(daysFromNow);
  
  const titleIndex = Math.floor(Math.random() * jobTitles.length);
  const descriptionIndex = Math.floor(Math.random() * jobDescriptions.length);
  const notesIndex = Math.floor(Math.random() * jobNotes.length);
  const priorityIndex = Math.floor(Math.random() * priorities.length);
  
  const customerId = Math.floor(Math.random() * 10) + 1;
  
  jobs.push({
    id: (i + 36).toString(),
    customerId: customerId.toString(),
    title: jobTitles[titleIndex],
    description: jobDescriptions[descriptionIndex],
    status: 'cancelled',
    priority: priorities[priorityIndex],
    scheduledDate: formatDate(jobDate),
    scheduledTime: generateRandomTime(),
    notes: jobNotes[notesIndex],
    photos: [],
    voiceNotes: [],
    createdAt: new Date(today.setDate(today.getDate() - Math.floor(Math.random() * 10))).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}