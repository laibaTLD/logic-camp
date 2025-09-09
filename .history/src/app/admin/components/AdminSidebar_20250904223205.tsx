'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound, 
  FolderOpen, 
  CheckSquare,
  BarChart3,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Archive,
  Filter
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateTeam?: () => void;
  onCreateProject?: () => void;
}

export default function AdminSidebar({ activeSection, onSectionChange, onCreateTeam, onCreateProject }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Stats'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Manage Users',
      subItems: [
        { id: 'approve-users', label: 'Approve Users', icon: UserCheck },
        { id: 'block-users', label: 'Block Users', icon: UserX },
        { id: 'assign-roles', label: 'Assign Roles', icon: Shield }
      ]
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: UsersRound,
      description: 'Team Management',
      subItems: [
        { id: 'create-team', label: 'Create Team', icon: Plus },
        { id: 'manage-teams', label: 'Manage Teams', icon: UsersRound },
        { id: 'assign-leads', label: 'Assign Leads', icon: Shield }
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      description: 'Project Management',
      subItems: [
        { id: 'active-projects', label: 'Active Projects', icon: FolderOpen },
        { id: 'create-project', label: 'Create Project', icon: Plus },
        { id: 'archive-projects', label: 'Archive Projects', icon: Archive }
      ]
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Global Task View',
      subItems: [
        { id: 'all-tasks', label: 'All Tasks', icon: CheckSquare },
        { id: 'task-filters', label: 'Filters', icon: Filter }
      ]
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    // Close mobile sidebar after navigation
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800/90 border border-slate-700/50 text-white hover:bg-slate-700/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl overflow-y-auto z-40 transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-sm text-slate-400">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id} className="space-y-1">
              {/* Main Navigation Item */}
              <button
                onClick={() => handleSectionClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent hover:border-slate-600/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                )}
              </button>

              {/* Sub Items - Show when active */}
              {isActive && item.subItems && (
                <div className="ml-8 space-y-1 mt-2">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleSectionClick(subItem.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-all duration-200 group"
                      >
                        <SubIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Stats Section */}
      <div className="p-4 mt-auto border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Users</span>
              <span className="text-white font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Teams</span>
              <span className="text-white font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Projects</span>
              <span className="text-white font-medium">--</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending Tasks</span>
              <span className="text-white font-medium">--</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}