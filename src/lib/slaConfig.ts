// SLA Configuration based on phase_3_required_data.md
export const slaConfig = {
  // Issue Categories with SLA Targets (Hours)
  categories: {
    pothole: {
      low: { slaTarget: 72, escalationTime: 96 },
      medium: { slaTarget: 48, escalationTime: 60 },
      high: { slaTarget: 24, escalationTime: 36 },
      critical: { slaTarget: 12, escalationTime: 18 }
    },
    street_light: {
      low: { slaTarget: 96, escalationTime: 120 },
      medium: { slaTarget: 72, escalationTime: 84 },
      high: { slaTarget: 48, escalationTime: 60 },
      critical: { slaTarget: 24, escalationTime: 30 }
    },
    water_leak: {
      low: { slaTarget: 48, escalationTime: 60 },
      medium: { slaTarget: 24, escalationTime: 36 },
      high: { slaTarget: 12, escalationTime: 18 },
      critical: { slaTarget: 6, escalationTime: 12 }
    },
    traffic_signal: {
      low: { slaTarget: 48, escalationTime: 60 },
      medium: { slaTarget: 24, escalationTime: 30 },
      high: { slaTarget: 12, escalationTime: 18 },
      critical: { slaTarget: 6, escalationTime: 12 }
    },
    sidewalk: {
      low: { slaTarget: 72, escalationTime: 96 },
      medium: { slaTarget: 48, escalationTime: 60 },
      high: { slaTarget: 24, escalationTime: 36 },
      critical: { slaTarget: 12, escalationTime: 18 }
    },
    drainage: {
      low: { slaTarget: 48, escalationTime: 60 },
      medium: { slaTarget: 24, escalationTime: 36 },
      high: { slaTarget: 12, escalationTime: 18 },
      critical: { slaTarget: 6, escalationTime: 12 }
    },
    debris: {
      low: { slaTarget: 24, escalationTime: 36 },
      medium: { slaTarget: 12, escalationTime: 18 },
      high: { slaTarget: 6, escalationTime: 12 },
      critical: { slaTarget: 3, escalationTime: 6 }
    },
    other: {
      low: { slaTarget: 72, escalationTime: 96 },
      medium: { slaTarget: 48, escalationTime: 60 },
      high: { slaTarget: 24, escalationTime: 36 },
      critical: { slaTarget: 12, escalationTime: 18 }
    }
  },

  // Area-specific SLA targets
  areaSlaTargets: {
    central_delhi: {
      priority: 'high',
      population: 1173902,
      targets: {
        pothole: 24,
        street_light: 48,
        water_leak: 24,
        traffic_signal: 72,
        sidewalk: 48,
        drainage: 48,
        debris: 24,
        other: 72
      }
    },
    ghaziabad: {
      priority: 'high',
      population: 3100000,
      targets: {
        pothole: 24,
        street_light: 48,
        water_leak: 24,
        traffic_signal: 72,
        sidewalk: 48,
        drainage: 48,
        debris: 24,
        other: 72
      }
    },
    gurgaon: {
      priority: 'medium',
      population: 1500000,
      targets: {
        pothole: 48,
        street_light: 72,
        water_leak: 48,
        traffic_signal: 96,
        sidewalk: 72,
        drainage: 72,
        debris: 48,
        other: 96
      }
    },
    faridabad: {
      priority: 'medium',
      population: 1400000,
      targets: {
        pothole: 48,
        street_light: 72,
        water_leak: 48,
        traffic_signal: 96,
        sidewalk: 72,
        drainage: 72,
        debris: 48,
        other: 96
      }
    },
    rajkot_rmc: {
      priority: 'high',
      population: 1323363,
      targets: {
        pothole: 24,
        street_light: 48,
        water_leak: 24,
        traffic_signal: 72,
        sidewalk: 48,
        drainage: 48,
        debris: 24,
        other: 72
      }
    },
    rajkot_ruda: {
      priority: 'medium',
      population: 3804558,
      targets: {
        pothole: 48,
        street_light: 72,
        water_leak: 48,
        traffic_signal: 96,
        sidewalk: 72,
        drainage: 72,
        debris: 48,
        other: 96
      }
    }
  },

  // Escalation rules
  escalationRules: {
    slaWarning: {
      timeBeforeDeadline: 4, // hours
      notifyRoles: ['field_supervisor', 'city_engineer']
    },
    slaBreach: {
      timeAfterDeadline: 0, // immediate
      notifyRoles: ['field_supervisor', 'city_engineer', 'super_admin'],
      autoEscalate: true
    },
    criticalEscalation: {
      timeAfterDeadline: 24, // hours
      notifyRoles: ['super_admin', 'auditor'],
      requireManagerAction: true
    }
  }
};

// SLA calculation utilities
export const slaUtils = {
  // Calculate SLA deadline based on category, priority, and area
  calculateSlaDeadline: (category: string, priority: string, area: string, createdAt: Date): Date => {
    const areaTargets = slaConfig.areaSlaTargets[area as keyof typeof slaConfig.areaSlaTargets];
    const targetHours = areaTargets?.targets[category as keyof typeof areaTargets.targets] || 
                       slaConfig.categories[category as keyof typeof slaConfig.categories]?.[priority as keyof typeof slaConfig.categories.pothole]?.slaTarget || 72;
    
    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + targetHours);
    return deadline;
  },

  // Check if SLA is breached
  isSlaBreached: (issue: any): boolean => {
    if (!issue.slaDeadline) return false;
    const now = new Date();
    const deadline = new Date(issue.slaDeadline);
    return now > deadline;
  },

  // Get time remaining until SLA deadline
  getTimeRemaining: (issue: any): number => {
    if (!issue.slaDeadline) return Infinity;
    const now = new Date();
    const deadline = new Date(issue.slaDeadline);
    return deadline.getTime() - now.getTime();
  },

  // Get SLA status
  getSlaStatus: (issue: any): 'compliant' | 'warning' | 'breached' => {
    const timeRemaining = slaUtils.getTimeRemaining(issue);
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    
    if (hoursRemaining < 0) return 'breached';
    if (hoursRemaining <= 4) return 'warning';
    return 'compliant';
  }
};
