'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { RoleGuard } from '@/components/RoleGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { firestoreService } from '@/lib/firebase';
import NotificationService from '@/lib/notifications';

interface SLAMonitorData {
  totalIssues: number;
  slaCompliant: number;
  slaWarning: number;
  slaBreached: number;
  escalatedIssues: number;
  averageResolutionTime: number;
  criticalIssues: number;
}

interface SLAIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date;
  slaDeadline: Date;
  timeRemaining: number;
  isEscalated: boolean;
  assignedTo?: string;
  area: string;
}

export default function SLAMonitorPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [slaData, setSlaData] = useState<SLAMonitorData | null>(null);
  const [criticalIssues, setCriticalIssues] = useState<SLAIssue[]>([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [autoEscalation, setAutoEscalation] = useState(true);

  useEffect(() => {
    loadSLAData();
    const interval = setInterval(loadSLAData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedArea]);

  const loadSLAData = async () => {
    try {
      setLoading(true);
      const issues = await firestoreService.getIssues();
      
      // Calculate SLA metrics
      const now = new Date();
      const slaIssues: SLAIssue[] = [];
      let compliant = 0;
      let warning = 0;
      let breached = 0;
      let escalated = 0;
      let critical = 0;
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      issues.forEach((issue: any) => {
        if (issue.slaDeadline) {
          const deadline = new Date(issue.slaDeadline);
          const timeRemaining = deadline.getTime() - now.getTime();
          const hoursRemaining = timeRemaining / (1000 * 60 * 60);
          
          const slaIssue: SLAIssue = {
            id: issue.id,
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
            category: issue.category,
            createdAt: new Date(issue.createdAt),
            slaDeadline: deadline,
            timeRemaining: hoursRemaining,
            isEscalated: issue.status === 'escalated',
            assignedTo: issue.assignedTo,
            area: issue.area
          };

          if (issue.status === 'resolved' && issue.resolvedAt) {
            const resolutionTime = (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
            totalResolutionTime += resolutionTime;
            resolvedCount++;
          }

          if (issue.status === 'escalated') {
            escalated++;
          }

          if (issue.priority === 'critical') {
            critical++;
          }

          if (hoursRemaining < 0) {
            breached++;
            if (!issue.isEscalated && autoEscalation) {
              escalateIssue(issue.id, issue.title);
            }
          } else if (hoursRemaining <= 4) {
            warning++;
            if (issue.priority === 'critical' && !issue.isEscalated) {
              escalateIssue(issue.id, issue.title);
            }
          } else {
            compliant++;
          }

          slaIssues.push(slaIssue);
        }
      });

      // Filter by area if selected
      const filteredIssues = selectedArea === 'all' 
        ? slaIssues 
        : slaIssues.filter(issue => issue.area === selectedArea);

      const criticalIssuesList = filteredIssues
        .filter(issue => issue.priority === 'critical' && issue.status !== 'resolved')
        .sort((a, b) => a.timeRemaining - b.timeRemaining);

      setCriticalIssues(criticalIssuesList);

      const mockData: SLAMonitorData = {
        totalIssues: issues.length,
        slaCompliant: compliant,
        slaWarning: warning,
        slaBreached: breached,
        escalatedIssues: escalated,
        averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
        criticalIssues: critical
      };

      setSlaData(mockData);
    } catch (error) {
      console.error('Error loading SLA data:', error);
      toast.error('Error', 'Failed to load SLA monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const escalateIssue = async (issueId: string, issueTitle: string) => {
    try {
      await firestoreService.updateIssue(issueId, {
        status: 'escalated',
        updatedAt: new Date(),
        escalatedAt: new Date()
      });

      // Send escalation notification
      const notificationService = NotificationService.getInstance();
      await notificationService.sendEscalationNotification(
        issueId,
        issueTitle,
        'city_engineer',
        'system'
      );

      toast.success('Issue Escalated', `${issueTitle} has been escalated to City Engineer`);
    } catch (error) {
      console.error('Error escalating issue:', error);
      toast.error('Escalation Failed', 'Failed to escalate issue');
    }
  };

  const getSLAStatusColor = (hoursRemaining: number) => {
    if (hoursRemaining < 0) return 'text-red-600';
    if (hoursRemaining <= 4) return 'text-orange-600';
    return 'text-green-600';
  };

  const getSLAStatusIcon = (hoursRemaining: number) => {
    if (hoursRemaining < 0) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (hoursRemaining <= 4) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['super_admin', 'city_engineer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SLA Monitor</h1>
                <p className="text-gray-600">Real-time SLA tracking and escalation management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoEscalation}
                  onChange={(e) => setAutoEscalation(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto Escalation</span>
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Areas</option>
                <option value="central_delhi">Central Delhi</option>
                <option value="ghaziabad">Ghaziabad</option>
                <option value="gurgaon">Gurgaon</option>
                <option value="faridabad">Faridabad</option>
                <option value="rajkot_rmc">Rajkot RMC</option>
                <option value="rajkot_ruda">Rajkot RUDA</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* SLA Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Compliant</p>
                  <p className="text-2xl font-bold text-green-600">{slaData?.slaCompliant}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warning</p>
                  <p className="text-2xl font-bold text-orange-600">{slaData?.slaWarning}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Breached</p>
                  <p className="text-2xl font-bold text-red-600">{slaData?.slaBreached}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-purple-600">{slaData?.escalatedIssues}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {criticalIssues.length > 0 && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">
                  Critical Issues Requiring Immediate Attention ({criticalIssues.length})
                </h3>
              </div>
              <div className="space-y-3">
                {criticalIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      {getSLAStatusIcon(issue.timeRemaining)}
                      <div>
                        <p className="font-medium text-gray-900">{issue.title}</p>
                        <p className="text-sm text-gray-600">{issue.area} • {issue.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${getSLAStatusColor(issue.timeRemaining)}`}>
                        {issue.timeRemaining < 0 
                          ? `${Math.abs(Math.round(issue.timeRemaining))}h overdue`
                          : `${Math.round(issue.timeRemaining)}h remaining`
                        }
                      </span>
                      {!issue.isEscalated && (
                        <button
                          onClick={() => escalateIssue(issue.id, issue.title)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Escalate Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLA Performance Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {slaData ? Math.round((slaData.slaCompliant / slaData.totalIssues) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {slaData?.averageResolutionTime.toFixed(1)}h
                </div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {slaData?.criticalIssues}
                </div>
                <p className="text-sm text-gray-600">Critical Issues</p>
              </div>
            </div>
          </div>

          {/* SLA Rules & Policies */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Rules & Escalation Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Priority-based SLA Targets</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical:</span>
                    <span className="font-medium">6-12 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">High:</span>
                    <span className="font-medium">12-24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium:</span>
                    <span className="font-medium">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low:</span>
                    <span className="font-medium">48-72 hours</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Escalation Triggers</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 4 hours before SLA deadline (warning)</li>
                  <li>• SLA breach (automatic escalation)</li>
                  <li>• Critical priority issues (immediate)</li>
                  <li>• Multiple failed attempts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
