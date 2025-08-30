import { collection, addDoc, updateDoc, doc, query, where, orderBy, getDocs, onSnapshot, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  issueId?: string;
  recipientId: string;
  recipientType: 'citizen' | 'authority';
  recipientRole: 'citizen' | 'field_supervisor' | 'city_engineer' | 'super_admin' | 'auditor';
  type: 'issue_created' | 'status_updated' | 'assignment_changed' | 'sla_warning' | 'escalation' | 'resolution_confirmed' | 'report_ready' | 'system_alert' | 'sla_breach';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('push' | 'email' | 'sms')[];
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('push' | 'email' | 'sms')[];
  variables: string[];
}

// Enhanced notification templates based on phase_3_required_data.md
const notificationTemplates: Record<string, NotificationTemplate> = {
  // Citizen Notifications
  citizen_issue_created: {
    id: 'citizen_issue_created',
    type: 'issue_created',
    title: 'Issue Report Received',
    message: 'Your report "{ISSUE_TITLE}" has been received. Expected resolution by {SLA_DEADLINE}.',
    severity: 'low',
    channels: ['push', 'email', 'sms'],
    variables: ['ISSUE_TITLE', 'SLA_DEADLINE']
  },
  citizen_status_updated: {
    id: 'citizen_status_updated',
    type: 'status_updated',
    title: 'Issue Status Updated',
    message: 'Your report "{ISSUE_TITLE}" is now {STATUS}. Field supervisor: {SUPERVISOR_NAME}.',
    severity: 'low',
    channels: ['push', 'email'],
    variables: ['ISSUE_TITLE', 'STATUS', 'SUPERVISOR_NAME']
  },
  citizen_resolution_confirmed: {
    id: 'citizen_resolution_confirmed',
    type: 'resolution_confirmed',
    title: 'Issue Resolved',
    message: 'Your reported issue "{ISSUE_TITLE}" has been resolved. Thank you for reporting.',
    severity: 'low',
    channels: ['push'],
    variables: ['ISSUE_TITLE']
  },

  // Field Supervisor Notifications
  supervisor_new_assignment: {
    id: 'supervisor_new_assignment',
    type: 'assignment_changed',
    title: 'New Issue Assigned',
    message: 'New issue assigned: "{ISSUE_TITLE}" in {AREA_NAME}. Priority: {PRIORITY}.',
    severity: 'medium',
    channels: ['push', 'email'],
    variables: ['ISSUE_TITLE', 'AREA_NAME', 'PRIORITY']
  },
  supervisor_sla_warning: {
    id: 'supervisor_sla_warning',
    type: 'sla_warning',
    title: 'SLA Warning',
    message: 'SLA approaching: "{ISSUE_TITLE}" must be resolved by {SLA_DEADLINE}.',
    severity: 'high',
    channels: ['push', 'email'],
    variables: ['ISSUE_TITLE', 'SLA_DEADLINE']
  },
  supervisor_escalation: {
    id: 'supervisor_escalation',
    type: 'escalation',
    title: 'Critical Escalation',
    message: 'Critical escalation: "{ISSUE_TITLE}" escalated to City Engineer. Take action immediately.',
    severity: 'critical',
    channels: ['push'],
    variables: ['ISSUE_TITLE']
  },

  // City Engineer Notifications
  engineer_sla_breach: {
    id: 'engineer_sla_breach',
    type: 'sla_breach',
    title: 'SLA Breach Alert',
    message: '"{ISSUE_TITLE}" in {AREA_NAME} breached SLA. Assigned to {SUPERVISOR_NAME}.',
    severity: 'high',
    channels: ['push', 'email'],
    variables: ['ISSUE_TITLE', 'AREA_NAME', 'SUPERVISOR_NAME']
  },
  engineer_area_performance: {
    id: 'engineer_area_performance',
    type: 'system_alert',
    title: 'Area Performance Alert',
    message: 'Resolution rate in {AREA_NAME} dropped below {THRESHOLD}%.',
    severity: 'medium',
    channels: ['push', 'email'],
    variables: ['AREA_NAME', 'THRESHOLD']
  },
  engineer_report_ready: {
    id: 'engineer_report_ready',
    type: 'report_ready',
    title: 'Report Ready',
    message: '"{REPORT_NAME}" is available for review.',
    severity: 'low',
    channels: ['email'],
    variables: ['REPORT_NAME']
  },

  // Super Admin Notifications
  admin_system_health: {
    id: 'admin_system_health',
    type: 'system_alert',
    title: 'System Health Alert',
    message: 'Database/storage/network issue detected. Severity: {SEVERITY}. Immediate action required.',
    severity: 'critical',
    channels: ['email', 'push'],
    variables: ['SEVERITY']
  },
  admin_sla_compliance: {
    id: 'admin_sla_compliance',
    type: 'system_alert',
    title: 'SLA Compliance Alert',
    message: 'Department {DEPARTMENT_NAME} SLA compliance below {THRESHOLD}%.',
    severity: 'high',
    channels: ['email', 'push'],
    variables: ['DEPARTMENT_NAME', 'THRESHOLD']
  },
  admin_user_anomaly: {
    id: 'admin_user_anomaly',
    type: 'system_alert',
    title: 'User Activity Anomaly',
    message: 'Suspicious activity detected: {USER_NAME}, {ACTION}.',
    severity: 'high',
    channels: ['email'],
    variables: ['USER_NAME', 'ACTION']
  },

  // Auditor Notifications
  auditor_report_ready: {
    id: 'auditor_report_ready',
    type: 'report_ready',
    title: 'Report Ready',
    message: '"{REPORT_NAME}" is ready for download.',
    severity: 'low',
    channels: ['email'],
    variables: ['REPORT_NAME']
  },
  auditor_compliance_alert: {
    id: 'auditor_compliance_alert',
    type: 'system_alert',
    title: 'Compliance Alert',
    message: 'Audit discrepancy detected in {AREA_NAME} for period {PERIOD}.',
    severity: 'medium',
    channels: ['email', 'push'],
    variables: ['AREA_NAME', 'PERIOD']
  }
};

