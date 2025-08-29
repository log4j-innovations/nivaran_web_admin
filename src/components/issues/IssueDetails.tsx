'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import SLAIndicator from './SLAIndicator';
import IssueAssignment from './IssueAssignment';
import IssueWorkflow from './IssueWorkflow';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Edit,
  UserPlus,
  Play,
  X,
  Camera,
  Tag,
  DollarSign
} from 'lucide-react';

interface IssueDetailsProps {
  issueId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  area: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  slaDeadline?: Date;
  slaTargetHours?: number;
  slaEscalationHours?: number;
  estimatedCost?: number;
  images?: string[];
  tags?: string[];
  comments?: Array<{
    id: string;
    text: string;
    userId: string;
    userName: string;
    userRole: string;
    timestamp: Date;
    type: 'comment' | 'status_change';
    fromStatus?: string;
    toStatus?: string;
  }>;
}

export default function IssueDetails({ issueId, onClose, onUpdate }: IssueDetailsProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch issue details
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const issueData = await firestoreService.getIssueById(issueId);
        
                 if (issueData) {
           // Transform Firestore data to match Issue interface
           const transformedIssue: Issue = {
             id: issueData.id,
             title: ((issueData as Record<string, unknown>).title as string) || '',
             description: ((issueData as Record<string, unknown>).description as string) || '',
             status: ((issueData as Record<string, unknown>).status as string) as Issue['status'],
             priority: ((issueData as Record<string, unknown>).priority as string) as Issue['priority'],
             severity: ((issueData as Record<string, unknown>).severity as string) as Issue['severity'],
             category: ((issueData as Record<string, unknown>).category as string) || '',
             location: {
               address: (((issueData as Record<string, unknown>).location as Record<string, unknown>)?.address as string) || '',
               city: (((issueData as Record<string, unknown>).location as Record<string, unknown>)?.city as string) || '',
               state: (((issueData as Record<string, unknown>).location as Record<string, unknown>)?.state as string) || '',
               zipCode: (((issueData as Record<string, unknown>).location as Record<string, unknown>)?.zipCode as string) || ''
             },
             area: ((issueData as Record<string, unknown>).area as string) || '',
             reportedBy: ((issueData as Record<string, unknown>).reportedBy as string) || '',
             assignedTo: (issueData as Record<string, unknown>).assignedTo as string | undefined,
             createdAt: ((issueData as Record<string, unknown>).createdAt as { toDate(): Date }).toDate(),
             updatedAt: ((issueData as Record<string, unknown>).updatedAt as { toDate(): Date }).toDate(),
             slaDeadline: (issueData as Record<string, unknown>).slaDeadline ? ((issueData as Record<string, unknown>).slaDeadline as { toDate(): Date }).toDate() : undefined,
             slaTargetHours: ((issueData as Record<string, unknown>).slaTargetHours as number) || undefined,
             slaEscalationHours: ((issueData as Record<string, unknown>).slaEscalationHours as number) || undefined,
             estimatedCost: ((issueData as Record<string, unknown>).estimatedCost as number) || undefined,
             images: ((issueData as Record<string, unknown>).images as string[]) || [],
             tags: ((issueData as Record<string, unknown>).tags as string[]) || [],
             comments: (issueData as Record<string, unknown>).comments ? ((issueData as Record<string, unknown>).comments as any[]).map(comment => ({
               ...comment,
               timestamp: (comment.timestamp as { toDate(): Date }).toDate()
             })) : []
           };
          
          setIssue(transformedIssue);
        }
      } catch (error) {
        console.error('Error fetching issue:', error);
        toast.error('Fetch Failed', 'Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, toast]);

  // Handle status update from workflow
  const handleStatusUpdate = (newStatus: string) => {
    if (issue) {
      setIssue(prev => prev ? { ...prev, status: newStatus as Issue['status'] } : null);
      onUpdate();
    }
  };

  // Handle assignment update
  const handleAssignmentUpdate = (newAssignee: string | null) => {
    if (issue) {
      setIssue(prev => prev ? { ...prev, assignedTo: newAssignee || undefined } : null);
      onUpdate();
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !issue) return;

    try {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown User',
        userRole: user?.role || 'unknown',
        timestamp: new Date(),
        type: 'comment' as const
      };

      // Update issue with new comment
      const updatedComments = [...(issue.comments || []), comment];
      await firestoreService.updateIssue(issueId, { comments: updatedComments });
      
      setIssue(prev => prev ? { ...prev, comments: updatedComments } : null);
      setNewComment('');
      toast.success('Comment Added', 'Comment has been added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Comment Failed', 'Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h3>
          <p className="text-gray-600 mb-4">The requested issue could not be found.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Issue Details</h2>
                <p className="text-blue-100">#{issue.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAssignment(true)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign</span>
              </button>
              <button
                onClick={() => setShowWorkflow(true)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Workflow</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Issue Title and Status */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
            <div className="flex items-center space-x-4">
              <StatusBadge status={issue.status} size="lg" />
              <PriorityIndicator priority={issue.priority} variant="badge" size="lg" />
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {issue.severity}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{issue.description}</p>
              </div>

              {/* Location */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{issue.location.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">City</label>
                    <p className="text-gray-900">{issue.location.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">State</label>
                    <p className="text-gray-900">{issue.location.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ZIP Code</label>
                    <p className="text-gray-900">{issue.location.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Images */}
              {issue.images && issue.images.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-blue-600" />
                    Photos ({issue.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Comments ({issue.comments?.length || 0})
                </h3>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Add Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {issue.comments && issue.comments.length > 0 ? (
                    issue.comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{comment.userName}</span>
                            <span className="text-sm text-gray-500">({comment.userRole})</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {comment.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                        {comment.type === 'status_change' && (
                          <div className="mt-2 text-sm text-blue-600">
                            Status changed from {comment.fromStatus} to {comment.toStatus}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-gray-900 capitalize">{issue.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Area</label>
                    <p className="text-gray-900">{issue.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reported By</label>
                    <p className="text-gray-900">{issue.reportedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned To</label>
                    <p className="text-gray-900">{issue.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {/* SLA Information */}
              {issue.slaDeadline && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Status</h3>
                                     <SLAIndicator deadline={issue.slaDeadline} targetHours={issue.slaTargetHours || 24} />
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="text-gray-900">{issue.slaTargetHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Escalation:</span>
                      <span className="text-gray-900">{issue.slaEscalationHours}h</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{issue.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="text-gray-900">{issue.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Cost Information */}
              {issue.estimatedCost && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Cost Estimate
                  </h3>
                  <div className="text-2xl font-bold text-green-600">
                    ${issue.estimatedCost.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Tags */}
              {issue.tags && issue.tags.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-blue-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssignment && (
        <IssueAssignment
          issueId={issue.id}
          currentAssignee={issue.assignedTo}
          onClose={() => setShowAssignment(false)}
          onAssignmentChange={handleAssignmentUpdate}
        />
      )}

      {showWorkflow && (
        <IssueWorkflow
          issueId={issue.id}
          currentStatus={issue.status}
          currentAssignee={issue.assignedTo}
          onStatusChange={handleStatusUpdate}
          onClose={() => setShowWorkflow(false)}
        />
      )}
    </div>
  );
}
