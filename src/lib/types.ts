

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'city_engineer' | 'field_supervisor' | 'auditor' | 'citizen';
  department?: string;
  phone?: string;
  assignedAreas?: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
  profileImage?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'pothole' | 'street_light' | 'water_leak' | 'traffic_signal' | 'sidewalk' | 'drainage' | 'debris' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
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
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  area: string;
  tags: string[];
  estimatedCost?: number;
  actualCost?: number;
  contractorId?: string;
}

export interface Area {
  id: string;
  name: string;
  type: 'district' | 'neighborhood' | 'zone';
  boundaries: Array<{ latitude: number; longitude: number }>;
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
  recipientType: 'citizen' | 'authority';
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
