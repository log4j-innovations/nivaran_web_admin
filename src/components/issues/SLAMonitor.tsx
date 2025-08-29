'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import NotificationService from '@/lib/notifications';
import { Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface SLAMonitorProps {
  issueId: string;
  issueTitle: string;
  areaName: string;
  priority: string;
  slaDeadline?: Date;
  slaTargetHours?: number;
  slaEscalationHours?: number;
  status: string;
  onSLAUpdate?: (slaInfo: any) => void;
}

interface SLAStatus {
  status: 'normal' | 'warning' | 'critical' | 'breached';
  timeRemaining: number;
  hoursRemaining: number;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

export default function SLAMonitor({
  issueId,
  issueTitle,
  areaName,
  priority,
  slaDeadline,
  slaTargetHours,
  slaEscalationHours,
  status,
  onSLAUpdate
}: SLAMonitorProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);
  const [lastWarningSent, setLastWarningSent] = useState<Date | null>(null);
  const [lastEscalationSent, setLastEscalationSent] = useState<Date | null>(null);

  // Calculate SLA status based on current time and deadline
  const calculateSLAStatus = (): SLAStatus | null => {
    if (!slaDeadline || !slaTargetHours) return null;

    const now = new Date();
    const timeRemaining = slaDeadline.getTime() - now.getTime();
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return {
        status: 'breached',
        timeRemaining,
        hoursRemaining: Math.abs(hoursRemaining),
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: XCircle,
        message: 'SLA Breached - Immediate escalation required'
      };
    } else if (hoursRemaining < slaEscalationHours! / 2) {
      return {
        status: 'critical',
        timeRemaining,
        hoursRemaining,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: AlertTriangle,
        message: 'Critical - SLA deadline approaching rapidly'
      };
    } else if (hoursRemaining < slaEscalationHours!) {
      return {
        status: 'warning',
        timeRemaining,
        hoursRemaining,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertTriangle,
        message: 'Warning - SLA deadline approaching'
      };
    } else {
      return {
        status: 'normal',
        timeRemaining,
        hoursRemaining,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        message: 'On track - Within SLA timeline'
      };
    }
  };

  // Send SLA warnings and escalations
  const sendSLANotifications = async (currentStatus: SLAStatus) => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const shouldSendWarning = currentStatus.status === 'warning' && 
        (!lastWarningSent || (now.getTime() - lastWarningSent.getTime()) > 4 * 60 * 60 * 1000); // 4 hours

      const shouldSendEscalation = currentStatus.status === 'breached' && 
        (!lastEscalationSent || (now.getTime() - lastEscalationSent.getTime()) > 1 * 60 * 60 * 1000); // 1 hour

      if (shouldSendWarning) {
        // Send warning notification
        const notificationService = NotificationService.getInstance();
        await notificationService.createNotificationFromTemplate(
          'supervisor_sla_warning',
          user.id,
          'authority',
          user.role,
          {
            ISSUE_TITLE: issueTitle,
            AREA_NAME: areaName,
            PRIORITY: priority,
            TIME_REMAINING: Math.floor(currentStatus.hoursRemaining).toString()
          },
          issueId
        );
        setLastWarningSent(now);
        toast.info('SLA Warning', `SLA warning sent for issue: ${issueTitle}`);
      }

      if (shouldSendEscalation) {
        // Send escalation notification
        const notificationService = NotificationService.getInstance();
        await notificationService.sendEscalationNotification(
          issueId,
          issueTitle,
          'city_engineer',
          user.id
        );
        setLastEscalationSent(now);
        toast.error('SLA Breached', `Issue escalated due to SLA breach: ${issueTitle}`);
      }
    } catch (error) {
      console.error('Error sending SLA notifications:', error);
    }
  };

  // Update SLA status every minute
  useEffect(() => {
    const updateSLAStatus = () => {
      const newStatus = calculateSLAStatus();
      setSlaStatus(newStatus);
      
      if (newStatus && ['warning', 'critical', 'breached'].includes(newStatus.status)) {
        sendSLANotifications(newStatus);
      }
    };

    // Initial calculation
    updateSLAStatus();

    // Update every minute
    const interval = setInterval(updateSLAStatus, 60 * 1000);

    return () => clearInterval(interval);
  }, [slaDeadline, slaTargetHours, slaEscalationHours, status]);

  // Format time remaining
  const formatTimeRemaining = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  // Get progress percentage for SLA timeline
  const getSLAProgress = (): number => {
    if (!slaDeadline || !slaTargetHours) return 0;
    
    const now = new Date();
    const totalTime = slaTargetHours * 60 * 60 * 1000; // Convert to milliseconds
    const elapsed = now.getTime() - (slaDeadline.getTime() - totalTime);
    const progress = (elapsed / totalTime) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!slaDeadline || !slaTargetHours) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <h4 className="font-medium text-gray-900">SLA Information</h4>
            <p className="text-sm text-gray-500">No SLA configured for this issue</p>
          </div>
        </div>
      </div>
    );
  }

  if (!slaStatus) return null;

  const Icon = slaStatus.icon;
  const progress = getSLAProgress();

  return (
    <div className={`rounded-xl p-4 border-l-4 ${slaStatus.bgColor} ${slaStatus.color.replace('text-', 'border-l-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${slaStatus.bgColor}`}>
            <Icon className={`w-5 h-5 ${slaStatus.color}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">SLA Status</h4>
            <p className="text-sm text-gray-600 mb-2">{slaStatus.message}</p>
            
            {/* SLA Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  slaStatus.status === 'breached' ? 'bg-red-500' :
                  slaStatus.status === 'critical' ? 'bg-orange-500' :
                  slaStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Target: {slaTargetHours}h</span>
              <span>•</span>
              <span>Escalation: {slaEscalationHours}h</span>
              <span>•</span>
              <span className={slaStatus.color}>
                {slaStatus.status === 'breached' ? 'Breached' : 
                 `Remaining: ${formatTimeRemaining(slaStatus.hoursRemaining)}`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          slaStatus.status === 'breached' ? 'bg-red-100 text-red-800' :
          slaStatus.status === 'critical' ? 'bg-orange-100 text-orange-800' :
          slaStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {slaStatus.status.toUpperCase()}
        </div>
      </div>

      {/* Action Buttons for Critical/Breached Issues */}
      {['critical', 'breached'].includes(slaStatus.status) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {slaStatus.status === 'breached' ? 'Issue requires immediate escalation' : 'Consider escalating this issue'}
            </div>
            
            {user?.role === 'city_engineer' || user?.role === 'super_admin' ? (
              <button
                onClick={() => {
                  // This would trigger escalation workflow
                  toast.info('Escalation', 'Escalation workflow initiated');
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
              >
                Escalate Now
              </button>
            ) : (
              <span className="text-xs text-gray-500">
                Contact City Engineer for escalation
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
