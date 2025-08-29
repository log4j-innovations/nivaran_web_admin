import { collection, addDoc, updateDoc, doc, query, where, orderBy, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  issueId?: string;
  recipientId: string;
  recipientRole: 'citizen' | 'field_supervisor' | 'city_engineer' | 'super_admin' | 'auditor';
  type: 'issue_created' | 'status_updated' | 'sla_warning' | 'escalation' | 'report_ready' | 'system_alert' | 'assignment' | 'sla_breach';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('push' | 'email')[];
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface NotificationTemplate {
  type: Notification['type'];
  title: string;
  message: string;
  severity: Notification['severity'];
  channels: Notification['channels'];
}

// Notification templates based on phase_3_required_data.md
const notificationTemplates: Record<string, NotificationTemplate> = {
  issue_created: {
    type: 'issue_created',
    title: 'New Issue Reported',
    message: 'A new issue "{ISSUE_TITLE}" has been reported in {AREA_NAME}. Priority: {PRIORITY}.',
    severity: 'medium',
    channels: ['push', 'email']
  },
  status_updated: {
    type: 'status_updated',
    title: 'Issue Status Updated',
    message: 'Issue "{ISSUE_TITLE}" status changed to {STATUS}.',
    severity: 'low',
    channels: ['push']
  },
  sla_warning: {
    type: 'sla_warning',
    title: 'SLA Deadline Approaching',
    message: 'Issue "{ISSUE_TITLE}" SLA deadline is approaching. {TIME_REMAINING} hours remaining.',
    severity: 'high',
    channels: ['push', 'email']
  },
  sla_breach: {
    type: 'sla_breach',
    title: 'SLA Breached - Immediate Action Required',
    message: 'Issue "{ISSUE_TITLE}" has breached SLA deadline. Escalation initiated.',
    severity: 'critical',
    channels: ['push', 'email']
  },
  escalation: {
    type: 'escalation',
    title: 'Issue Escalated',
    message: 'Issue "{ISSUE_TITLE}" has been escalated to {ESCALATED_TO_ROLE}.',
    severity: 'high',
    channels: ['push', 'email']
  },
  assignment: {
    type: 'assignment',
    title: 'New Issue Assignment',
    message: 'You have been assigned issue "{ISSUE_TITLE}" in {AREA_NAME}. Priority: {PRIORITY}.',
    severity: 'medium',
    channels: ['push', 'email']
  },
  report_ready: {
    type: 'report_ready',
    title: 'Report Ready',
    message: 'Report "{REPORT_NAME}" is ready for review.',
    severity: 'low',
    channels: ['email']
  },
  system_alert: {
    type: 'system_alert',
    title: 'System Alert',
    message: '{ALERT_MESSAGE}',
    severity: 'medium',
    channels: ['push', 'email']
  }
};

export class NotificationService {
  // Create a new notification
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: Timestamp.now(),
        isRead: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  static async getUserNotifications(userId: string, role: string, limit: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        // Note: Firestore requires composite index for this query
        // For now, we'll filter by recipientId only
      );
      
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Filter by role and limit (client-side for now)
      return notifications
        .filter(n => n.recipientRole === role)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true, updatedAt: Timestamp.now() })
      );
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string, role: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId, role, 1000);
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(
    userId: string, 
    role: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        
        // Filter by role and sort by creation time
        const filteredNotifications = notifications
          .filter(n => n.recipientRole === role)
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        
        callback(filteredNotifications);
      }, (error) => {
        console.error('Error in notification subscription:', error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      return () => {}; // Return empty function if subscription fails
    }
  }

  // Create notification from template
  static createFromTemplate(
    templateType: string,
    recipientId: string,
    recipientRole: string,
    variables: Record<string, string>,
    metadata?: Record<string, unknown>
  ): Omit<Notification, 'id' | 'createdAt'> {
    const template = notificationTemplates[templateType];
    if (!template) {
      throw new Error(`Unknown notification template: ${templateType}`);
    }

    let title = template.title;
    let message = template.message;

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      recipientId,
      recipientRole: recipientRole as Notification['recipientRole'],
      type: template.type,
      title,
      message,
      severity: template.severity,
      channels: template.channels,
      isRead: false,
      metadata
    };
  }

  // Send SLA warning notifications
  static async sendSLAWarning(issueId: string, issueTitle: string, areaName: string, priority: string, timeRemaining: number): Promise<void> {
    try {
      // Get issue details to find assignee
      // This would typically be done through a Cloud Function
      // For now, we'll create a placeholder notification
      const notification = this.createFromTemplate('sla_warning', 'system', 'field_supervisor', {
        ISSUE_TITLE: issueTitle,
        AREA_NAME: areaName,
        PRIORITY: priority,
        TIME_REMAINING: timeRemaining.toString()
      }, { issueId });

      await this.createNotification(notification);
    } catch (error) {
      console.error('Error sending SLA warning:', error);
    }
  }

  // Send escalation notifications
  static async sendEscalationNotification(
    issueId: string, 
    issueTitle: string, 
    escalatedToRole: string,
    currentAssigneeId: string
  ): Promise<void> {
    try {
      // Notify the current assignee
      const assigneeNotification = this.createFromTemplate('escalation', currentAssigneeId, 'field_supervisor', {
        ISSUE_TITLE: issueTitle,
        ESCALATED_TO_ROLE: escalatedToRole
      }, { issueId });

      await this.createNotification(assigneeNotification);

      // Notify the escalated role (e.g., city engineer)
      const escalationNotification = this.createFromTemplate('escalation', 'system', escalatedToRole as any, {
        ISSUE_TITLE: issueTitle,
        ESCALATED_TO_ROLE: escalatedToRole
      }, { issueId });

      await this.createNotification(escalationNotification);
    } catch (error) {
      console.error('Error sending escalation notification:', error);
    }
  }
}

export default NotificationService;
