

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'pending' | 'SuperAdmin' | 'Department Head' | 'Supervisor' | 'Auditor';
  department?: string;
  phone?: string;
  assignedAreas?: string[];
  // New geographic area information
  geographicAreas?: GeographicArea[];
  // Department location for proximity-based filtering
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
  profileImage?: string;
  status: 'active' | 'inactive' | 'suspended';
  approvalDate?: Date;
  approvedBy?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'pothole' | 'street_light' | 'water_leak' | 'traffic_signal' | 'sidewalk' | 'drainage' | 'debris' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  reportedBy: string;
  assignedTo?: string;
  images: string[];
  imageUrl?: string; // Direct image URL for single image
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  dueDate?: Date;
  area: string;
  tags: string[];
  estimatedCost?: number;
  actualCost?: number;
  contractorId?: string;
  notes?: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
}

export interface Area {
  id: string;
  name: string;
  type: 'district' | 'neighborhood' | 'zone';
  boundaries: Array<{ latitude: number; longitude: number }>;
  // New geographic center for easier calculations
  center: {
    latitude: number;
    longitude: number;
  };
  // New radius in kilometers
  radius: number;
  population: number;
  priority: 'high' | 'medium' | 'low';
  supervisorId?: string;
  slaTargets: Record<string, number>;
  activeIssues: number;
  totalIssues: number;
  averageResolutionTime: number;
}

export interface Activity {
  id: string;
  issueId: string;
  userId: string;
  userRole: string;
  action: 'created' | 'assigned' | 'status_changed' | 'commented' | 'resolved' | 'escalated' | 'photo_added';
  details: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: 'SuperAdmin' | 'Department Head' | 'Supervisor' | 'Auditor';
  type: 'issue_created' | 'status_updated' | 'assignment_changed' | 'sla_warning' | 'resolution_confirmed';
  title: string;
  message: string;
  issueId?: string;
  isRead: boolean;
  createdAt: Date;
  channels: ('email' | 'sms' | 'push')[];
}

export interface Department {
  id: string;
  name: string;
  slaTargets: SLATarget[];
  supervisorId: string;
  areas: string[];
}

export interface SLATarget {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  targetHours: number;
  escalationHours: number;
}

export interface PerformanceMetrics {
  userId: string;
  period: { start: Date; end: Date };
  issuesAssigned: number;
  issuesResolved: number;
  averageResolutionTime: number;
  slaCompliance: number;
  citizenSatisfaction: number;
}

export interface AreaMetrics {
  areaId: string;
  period: { start: Date; end: Date };
  totalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  hotspots: Array<{ latitude: number; longitude: number }>;
  categoryBreakdown: Record<string, number>;
}

// New interfaces for geographic filtering
export interface GeographicArea {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in kilometers
  boundaries?: Array<{ latitude: number; longitude: number }>;
}

export interface GeographicFilter {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  areas: string[];
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
}
