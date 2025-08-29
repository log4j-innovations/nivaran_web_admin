'use client';

import React from 'react';
import { MapPin, Clock, User, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import SLAIndicator from './SLAIndicator';

interface IssueCardProps {
  issue: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    location: {
      address: string;
      city: string;
    };
    area: string;
    assignedTo?: string;
    createdAt: Date;
    slaDeadline?: Date;
    slaTargetHours?: number;
    slaEscalationHours?: number;
  };
  onClick: () => void;
}

export default function IssueCard({ issue, onClick }: IssueCardProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      pothole: '🕳️',
      street_light: '💡',
      water_leak: '💧',
      traffic_signal: '🚦',
      sidewalk: '🚶',
      drainage: '🌊',
      debris: '🌳',
      other: '❓'
    };
    return icons[category] || '❓';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'border-gray-200 bg-gray-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50'
    };
    return colors[priority] || 'border-gray-200 bg-gray-50';
  };

  return (
    <div 
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${getPriorityColor(issue.priority)}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getCategoryIcon(issue.category)}</div>
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{issue.title}</h3>
            <p className="text-sm text-gray-600 capitalize">{issue.category.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <StatusBadge status={issue.status} size="sm" />
          <PriorityIndicator priority={issue.priority} variant="badge" size="sm" />
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{issue.description}</p>

      {/* Location */}
      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span className="truncate">{issue.location.address}, {issue.location.city}</span>
      </div>

      {/* SLA Status */}
      {issue.slaDeadline && (
        <div className="mb-4">
                  <SLAIndicator
          deadline={issue.slaDeadline}
          targetHours={issue.slaTargetHours || 0}
          size="sm"
          showCountdown={false}
        />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{issue.createdAt.toLocaleDateString()}</span>
          </div>
          
          {issue.assignedTo && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>Assigned</span>
            </div>
          )}
        </div>

        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
