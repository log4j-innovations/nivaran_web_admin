import { User } from './types';

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@municipal.gov.in',
    name: 'Super Admin',
    role: 'SuperAdmin',
    department: 'IT',
    phone: '+91-98765-43210',
    assignedAreas: ['central_delhi', 'ghaziabad', 'rajkot'],
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'departmenthead@municipal.gov.in',
    name: 'Department Head',
    role: 'Department Head',
    department: 'Engineering',
    phone: '+91-98765-43211',
    assignedAreas: ['central_delhi', 'ghaziabad'],
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'supervisor@municipal.gov.in',
    name: 'Field Supervisor',
    role: 'Supervisor',
    department: 'Field Operations',
    phone: '+91-98765-43212',
    assignedAreas: ['central_delhi'],
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date(),
  },
  {
    id: '4',
    email: 'auditor@municipal.gov.in',
    name: 'Auditor',
    role: 'Auditor',
    department: 'Compliance',
    phone: '+91-98765-43213',
    assignedAreas: [],
    isActive: true,
    status: 'active',
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
    
    // Define passwords for each user role
    const userPasswords: { [key: string]: string } = {
      'admin@municipal.gov.in': 'admin123',
      'engineer@municipal.gov.in': 'engineer123',
      'supervisor@municipal.gov.in': 'supervisor123',
      'auditor@municipal.gov.in': 'auditor123'
    };
    
    if (user && password === userPasswords[email]) {
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
    title: 'Large pothole on Main Street, Central Delhi',
    description: 'Deep pothole causing traffic issues and vehicle damage',
    status: 'pending',
    priority: 'high',
    category: 'pothole',
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: '123 Main Street',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
    },
    reportedBy: 'citizen-1',
    assignedTo: '2',
    images: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    slaDeadline: new Date('2024-01-22'),
    area: 'central_delhi',
    tags: ['traffic', 'safety'],
    estimatedCost: 5000,
  },
  {
    id: '2',
    title: 'Broken street light in Ghaziabad',
    description: 'Street light not working at night, safety concern',
    status: 'in_progress',
    priority: 'medium',
    category: 'street_light',
    location: {
      latitude: 28.6692,
      longitude: 77.4538,
      address: '456 Main Road',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      zipCode: '201001',
    },
    reportedBy: 'citizen-2',
    assignedTo: '3',
    images: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    slaDeadline: new Date('2024-01-21'),
    area: 'ghaziabad',
    tags: ['lighting', 'night'],
    estimatedCost: 2000,
  },
];

// Mock areas data
export const mockAreas = [
  {
    id: 'central_delhi',
    name: 'Central Delhi',
    type: 'district',
    boundaries: [
      { latitude: 28.6000, longitude: 77.2000 },
      { latitude: 28.6500, longitude: 77.2500 },
    ],
    population: 1173902,
    priority: 'high',
    supervisorId: '3',
    slaTargets: { pothole: 24, street_light: 48, water_leak: 24 },
    activeIssues: 5,
    totalIssues: 25,
    averageResolutionTime: 36,
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    type: 'district',
    boundaries: [
      { latitude: 28.6500, longitude: 77.4000 },
      { latitude: 28.7000, longitude: 77.5000 },
    ],
    population: 3100000,
    priority: 'high',
    supervisorId: '2',
    slaTargets: { pothole: 24, street_light: 48, water_leak: 24 },
    activeIssues: 3,
    totalIssues: 18,
    averageResolutionTime: 48,
  },
];
