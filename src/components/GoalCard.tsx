'use client';

import { useState } from 'react';
import { Edit, Trash2, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed';
  project_id: number;
  deadline?: string;
}

interface GoalCardProps {
  goal: Goal;
  index: number;
  onEditGoal?: (goal: Goal) => void;
  onDeleteGoal?: (goalId: number) => void;
  deletingGoalId?: number | null;
}

export default function GoalCard({ goal, index, onEditGoal, onDeleteGoal, deletingGoalId }: GoalCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine status theme for styling
  const getStatusTheme = () => {
    switch (goal.status) {
      case 'completed':
        return {
          bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/20',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'inProgress':
        return {
          bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20',
          icon: <Clock className="h-4 w-4" />
        };
      case 'testing':
        return {
          bg: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/20',
          icon: <AlertCircle className="h-4 w-4" />
        };
      default: // todo
        return {
          bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-purple-500/20',
          icon: <Clock className="h-4 w-4" />
        };
    }
  };

  const statusTheme = getStatusTheme();
  const formattedStatus = {
    'todo': 'To Do',
    'inProgress': 'In Progress',
    'testing': 'Testing',
    'completed': 'Completed'
  }[goal.status] || goal.status;

  return (
    <div
      className="group animate-fadeInUp transform transition-all duration-700 hover:scale-[1.02]"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative text-left w-full rounded-3xl border backdrop-blur-xl p-6 
        cursor-pointer overflow-hidden transition-all duration-500 ease-out
        ${isHovered 
          ? `border-white/30 bg-gradient-to-br from-slate-800/90 via-slate-900/70 to-black/50 shadow-2xl ${statusTheme.glow}` 
          : 'border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl'
        }`}
      >
        {/* Animated Background Mesh */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${statusTheme.bg}`}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Status Badge */}
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-lg
            bg-gradient-to-r ${statusTheme.bg} border ${statusTheme.border}
            shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
            ${isHovered ? `${statusTheme.glow} shadow-2xl` : ''}`}>
            <span className={`${statusTheme.text}`}>
              {statusTheme.icon}
            </span>
            <span className={`font-semibold text-sm ${statusTheme.text}`}>
              {formattedStatus}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Title */}
          <h3 className={`font-bold text-xl leading-tight mb-3 transition-all duration-300
            ${isHovered 
              ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent' 
              : 'text-white'
            }`}>
            {goal.title}
          </h3>

          {/* Description */}
          {goal.description && (
            <p className={`text-sm mb-4 line-clamp-3 transition-colors duration-300
              ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
              {goal.description}
            </p>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <div className={`flex items-center gap-2 mb-4 transition-colors duration-300
              ${isHovered ? 'text-indigo-300' : 'text-indigo-400'}`}>
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 mt-4">
            {/* Edit Button */}
            <button
              onClick={() => onEditGoal && onEditGoal(goal)}
              className={`flex-1 px-4 py-2 rounded-2xl border font-semibold text-sm transition-all duration-300
                flex items-center justify-center gap-2 hover:scale-105 hover:-translate-y-1
                ${isHovered 
                  ? `${statusTheme.bg.replace('bg-gradient-to-br', 'bg-gradient-to-r')} ${statusTheme.border} ${statusTheme.text} shadow-lg ${statusTheme.glow}` 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40'
                }`}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            {onDeleteGoal && (
              <button
                onClick={() => onDeleteGoal(goal.id)}
                disabled={deletingGoalId === goal.id}
                className={`px-4 py-2 rounded-2xl border font-semibold text-sm transition-all duration-300
                  flex items-center gap-2 hover:scale-105 hover:-translate-y-1 relative z-20
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
                  ${isHovered 
                    ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
                  }`}
                title="Delete goal"
              >
                {deletingGoalId === goal.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{deletingGoalId === goal.id ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle Border Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"></div>
        </div>
      </div>
    </div>
  );
}