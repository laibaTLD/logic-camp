'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Calendar, Shield, X } from 'lucide-react';
import { useUser as useUserContext } from '@/lib/context/UserContext';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'teamLead':
        return 'Team Lead';
      case 'employee':
        return 'Employee';
      case 'user':
        return 'User';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'teamLead':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'employee':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'user':
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm hover:bg-white/5 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{user.name || 'Profile'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Profile Details</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 space-y-4">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-white">{user.name}</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getRoleColor(user.role)}`}>
                  <Shield className="h-3 w-3" />
                  {getRoleDisplay(user.role)}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">Email Address</div>
                  <div className="text-sm text-white">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">Member Since</div>
                  <div className="text-sm text-white">{formatDate(user.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Shield className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">Account Type</div>
                  <div className="text-sm text-white">{getRoleDisplay(user.role)}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 rounded-b-2xl">
            <div className="text-xs text-slate-400 text-center">
              Profile information is read-only
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
