'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import NotificationService from '@/lib/notifications';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface WorkflowStep {
  status: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  allowedRoles: string[];
  requiresComment?: boolean;
  requiresAssignment?: boolean;
}

interface IssueWorkflowProps {
  issueId: string;
  currentStatus: string;
  currentAssignee?: string;
  onStatusChange: (newStatus: string) => void;
  onClose: () => void;
}

const workflowSteps: WorkflowStep[] = [
  {
    status: 'pending',
    label: 'Pending',
    description: 'Issue is awaiting assignment',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    allowedRoles: ['super_admin', 'city_engineer', 'field_supervisor']
  },
  {
    status: 'assigned',
    label: 'Assigned',
    description: 'Issue has been assigned to a worker',
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    allowedRoles: ['super_admin', 'city_engineer'],
    requiresAssignment: true
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    description: 'Work has begun on the issue',
    icon: Play,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    allowedRoles: ['super_admin', 'city_engineer', 'field_supervisor'],
    requiresComment: true
  },
  {
    status: 'resolved',
    label: 'Resolved',
    description: 'Issue has been resolved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    allowedRoles: ['super_admin', 'city_engineer', 'field_supervisor'],
    requiresComment: true
  },
  {
    status: 'escalated',
    label: 'Escalated',
    description: 'Issue requires higher-level attention',
    icon: ArrowUpRight,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    allowedRoles: ['super_admin', 'city_engineer'],
    requiresComment: true
  },
  {
    status: 'closed',
    label: 'Closed',
    description: 'Issue has been verified and closed',
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    allowedRoles: ['super_admin', 'auditor'],
    requiresComment: true
  }
];

export default function IssueWorkflow({ 
  issueId, 
  currentStatus, 
  currentAssignee, 
  onStatusChange, 
  onClose 
}: IssueWorkflowProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  // Get available workflow steps based on user role and current status
  const getAvailableSteps = () => {
    if (!user) return [];
    
    return workflowSteps.filter(step => {
      // Check if user has permission for this step
      const hasPermission = step.allowedRoles.includes(user.role) || user.role === 'super_admin';
      
      // Check if step is a valid transition from current status
      const isValidTransition = isValidStatusTransition(currentStatus, step.status);
      
      return hasPermission && isValidTransition;
    });
  };

  // Validate status transition
  const isValidStatusTransition = (fromStatus: string, toStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'pending': ['assigned', 'in_progress'],
      'assigned': ['in_progress', 'pending'],
      'in_progress': ['resolved', 'escalated', 'pending'],
      'resolved': ['closed', 'in_progress'],
      'escalated': ['in_progress', 'resolved'],
      'closed': [] // No transitions from closed
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedStatus) {
      toast.error('Selection Required', 'Please select a new status');
      return;
    }

    const selectedStep = workflowSteps.find(step => step.status === selectedStatus);
    if (!selectedStep) return;

    // Validate requirements
    if (selectedStep.requiresComment && !comment.trim()) {
      toast.error('Comment Required', 'A comment is required for this status change');
      return;
    }

    if (selectedStep.requiresAssignment && !currentAssignee) {
      toast.error('Assignment Required', 'This status requires the issue to be assigned');
      return;
    }

    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        status: selectedStatus,
        updatedAt: new Date()
      };

      // Add comment if required
      if (comment.trim()) {
        updateData.comments = [{
          id: Date.now().toString(),
          text: comment,
          userId: user?.id || 'unknown',
          userName: user?.name || 'Unknown User',
          userRole: user?.role || 'unknown',
          timestamp: new Date(),
          type: 'status_change',
          fromStatus: currentStatus,
          toStatus: selectedStatus
        }];
      }

      // Add resolved date if status is resolved
      if (selectedStatus === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      // Update issue in Firestore
      await firestoreService.updateIssue(issueId, updateData);

      // Send notifications based on status change
      try {
        if (selectedStatus === 'escalated') {
          // Notify city engineer about escalation
          await NotificationService.sendEscalationNotification(
            issueId,
            'Issue Title', // This should come from props
            'city_engineer',
            currentAssignee || 'unknown'
          );
        } else if (selectedStatus === 'resolved') {
          // Notify relevant stakeholders about resolution
          const notification = NotificationService.createFromTemplate(
            'status_updated',
            'system',
            'city_engineer',
            {
              ISSUE_TITLE: 'Issue Title', // This should come from props
              STATUS: selectedStep.label
            },
            { issueId }
          );
          await NotificationService.createNotification(notification);
        } else {
          // General status update notification
          const notification = NotificationService.createFromTemplate(
            'status_updated',
            'system',
            'field_supervisor',
            {
              ISSUE_TITLE: 'Issue Title', // This should come from props
              STATUS: selectedStep.label
            },
            { issueId }
          );
          await NotificationService.createNotification(notification);
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't fail the status update if notifications fail
      }

      toast.success('Status Updated', `Issue status changed to ${selectedStep.label}`);
      onStatusChange(selectedStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Update Failed', 'Failed to update issue status');
    } finally {
      setLoading(false);
    }
  };

  // Handle status selection
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    const step = workflowSteps.find(s => s.status === status);
    
    if (step?.requiresComment) {
      setShowCommentInput(true);
    } else {
      setShowCommentInput(false);
      setComment('');
    }
  };

  const availableSteps = getAvailableSteps();
  const currentStep = workflowSteps.find(step => step.status === currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Play className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Issue Workflow</h2>
                <p className="text-blue-100">Update issue status and progress</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
            {currentStep && (
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${currentStep.bgColor}`}>
                  <currentStep.icon className={`w-5 h-5 ${currentStep.color}`} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentStep.label}</div>
                  <div className="text-sm text-gray-600">{currentStep.description}</div>
                </div>
              </div>
            )}
          </div>

          {/* Available Status Transitions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Transitions</h3>
            
            {availableSteps.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No status transitions available for your role</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSteps.map((step) => {
                  const Icon = step.icon;
                  const isSelected = selectedStatus === step.status;
                  
                  return (
                    <div
                      key={step.status}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleStatusSelect(step.status)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${step.bgColor}`}>
                          <Icon className={`w-5 h-5 ${step.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{step.label}</div>
                          <div className="text-sm text-gray-600">{step.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment Input */}
          {showCommentInput && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Change Comment</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain the reason for this status change..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                A comment is required for this status change to provide context and track progress.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleStatusChange}
              disabled={!selectedStatus || loading || (showCommentInput && !comment.trim())}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
