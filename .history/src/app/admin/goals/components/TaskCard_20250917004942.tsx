"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Trash2
} from "lucide-react";
import StatusDropdown from "@/components/StatusDropdown";

interface Task {
  id: number;
  title: string;
  description?: string;
  status_title?: string;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdateStatus: (taskId: number, status: string) => void;
  onDeleteTask: (taskId: number) => void;
}

// Constants
const STATUS_CONFIG = {
  completed: {
    bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    icon: CheckCircle
  },
  'in-progress': {
    bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    icon: Zap
  },
  testing: {
    bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    icon: AlertCircle
  },
  default: {
    bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/20',
    icon: Clock
  }
} as const;

// Helper functions
const normalizeStatus = (statusTitle?: string): { key: keyof typeof STATUS_CONFIG; label: string } => {
  if (!statusTitle) return { key: 'default', label: 'todo' };
  
  const raw = statusTitle.trim().toLowerCase();
  if (['done', 'completed', 'complete', 'finished'].includes(raw)) return { key: 'completed', label: 'done' };
  if (['doing', 'in-progress', 'in progress', 'progress', 'inprogress'].includes(raw)) return { key: 'in-progress', label: 'doing' };
  if (['review', 'in-review', 'in review'].includes(raw)) return { key: 'review', label: 'review' };
  if (['testing', 'test'].includes(raw)) return { key: 'testing', label: 'testing' };
  if (['todo', 'to-do', 'backlog', 'pending'].includes(raw)) return { key: 'default', label: 'todo' };
  // Fallback
  return { key: (raw as keyof typeof STATUS_CONFIG) in STATUS_CONFIG ? (raw as keyof typeof STATUS_CONFIG) : 'default', label: raw };
};

const getStatusIcon = (status: string) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
  const IconComponent = config.icon;
  return <IconComponent className="h-4 w-4" />;
};

const formatDeadlineText = (deadline?: string): string => {
  if (!deadline) return "No deadline";
  
  const today = new Date();
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return "No deadline";
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (remainingDays > 0) return `${remainingDays}d left`;
  if (remainingDays === 0) return "Due today";
  return `${Math.abs(remainingDays)}d overdue`;
};

// Sub-components
const BackgroundEffects: React.FC<{ isHovered: boolean; statusTheme: any }> = ({ 
  isHovered, 
  statusTheme 
}) => (
  <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${statusTheme.bg}`}></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-indigo-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-3xl opacity-70"></div>
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-violet-500/20 to-transparent rounded-full blur-2xl"></div>
  </div>
);

const StatusBadge: React.FC<{ 
  statusKey: keyof typeof STATUS_CONFIG; 
  statusLabel: string; 
  statusTheme: any; 
  isHovered: boolean; 
}> = ({ statusKey, statusLabel, statusTheme, isHovered }) => {
  if (!statusKey) return null;
  
  return (
    <div className="absolute top-2 right-2 z-20">
      <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl backdrop-blur-lg
        bg-gradient-to-r ${statusTheme.bg} border ${statusTheme.border}
        shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300
        ${isHovered ? `${statusTheme.glow} shadow-2xl` : ''}`}>
        <span className={statusTheme.text}>
          {getStatusIcon(statusKey)}
        </span>
        <span className={`capitalize font-semibold text-xs ${statusTheme.text}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
};

export default function TaskCard({ task, index, onUpdateStatus, onDeleteTask }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { key: statusKey, label: statusLabel } = normalizeStatus(task.status_title || task.status);
  const statusTheme = STATUS_CONFIG[statusKey] || STATUS_CONFIG.default;

  return (
    <div
      className="group animate-fadeInUp transform transition-all duration-700 hover:scale-[1.02] w-full mx-auto"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative text-left w-full rounded-2xl border backdrop-blur-xl p-3 sm:p-4 
        cursor-pointer overflow-hidden transition-all duration-500 ease-out
        ${isHovered 
          ? `border-white/30 bg-gradient-to-br from-slate-800/90 via-slate-900/70 to-black/50 shadow-2xl ${statusTheme.glow}` 
          : 'border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl'
        }`}
      >
        {/* Background Effects */}
        <BackgroundEffects isHovered={isHovered} statusTheme={statusTheme} />
        
        {/* Status Badge */}
        <StatusBadge 
          statusKey={statusKey} 
          statusLabel={statusLabel} 
          statusTheme={statusTheme} 
          isHovered={isHovered} 
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className={`font-bold text-sm sm:text-lg leading-tight line-clamp-2 transition-all duration-300
                ${isHovered 
                  ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent' 
                  : 'text-white'
                }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-xs sm:text-sm line-clamp-2 break-words transition-colors duration-300
                  ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusDropdown
                statuses={[]}
                onStatusesChange={() => {}}
                selectedStatus={task.status_title || task.status || 'todo'}
                onStatusSelect={(status) => onUpdateStatus(task.id, status)}
                entityType="task"
              />
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20 rounded-full"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Task Metadata */}
          {task.deadline && (
            <div className="mt-3 flex items-center justify-end gap-2 text-xs sm:text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDeadlineText(task.deadline)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}