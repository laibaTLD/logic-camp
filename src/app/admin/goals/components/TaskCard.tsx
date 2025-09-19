"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Trash2,
  Edit,
  FolderKanban,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import StatusDropdown from "@/components/StatusDropdown";
import { StatusItem } from "@/types";

interface Task {
  id: number;
  title: string;
  description?: string;
  status_title?: string;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  owner?: {
    name: string;
    avatar?: string;
  };
}

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdateStatus: (taskId: number, status: string) => void;
  onDeleteTask: (taskId: number) => void;
  className?: string;
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
  review: {
    bg: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    icon: AlertCircle
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


const TaskCard: React.FC<TaskCardProps> = ({ task, index, onUpdateStatus, onDeleteTask, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { key: statusKey, label: statusLabel } = normalizeStatus(task.status_title || task.status);
  const statusTheme = STATUS_CONFIG[statusKey] || STATUS_CONFIG.default;
  const progress = task.progress || 0;
  const remainingDays = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const handleStatusUpdate = (status: string) => {
    onUpdateStatus(task.id, status);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
  };

  return (
    <div 
      className={`relative group bg-white/5 backdrop-blur-xl border border-white/10 
        rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10
        hover:border-indigo-500/30 overflow-hidden hover:-translate-y-1 
        cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
      style={{
        animation: 'fadeIn 0.5s ease-out',
        animationFillMode: 'both',
        animationDelay: `${index * 30}ms`
      }}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 
        transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Status Badge */
      }
      <div className="absolute top-4 right-4 z-20">
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md
            bg-gradient-to-r ${statusTheme.bg} border ${statusTheme.border}
            shadow-lg transition-all duration-300 ${isHovered ? 'scale-105' : 'scale-100'}
            ${isHovered ? statusTheme.glow : ''}`}
        >
          {getStatusIcon(statusKey)}
          <span className={`capitalize font-medium text-xs ${statusTheme.text} hidden sm:inline-block`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Edit Task button - fixed position to avoid overlapping dropdown */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const customEvent = new CustomEvent('edit-task-request', { detail: { taskId: task.id, task } });
          window.dispatchEvent(customEvent);
        }}
        className="absolute top-14 right-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition-colors"
      >
        Edit Task
      </button>
      
      {/* Task Content */}
      <div className="relative z-10">
        {/* Task Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 
            grid place-items-center shadow-lg transition-all duration-500 relative overflow-hidden
            ${isHovered ? 'shadow-indigo-500/40 rotate-3 scale-105' : 'shadow-indigo-500/20'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FolderKanban className="h-6 w-6 text-white relative z-10" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden pr-24">
            <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-all duration-300
              ${isHovered ? 'text-white' : 'text-gray-100'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-2 text-sm line-clamp-2 transition-colors duration-300 break-words
                ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Task Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <StatusDropdown
              statuses={[
                { id: 1, title: 'todo', description: 'Task is pending', color: '#6B7280', isDeletable: true },
                { id: 2, title: 'inProgress', description: 'Task is in progress', color: '#3B82F6', isDeletable: true },
                { id: 3, title: 'testing', description: 'Task is being tested', color: '#F59E0B', isDeletable: false },
                { id: 4, title: 'review', description: 'Task is in review', color: '#8B5CF6', isDeletable: true },
                { id: 5, title: 'completed', description: 'Task is completed', color: '#10B981', isDeletable: false }
              ]}
              selectedStatus={task.status_title || task.status || 'todo'}
              onStatusSelect={handleStatusUpdate}
              onStatusesChange={() => {}}
              entityType="task"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {task.deadline && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200
                ${remainingDays && remainingDays < 0 
                  ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
                  : remainingDays === 0
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                }`}>
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDeadlineText(task.deadline)}</span>
              </div>
            )}
            
            <button 
              onClick={handleDelete}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 
                transition-all duration-200 hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