// ... existing code ...

class NotificationService {
  private static instance: NotificationService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create notification from template
  async createNotificationFromTemplate(
    templateId: string,
    recipientId: string,
    recipientType: 'citizen' | 'authority',
    recipientRole: string,
    variables: Record<string, string>,
    issueId?: string
  ): Promise<string> {
    const template = notificationTemplates[templateId];
    if (!template) {
      throw new Error(`Notification template ${templateId} not found`);
    }

    let title = template.title;
    let message = template.message;

    // Replace variables in title and message
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(placeholder, value);
      message = message.replace(placeholder, value);
    });

    const notification: Omit<Notification, 'id'> = {
      issueId,
      recipientId,
      recipientType,
      recipientRole: recipientRole as Notification['recipientRole'],
      type: template.type as Notification['type'],
      title,
      message,
      severity: template.severity,
      channels: template.channels,
      isRead: false,
      createdAt: Timestamp.now(),
      metadata: { templateId, variables }
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  }

  // Create notification manually
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const notificationData: Omit<Notification, 'id'> = {
      ...notification,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  }

  // Get notifications for a user
  async getNotifications(
    recipientId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    let q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(q, where('isRead', '==', false));
    }

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });

    return notifications.slice(0, limit);
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: Timestamp.now()
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(recipientId: string): Promise<void> {
    const notifications = await this.getNotifications(recipientId, 1000, true);
    const batch = writeBatch(db);

    notifications.forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, {
        isRead: true,
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(
    recipientId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          } as Notification);
        });

        callback(notifications);
      },
      (error) => {
        console.warn('⚠️ NotificationsService: Permission error in snapshot listener:', error);
        // Provide empty notifications on permission error instead of breaking
        callback([]);
      }
    );

    this.listeners.set(recipientId, unsubscribe);
    return unsubscribe;
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(recipientId: string): void {
    const unsubscribe = this.listeners.get(recipientId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(recipientId);
    }
  }

  // Send SLA warning notification
  async sendSLAWarning(
    issueId: string,
    issueTitle: string,
    recipientId: string,
    recipientRole: string,
    slaDeadline: string
  ): Promise<void> {
    const templateId = recipientRole === 'field_supervisor' 
      ? 'supervisor_sla_warning' 
      : 'engineer_sla_breach';

    await this.createNotificationFromTemplate(
      templateId,
      recipientId,
      'authority',
      recipientRole,
      {
        ISSUE_TITLE: issueTitle,
        SLA_DEADLINE: slaDeadline
      },
      issueId
    );
  }

  // Send escalation notification
  async sendEscalationNotification(
    issueId: string,
    issueTitle: string,
    escalatedToRole: string,
    escalatedBy: string
  ): Promise<void> {
    const templateId = escalatedToRole === 'city_engineer' 
      ? 'engineer_sla_breach' 
      : 'supervisor_escalation';

    // Get the escalated user ID (in real implementation, you'd fetch this)
    const escalatedUserId = 'escalated_user_id'; // This should be fetched from user service

    await this.createNotificationFromTemplate(
      templateId,
      escalatedUserId,
      'authority',
      escalatedToRole,
      {
        ISSUE_TITLE: issueTitle,
        ESCALATED_BY: escalatedBy
      },
      issueId
    );
  }

  // Send system health alert
  async sendSystemHealthAlert(
    severity: string,
    issue: string,
    adminIds: string[]
  ): Promise<void> {
    for (const adminId of adminIds) {
      await this.createNotificationFromTemplate(
        'admin_system_health',
        adminId,
        'authority',
        'super_admin',
        {
          SEVERITY: severity,
          ISSUE: issue
        }
      );
    }
  }

  // Send area performance alert
  async sendAreaPerformanceAlert(
    areaName: string,
    threshold: string,
    engineerIds: string[]
  ): Promise<void> {
    for (const engineerId of engineerIds) {
      await this.createNotificationFromTemplate(
        'engineer_area_performance',
        engineerId,
        'authority',
        'city_engineer',
        {
          AREA_NAME: areaName,
          THRESHOLD: threshold
        }
      );
    }
  }

  // Send user activity anomaly alert
  async sendUserAnomalyAlert(
    userName: string,
    action: string,
    adminIds: string[]
  ): Promise<void> {
    for (const adminId of adminIds) {
      await this.createNotificationFromTemplate(
        'admin_user_anomaly',
        adminId,
        'authority',
        'super_admin',
        {
          USER_NAME: userName,
          ACTION: action
        }
      );
    }
  }

  // Send report ready notification
  async sendReportReadyNotification(
    reportName: string,
    recipientId: string,
    recipientRole: string
  ): Promise<void> {
    const templateId = recipientRole === 'auditor' 
      ? 'auditor_report_ready' 
      : 'engineer_report_ready';

    await this.createNotificationFromTemplate(
      templateId,
      recipientId,
      'authority',
      recipientRole,
      {
        REPORT_NAME: reportName
      }
    );
  }

  // Send compliance alert
  async sendComplianceAlert(
    areaName: string,
    period: string,
    auditorIds: string[]
  ): Promise<void> {
    for (const auditorId of auditorIds) {
      await this.createNotificationFromTemplate(
        'auditor_compliance_alert',
        auditorId,
        'authority',
        'auditor',
        {
          AREA_NAME: areaName,
          PERIOD: period
        }
      );
    }
  }

  // Get notification statistics
  async getNotificationStats(recipientId: string): Promise<{
    total: number;
    unread: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const notifications = await this.getNotifications(recipientId, 1000);
    
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    notifications.forEach(notification => {
      stats.bySeverity[notification.severity] = (stats.bySeverity[notification.severity] || 0) + 1;
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }

  // Delete old notifications (cleanup)
  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

    const q = query(
      collection(db, 'notifications'),
      where('createdAt', '<', cutoffTimestamp),
      where('isRead', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

export default NotificationService;
