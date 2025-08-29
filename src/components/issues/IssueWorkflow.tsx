'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  User, 
  Calendar,
  MapPin,
  FileText,
  Camera,
  MessageSquare
} from 'lucide-react';
import { firestoreService } from '@/lib/firebase';
import { slaUtils } from '@/lib/slaConfig';
import NotificationService from '@/lib/notifications';

interface IssueWorkflowProps {
  issue: any;
  onUpdate: (updatedIssue: any) => void;
  onClose: () => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  icon: React.ReactNode;
  timestamp?: Date;
  assignee?: string;
  notes?: string;
}

interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  allowedRoles: string[];
  requiresApproval?: boolean;
}

export default function IssueWorkflow({ issue, onUpdate, onClose }: IssueWorkflowProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionNotes, setActionNotes] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    initializeWorkflow();
  }, [issue]);

  const initializeWorkflow = () => {
    // Define workflow steps based on issue status
    const steps: WorkflowStep[] = [
      {
        id: 'reported',
        name: 'Issue Reported',
        description: 'Issue has been reported by citizen',
        status: 'completed',
        icon: <FileText className="w-5 h-5" />,
        timestamp: new Date(issue.createdAt),
        assignee: issue.reportedBy
      },
      {
        id: 'assigned',
        name: 'Assigned to Supervisor',
        description: 'Issue assigned to field supervisor',
        status: issue.status === 'pending' || issue.status === 'in_progress' || issue.status === 'resolved' ? 'completed' : 'pending',
        icon: <User className="w-5 h-5" />,
        timestamp: issue.assignedAt ? new Date(issue.assignedAt) : undefined,
        assignee: issue.assignedTo
      },
      {
        id: 'in_progress',
        name: 'Work in Progress',
        description: 'Field supervisor is working on the issue',
        status: issue.status === 'in_progress' || issue.status === 'resolved' ? 'completed' : 'pending',
        icon: <Clock className="w-5 h-5" />,
        timestamp: issue.startedAt ? new Date(issue.startedAt) : undefined,
        assignee: issue.assignedTo
      },
      {
        id: 'resolved',
        name: 'Issue Resolved',
        description: 'Issue has been resolved',
        status: issue.status === 'resolved' ? 'completed' : 'pending',
        icon: <CheckCircle className="w-5 h-5" />,
        timestamp: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
        assignee: issue.assignedTo
      }
    ];

    // Add escalation step if issue is escalated
    if (issue.status === 'escalated') {
      steps.splice(3, 0, {
        id: 'escalated',
        name: 'Escalated to Engineer',
        description: 'Issue escalated to city engineer',
        status: 'current',
        icon: <AlertTriangle className="w-5 h-5" />,
        timestamp: issue.escalatedAt ? new Date(issue.escalatedAt) : undefined,
        assignee: 'city_engineer'
      });
    }

    setWorkflowSteps(steps);
    setAvailableActions(getAvailableActions(issue, user?.role));
  };

  const getAvailableActions = (currentIssue: any, userRole?: string): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];

    // Super Admin actions
    if (userRole === 'super_admin') {
      actions.push(
        {
          id: 'assign',
          name: 'Assign Issue',
          description: 'Assign issue to a field supervisor',
          icon: <User className="w-4 h-4" />,
          color: 'blue',
          allowedRoles: ['super_admin']
        },
        {
          id: 'escalate',
          name: 'Escalate Issue',
          description: 'Escalate to city engineer',
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'orange',
          allowedRoles: ['super_admin']
        },
        {
          id: 'close',
          name: 'Close Issue',
          description: 'Close the issue permanently',
          icon: <XCircle className="w-4 h-4" />,
          color: 'red',
          allowedRoles: ['super_admin'],
          requiresApproval: true
        }
      );
    }

    // Field Supervisor actions
    if (userRole === 'field_supervisor' && currentIssue.assignedTo === user?.id) {
      actions.push(
        {
          id: 'start_work',
          name: 'Start Work',
          description: 'Begin working on the issue',
          icon: <Clock className="w-4 h-4" />,
          color: 'blue',
          allowedRoles: ['field_supervisor']
        },
        {
          id: 'update_progress',
          name: 'Update Progress',
          description: 'Add progress notes and photos',
          icon: <Camera className="w-4 h-4" />,
          color: 'green',
          allowedRoles: ['field_supervisor']
        },
        {
          id: 'resolve',
          name: 'Mark Resolved',
          description: 'Mark issue as resolved',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'green',
          allowedRoles: ['field_supervisor']
        },
        {
          id: 'request_escalation',
          name: 'Request Escalation',
          description: 'Request escalation to city engineer',
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'orange',
          allowedRoles: ['field_supervisor']
        }
      );
    }

    // City Engineer actions
    if (userRole === 'city_engineer') {
      actions.push(
        {
          id: 'review_escalation',
          name: 'Review Escalation',
          description: 'Review escalated issue',
          icon: <FileText className="w-4 h-4" />,
          color: 'blue',
          allowedRoles: ['city_engineer']
        },
        {
          id: 'reassign',
          name: 'Reassign Issue',
          description: 'Reassign to different supervisor',
          icon: <User className="w-4 h-4" />,
          color: 'purple',
          allowedRoles: ['city_engineer']
        },
        {
          id: 'approve_resolution',
          name: 'Approve Resolution',
          description: 'Approve supervisor resolution',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'green',
          allowedRoles: ['city_engineer']
        }
      );
    }

    return actions;
  };

  const handleAction = async (actionId: string) => {
    setSelectedAction(actionId);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedAction || !user) return;

    setLoading(true);
    try {
      const updatedIssue = { ...issue };
      const now = new Date();

      switch (selectedAction) {
        case 'assign':
          // This would typically open a user selection modal
          updatedIssue.status = 'pending';
          updatedIssue.assignedAt = now;
          updatedIssue.assignedTo = 'selected_supervisor_id';
          break;

        case 'start_work':
          updatedIssue.status = 'in_progress';
          updatedIssue.startedAt = now;
          break;

        case 'update_progress':
          // Add progress note
          if (!updatedIssue.progressNotes) updatedIssue.progressNotes = [];
          updatedIssue.progressNotes.push({
            note: actionNotes,
            timestamp: now,
            userId: user.id,
            userName: user.name
          });
          break;

        case 'resolve':
          updatedIssue.status = 'resolved';
          updatedIssue.resolvedAt = now;
          updatedIssue.resolutionNotes = actionNotes;
          break;

        case 'escalate':
        case 'request_escalation':
          updatedIssue.status = 'escalated';
          updatedIssue.escalatedAt = now;
          updatedIssue.escalatedBy = user.id;
          updatedIssue.escalationReason = actionNotes;
          break;

        case 'approve_resolution':
          updatedIssue.status = 'closed';
          updatedIssue.closedAt = now;
          updatedIssue.closedBy = user.id;
          break;

        case 'close':
          updatedIssue.status = 'closed';
          updatedIssue.closedAt = now;
          updatedIssue.closedBy = user.id;
          updatedIssue.closeReason = actionNotes;
          break;
      }

      // Update issue in Firestore
      await firestoreService.updateIssue(issue.id, updatedIssue);

      // Send notifications based on action
      await sendActionNotifications(selectedAction, updatedIssue);

      // Update SLA if needed
      if (selectedAction === 'resolve' || selectedAction === 'approve_resolution') {
        await updateSLACompliance(updatedIssue);
      }

      onUpdate(updatedIssue);
      toast.success('Action completed successfully');
      setShowActionModal(false);
      setActionNotes('');
      setSelectedAction('');

    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Error', 'Failed to execute action');
    } finally {
      setLoading(false);
    }
  };

  const sendActionNotifications = async (actionId: string, updatedIssue: any) => {
    try {
      const notificationService = NotificationService.getInstance();

      switch (actionId) {
        case 'assign':
          await notificationService.createNotificationFromTemplate(
            'supervisor_new_assignment',
            updatedIssue.assignedTo,
            'authority',
            'field_supervisor',
            {
              ISSUE_TITLE: updatedIssue.title,
              AREA_NAME: updatedIssue.area,
              PRIORITY: updatedIssue.priority
            },
            updatedIssue.id
          );
          break;

        case 'resolve':
          await notificationService.createNotificationFromTemplate(
            'citizen_resolution_confirmed',
            updatedIssue.reportedBy,
            'citizen',
            'citizen',
            {
              ISSUE_TITLE: updatedIssue.title
            },
            updatedIssue.id
          );
          break;

        case 'escalate':
        case 'request_escalation':
          await notificationService.sendEscalationNotification(
            updatedIssue.id,
            updatedIssue.title,
            'city_engineer',
            user?.name || 'System'
          );
          break;
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const updateSLACompliance = async (updatedIssue: any) => {
    try {
      const slaStatus = slaUtils.getSlaStatus(updatedIssue);
      const timeRemaining = slaUtils.getTimeRemaining(updatedIssue);

      await firestoreService.updateIssue(updatedIssue.id, {
        slaStatus,
        timeRemaining: timeRemaining / (1000 * 60 * 60), // Convert to hours
        slaCompliant: slaStatus === 'compliant'
      });
    } catch (error) {
      console.error('Error updating SLA compliance:', error);
    }
  };

  const getSLAStatus = () => {
    if (!issue.slaDeadline) return null;

    const slaStatus = slaUtils.getSlaStatus(issue);
    const timeRemaining = slaUtils.getTimeRemaining(issue);
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);

    return {
      status: slaStatus,
      hoursRemaining,
      isBreached: slaStatus === 'breached',
      isWarning: slaStatus === 'warning'
    };
  };

  const slaInfo = getSLAStatus();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issue Workflow</h2>
          <p className="text-gray-600">Manage issue lifecycle and status transitions</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Issue Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{issue.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{issue.area}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Created {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* SLA Status */}
      {slaInfo && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          slaInfo.isBreached ? 'border-red-500 bg-red-50' :
          slaInfo.isWarning ? 'border-orange-500 bg-orange-50' :
          'border-green-500 bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">SLA Status</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${
                slaInfo.isBreached ? 'text-red-600' :
                slaInfo.isWarning ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {slaInfo.status.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">
                {slaInfo.hoursRemaining > 0 
                  ? `${Math.round(slaInfo.hoursRemaining)}h remaining`
                  : `${Math.abs(Math.round(slaInfo.hoursRemaining))}h overdue`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Progress</h3>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.status === 'completed' ? 'bg-green-100 text-green-600' :
                step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                step.status === 'failed' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step.icon}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-gray-900' :
                      step.status === 'current' ? 'text-blue-900' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </h4>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {step.timestamp && (
                    <span className="text-xs text-gray-400">
                      {step.timestamp.toLocaleDateString()}
                    </span>
                  )}
                </div>
                {step.assignee && (
                  <div className="mt-1 flex items-center space-x-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{step.assignee}</span>
                  </div>
                )}
                {step.notes && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {step.notes}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`p-4 rounded-lg border border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors text-left`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600`}>
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{action.name}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {availableActions.find(a => a.id === selectedAction)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              {availableActions.find(a => a.id === selectedAction)?.description}
            </p>
            
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50`}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Execute Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
