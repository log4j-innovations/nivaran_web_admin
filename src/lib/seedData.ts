import { firebaseAuth, firestoreService } from './firebase';

// Initial data for seeding the database
export const seedData = {
  users: [
    {
      email: 'admin@municipal.com',
      password: 'admin123',
      name: 'John Admin',
      role: 'super_admin' as const,
      department: 'IT',
      phone: '+1-555-0101',
      assignedAreas: ['downtown', 'uptown', 'suburbs'],
      isActive: true,
    },
    {
      email: 'engineer@municipal.com',
      password: 'engineer123',
      name: 'Sarah Engineer',
      role: 'city_engineer' as const,
      department: 'Engineering',
      phone: '+1-555-0102',
      assignedAreas: ['downtown', 'uptown'],
      isActive: true,
    },
    {
      email: 'supervisor@municipal.com',
      password: 'supervisor123',
      name: 'Mike Supervisor',
      role: 'field_supervisor' as const,
      department: 'Field Operations',
      phone: '+1-555-0103',
      assignedAreas: ['downtown'],
      isActive: true,
    },
    {
      email: 'auditor@municipal.com',
      password: 'auditor123',
      name: 'Lisa Auditor',
      role: 'auditor' as const,
      department: 'Compliance',
      phone: '+1-555-0104',
      assignedAreas: [],
      isActive: true,
    },
  ],
  
  areas: [
    {
      name: 'Downtown',
      type: 'district',
      boundaries: [
        { latitude: 40.7500, longitude: -74.0000 },
        { latitude: 40.7600, longitude: -73.9900 },
      ],
      population: 50000,
      priority: 'high',
      supervisorId: 'supervisor@municipal.com',
      slaTargets: { pothole: 48, street_light: 24, water_leak: 12 },
      activeIssues: 5,
      totalIssues: 25,
      averageResolutionTime: 36,
    },
    {
      name: 'Uptown',
      type: 'district',
      boundaries: [
        { latitude: 40.8000, longitude: -73.9500 },
        { latitude: 40.8100, longitude: -73.9400 },
      ],
      population: 35000,
      priority: 'medium',
      supervisorId: 'engineer@municipal.com',
      slaTargets: { pothole: 72, street_light: 48, water_leak: 24 },
      activeIssues: 3,
      totalIssues: 18,
      averageResolutionTime: 48,
    },
  ],
  
  issues: [
    {
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
      assignedTo: 'engineer@municipal.com',
      images: [],
      area: 'downtown',
      tags: ['traffic', 'safety'],
      estimatedCost: 500,
      slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
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
      assignedTo: 'supervisor@municipal.com',
      images: [],
      area: 'downtown',
      tags: ['lighting', 'night'],
      estimatedCost: 200,
      slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  ],
};

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create users
    for (const userData of seedData.users) {
      try {
        const { password, ...userInfo } = userData;
        await firebaseAuth.signUp(userData.email, password, userInfo);
        console.log(`Created user: ${userData.email}`);
             } catch (error: unknown) {
         if (error instanceof Error && 'code' in error && error.code === 'auth/email-already-in-use') {
           console.log(`User ${userData.email} already exists`);
         } else {
           console.error(`Error creating user ${userData.email}:`, error);
         }
       }
    }
    
    // Create areas
    for (const areaData of seedData.areas) {
      try {
        await firestoreService.createArea(areaData);
        console.log(`Created area: ${areaData.name}`);
      } catch (error) {
        console.error(`Error creating area ${areaData.name}:`, error);
      }
    }
    
    // Create issues
    for (const issueData of seedData.issues) {
      try {
        await firestoreService.createIssue(issueData);
        console.log(`Created issue: ${issueData.title}`);
      } catch (error) {
        console.error(`Error creating issue ${issueData.title}:`, error);
      }
    }
    
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
