'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';

interface ActivityEntry {
  id: number;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

interface UserActivityLogProps {
  onClose?: () => void;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, [currentPage, filters]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`/api/user/activity?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load activity log',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      resource: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5v10z" />
          </svg>
        );
      case 'LOGOUT':
        return (
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 7l-5 5 5 5V7z" />
          </svg>
        );
      case 'CREATE':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'UPDATE':
      case 'UPDATE_PROFILE':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        );
      case 'DELETE':
        return (
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        );
      case 'VIEW':
      case 'VIEW_PROFILE':
        return (
          <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'text-green-300';
      case 'LOGOUT': return 'text-red-300';
      case 'CREATE': return 'text-blue-300';
      case 'UPDATE':
      case 'UPDATE_PROFILE': return 'text-yellow-300';
      case 'DELETE': return 'text-red-300';
      case 'VIEW':
      case 'VIEW_PROFILE': return 'text-indigo-300';
      default: return 'text-gray-300';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatResource = (resource: string) => {
    return resource.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Activity Log</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Resource
              </label>
              <select
                value={filters.resource}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">All Resources</option>
                <option value="USER">User</option>
                <option value="PROJECT">Project</option>
                <option value="TASK">Task</option>
                <option value="TEAM">Team</option>
                <option value="MESSAGE">Message</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            No activity found
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium ${getActionColor(activity.action)}`}>
                      {formatAction(activity.action)}
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/80">
                      {formatResource(activity.resource)}
                    </span>
                    {activity.resourceId && (
                      <>
                        <span className="text-white/60">•</span>
                        <span className="text-white/60 text-sm">
                          ID: {activity.resourceId}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-white/60 mb-2">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="text-xs text-white/50">
                      <details className="cursor-pointer">
                        <summary className="hover:text-white/70 transition-colors">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-white/50">
                  <div>IP: {activity.ipAddress}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-white/60">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityLog;