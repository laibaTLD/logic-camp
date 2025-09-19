'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import UserProfile from '../../components/UserProfile';
import UserActivityLog from '../../components/UserActivityLog';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teamLead' | 'employee';
  isActive: boolean;
  isApproved: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface CurrentUser {
  id: number;
  role: string;
}

const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeModal, setActiveModal] = useState<'profile' | 'activity' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ id: data.user.id, role: data.user.role });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'approve' | 'reject' | 'delete') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${userId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User ${action}d successfully`
        });
        fetchUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || `Failed to ${action} user`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.isActive && user.isApproved) ||
                         (statusFilter === 'inactive' && !user.isActive) ||
                         (statusFilter === 'pending' && !user.isApproved);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'teamLead': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'employee': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (isActive: boolean, isApproved: boolean) => {
    if (!isApproved) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (!isActive) return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  const getStatusText = (isActive: boolean, isApproved: boolean) => {
    if (!isApproved) return 'Pending';
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'teamLead';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-6 w-48"></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-white/60">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveModal('profile')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200"
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveModal('activity')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200"
            >
              Activity Log
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teamLead">Team Lead</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3 rounded-xl transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">User</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Role</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Joined</th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium">Last Login</th>
                  {canManageUsers && (
                    <th className="text-right py-4 px-6 text-white/80 font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={canManageUsers ? 6 : 5} className="text-center py-8 text-white/60">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-white/60 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive, user.isApproved)}`}>
                          {getStatusText(user.isActive, user.isApproved)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white/80 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-white/80 text-sm">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      {canManageUsers && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            {!user.isApproved && (
                              <>
                                <button
                                  onClick={() => handleUserAction(user.id, 'approve')}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Approve User"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleUserAction(user.id, 'reject')}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Reject User"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {user.isApproved && (
                              <button
                                onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                                className={`${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} transition-colors`}
                                title={user.isActive ? 'Deactivate User' : 'Activate User'}
                              >
                                {user.isActive ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
                                  </svg>
                                )}
                              </button>
                            )}
                            {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                              <button
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete User"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="text-2xl font-bold text-white mb-2">{users.length}</div>
            <div className="text-white/60">Total Users</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {users.filter(u => u.isActive && u.isApproved).length}
            </div>
            <div className="text-white/60">Active Users</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {users.filter(u => !u.isApproved).length}
            </div>
            <div className="text-white/60">Pending Approval</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {users.filter(u => !u.isActive).length}
            </div>
            <div className="text-white/60">Inactive Users</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <UserProfile onClose={() => setActiveModal(null)} />
          </div>
        </div>
      )}


      {activeModal === 'activity' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <UserActivityLog onClose={() => setActiveModal(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;