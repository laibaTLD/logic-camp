'use client';
import React from 'react';
import { Users, UsersRound, FolderOpen, CheckSquare, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { User, Team, Project, Task } from '../hooks/useAdminData';

interface DashboardOverviewProps {
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  loadingUsers: boolean;
  loadingTeams: boolean;
  loadingProjects: boolean;
  loadingTasks: boolean;
}

export default function DashboardOverview({
  users,
  teams,
  projects,
  tasks,
  loadingUsers,
  loadingTeams,
  loadingProjects,
  loadingTasks
}: DashboardOverviewProps) {
  // Calculate stats
  const totalUsers = users.length;
  const approvedUsers = users.filter(user => user.isApproved).length;
  const pendingUsers = users.filter(user => !user.isApproved).length;
  
  const totalTeams = teams.length;
  const teamsWithMembers = teams.filter(team => team.members && team.members.length > 0).length;
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter(project => project.status === 'active').length;
  const completedProjects = projects.filter(project => project.status === 'completed').length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statsCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: `${approvedUsers} approved, ${pendingUsers} pending`,
      icon: Users,
      gradient: 'from-blue-600 to-blue-500',
      bgGradient: 'from-blue-600/20 to-blue-500/20',
      borderColor: 'border-blue-500/30',
      loading: loadingUsers
    },
    {
      title: 'Teams',
      value: totalTeams,
      subtitle: `${teamsWithMembers} with members`,
      icon: UsersRound,
      gradient: 'from-green-600 to-green-500',
      bgGradient: 'from-green-600/20 to-green-500/20',
      borderColor: 'border-green-500/30',
      loading: loadingTeams
    },
    {
      title: 'Projects',
      value: totalProjects,
      subtitle: `${activeProjects} active, ${completedProjects} completed`,
      icon: FolderOpen,
      gradient: 'from-purple-600 to-purple-500',
      bgGradient: 'from-purple-600/20 to-purple-500/20',
      borderColor: 'border-purple-500/30',
      loading: loadingProjects
    }
  ];

  const quickMetrics = [
    {
      label: 'Completion Rate',
      value: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Overdue Tasks',
      value: overdueTasks,
      icon: AlertCircle,
      color: overdueTasks > 0 ? 'text-red-400' : 'text-green-400'
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      label: 'Team Utilization',
      value: totalTeams > 0 ? `${Math.round((teamsWithMembers / totalTeams) * 100)}%` : '0%',
      icon: CheckCircle,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with your team.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Last updated</div>
          <div className="text-white font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 group`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    {card.loading ? (
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                      <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                        {card.value}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-300">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <div>
                  <div className="text-sm text-slate-400">{metric.label}</div>
                  <div className="text-lg font-semibold text-white">{metric.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {/* Activity items would go here - for now showing placeholder */}
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="flex-1">
              <div className="text-sm text-white">System initialized successfully</div>
              <div className="text-xs text-slate-400">Dashboard is ready for use</div>
            </div>
            <div className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}