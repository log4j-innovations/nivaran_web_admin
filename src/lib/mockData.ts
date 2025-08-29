import { User } from './types';

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@municipal.com',
    name: 'John Admin',
    role: 'super_admin',
    department: 'IT',
    phone: '+1-555-0101',
    assignedAreas: ['downtown', 'uptown', 'suburbs'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'engineer@municipal.com',
    name: 'Sarah Engineer',
    role: 'city_engineer',
    department: 'Engineering',
    phone: '+1-555-0102',
    assignedAreas: ['downtown', 'uptown'],
    isActive: true,
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'supervisor@municipal.com',
    name: 'Mike Supervisor',
    role: 'field_supervisor',
    department: 'Field Operations',
    phone: '+1-555-0103',
    assignedAreas: ['downtown'],
    isActive: true,
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date(),
  },
  {
    id: '4',
    email: 'auditor@municipal.com',
    name: 'Lisa Auditor',
    role: 'auditor',
    department: 'Compliance',
    phone: '+1-555-0104',
    assignedAreas: [],
    isActive: true,
    createdAt: new Date('2024-01-04'),
    lastLogin: new Date(),
  },
];

// Mock authentication for testing
export const mockAuth = {
  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'admin123') {
      return user;
    }
    throw new Error('Invalid credentials');
  },
  
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
  
  getCurrentUser: () => {
    // Return the first user for testing
    return mockUsers[0];
  },
};

// Mock issues data
export const mockIssues = [
  {
    id: '1',
    title: 'Large pothole on Main Street',
    description: 'Deep pothole causing traffic issues',
    status: 'pending',
    priority: 'high',
    category: 'pothole',
    severity: 'major',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    reportedBy: 'citizen-1',
    assignedTo: '2',
    images: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    slaDeadline: new Date('2024-01-22'),
    area: 'downtown',
    tags: ['traffic', 'safety'],
    estimatedCost: 500,
  },
  {
    id: '2',
    title: 'Broken street light',
    description: 'Street light not working at night',
    status: 'in_progress',
    priority: 'medium',
    category: 'street_light',
    severity: 'moderate',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '456 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10036',
    },
    reportedBy: 'citizen-2',
    assignedTo: '3',
    images: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    slaDeadline: new Date('2024-01-21'),
    area: 'downtown',
    tags: ['lighting', 'night'],
    estimatedCost: 200,
  },
];

// Mock areas data
export const mockAreas = [
  {
    id: 'downtown',
    name: 'Downtown',
    type: 'district',
    boundaries: [
      { latitude: 40.7500, longitude: -74.0000 },
      { latitude: 40.7600, longitude: -73.9900 },
    ],
    population: 50000,
    priority: 'high',
    supervisorId: '3',
    slaTargets: { pothole: 48, street_light: 24, water_leak: 12 },
    activeIssues: 5,
    totalIssues: 25,
    averageResolutionTime: 36,
  },
  {
    id: 'uptown',
    name: 'Uptown',
    type: 'district',
    boundaries: [
      { latitude: 40.8000, longitude: -73.9500 },
      { latitude: 40.8100, longitude: -73.9400 },
    ],
    population: 35000,
    priority: 'medium',
    supervisorId: '2',
    slaTargets: { pothole: 72, street_light: 48, water_leak: 24 },
    activeIssues: 3,
    totalIssues: 18,
    averageResolutionTime: 48,
  },
];
