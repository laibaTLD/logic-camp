"use client";

import React, { useEffect, useState } from "react";
import { 
  Target, 
  Calendar, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Zap 
} from "lucide-react";
import { useRouter } from "next/navigation";

// Types
interface GoalCardProps {
  goal: any;
  index: number;
  onEditGoal?: (goal: any) => void;
  onDeleteGoal?: (goalId: number) => void;
  deletingGoalId?: number | null;
  onStatusChange?: (goal: any) => Promise<void>;
}

interface Project {
  name: string;
  id: number;
}

interface StatusTheme {
  bg: string;
  border: string;
  text: string;
  glow: string;
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
    bg: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
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
const getRemainingDays = (goal: any): number | null => {
  const deadline = goal.deadline;
  if (!deadline) return null;
  
  const today = new Date();
  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return null;
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusTheme = (status: string): StatusTheme => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
};

// Normalize incoming status values to a consistent config key and label
const normalizeStatus = (statusTitle?: string): { key: keyof typeof STATUS_CONFIG; label: string } => {
  if (!statusTitle) return { key: 'default', label: 'todo' };
  
  const raw = statusTitle.trim().toLowerCase();
  if (['done', 'completed', 'complete', 'finished'].includes(raw)) return { key: 'completed', label: 'done' };
  if (['doing', 'in-progress', 'in progress', 'progress', 'inprogress'].includes(raw)) return { key: 'in-progress', label: 'doing' };
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

const formatDeadlineText = (remainingDays: number | null): string => {
  if (remainingDays === null) return "No deadline";
  if (remainingDays > 0) return `${remainingDays}d left`;
  if (remainingDays === 0) return "Due today";
  return `${Math.abs(remainingDays)}d overdue`;
};

// Sub-components
const BackgroundEffects: React.FC<{ isHovered: boolean; statusTheme: StatusTheme }> = ({ 
  isHovered, 
  statusTheme 
}) => (
  <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${statusTheme.bg}`}></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-3xl"></div>
  </div>
);

const StatusBadge: React.FC<{ 
  statusKey: keyof typeof STATUS_CONFIG; 
  statusLabel: string; 
  statusTheme: StatusTheme; 
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

const GoalHeader: React.FC<{ 
  goal: any; 
  isHovered: boolean; 
}> = ({ goal, isHovered }) => (
  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
    {/* Goal Icon */}
    <div className={`shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-pink-600 to-red-500 
      grid place-items-center shadow-xl transition-all duration-500 relative overflow-hidden
      ${isHovered ? 'shadow-purple-500/40 rotate-12 scale-110' : 'shadow-purple-500/20'}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white relative z-10" />
    </div>

    {/* Title and Description */}
    <div className="min-w-0 flex-1 overflow-hidden">
      <h3 className={`font-bold text-sm sm:text-lg leading-tight line-clamp-2 transition-all duration-300 truncate
        ${isHovered 
          ? 'bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent' 
          : 'text-white'
        }`}>
        {goal.title}
      </h3>
      <p className={`mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2 transition-colors duration-300 break-words
        ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
        {goal.description || 'No description provided.'}
      </p>
    </div>
  </div>
);

const StatsGrid: React.FC<{ 
  goal: any; 
  project: Project | null; 
  remainingDays: number | null; 
  isHovered: boolean; 
}> = ({ goal, project, remainingDays, isHovered }) => (
  <div className="mb-3 sm:mb-4">
    {/* Project and Deadline Row */}
    <div className="grid grid-cols-2 gap-2">
      {/* Project */}
      <StatItem
        icon={Star}
        label="Project"
        value={project?.name || 'No Project'}
        color="purple"
        isHovered={isHovered}
      />

      {/* Deadline */}
      {goal.deadline ? (
        <StatItem
          icon={Clock}
          label="Deadline"
          value={formatDeadlineText(remainingDays)}
          subValue={new Date(goal.deadline).toLocaleDateString()}
          color={remainingDays !== null && remainingDays < 0 ? "red" : "amber"}
          isHovered={isHovered}
        />
      ) : (
        <div className="h-full"></div>
      )}
    </div>
  </div>
);

const StatItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'purple' | 'indigo' | 'red' | 'amber';
  isHovered: boolean;
  truncate?: boolean;
  fullWidth?: boolean;
}> = ({ icon: Icon, label, value, subValue, color, isHovered, truncate = false, fullWidth = false }) => {
  const colorClasses = {
    purple: {
      bg: isHovered ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20' : 'bg-purple-500/10 border-purple-500/20',
      icon: isHovered ? 'text-purple-300' : 'text-purple-400',
      text: isHovered ? 'text-purple-300' : 'text-purple-400',
      iconBg: 'bg-purple-500/20'
    },
    indigo: {
      bg: isHovered ? 'bg-indigo-500/20 border-indigo-400/40 shadow-lg shadow-indigo-500/20' : 'bg-indigo-500/10 border-indigo-500/20',
      icon: isHovered ? 'text-indigo-300' : 'text-indigo-400',
      text: isHovered ? 'text-indigo-300' : 'text-indigo-400',
      iconBg: 'bg-indigo-500/20'
    },
    red: {
      bg: isHovered ? 'bg-red-500/20 border-red-400/40 shadow-lg shadow-red-500/20' : 'bg-red-500/10 border-red-500/20',
      icon: isHovered ? 'text-red-300' : 'text-red-400',
      text: isHovered ? 'text-red-300' : 'text-red-400',
      iconBg: 'bg-red-500/20'
    },
    amber: {
      bg: isHovered ? 'bg-amber-500/20 border-amber-400/40 shadow-lg shadow-amber-500/20' : 'bg-amber-500/10 border-amber-500/20',
      icon: isHovered ? 'text-amber-300' : 'text-amber-400',
      text: isHovered ? 'text-amber-300' : 'text-amber-400',
      iconBg: 'bg-amber-500/20'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${fullWidth ? 'w-full' : 'h-full'} flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all duration-300 ${classes.bg}`}>
      <div className={`p-0.5 sm:p-1 ${classes.iconBg} rounded-md sm:rounded-lg`}>
        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300 ${classes.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">{label}</p>
        <p className={`font-bold text-xs sm:text-sm transition-colors duration-300 ${classes.text} ${truncate ? 'truncate' : ''}`}>
          {value} {subValue && <span className="text-xs text-gray-400 hidden sm:inline">{subValue}</span>}
        </p>
      </div>
    </div>
  );
};

const GoalFooter: React.FC<{
  goal: any;
  isHovered: boolean;
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
  onEditGoal?: (goal: any) => void;
  onDeleteGoal?: (goalId: number) => void;
  deletingGoalId?: number | null;
}> = ({ goal, isHovered, onEditClick, onDeleteClick, onEditGoal, onDeleteGoal, deletingGoalId }) => (
  <div className="flex flex-col gap-3">
    {/* Created Date Row */}
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-300 flex-1
        ${isHovered 
          ? 'bg-cyan-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/20' 
          : 'bg-cyan-500/10 border-cyan-500/20'
        }`}>
        <div className="p-0.5 sm:p-1 bg-cyan-500/20 rounded-md sm:rounded-lg">
          <Calendar className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Created</p>
          <p className={`font-semibold text-xs transition-colors duration-300 ${isHovered ? 'text-cyan-300' : 'text-cyan-400'}`}>
            {goal.createdAt ? new Date(goal.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>
    </div>

    {/* Action Buttons Row */}
    <div className="flex gap-1.5 sm:gap-2 justify-between">
      {onEditGoal && (
        <ActionButton
          icon={Edit}
          label="Edit"
          onClick={onEditClick}
          variant="indigo"
          isHovered={isHovered}
        />
      )}
      {onDeleteGoal && (
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={onDeleteClick}
          variant="red"
          isHovered={isHovered}
          isLoading={deletingGoalId === goal.id}
        />
      )}
    </div>
  </div>
);

const ActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant: 'indigo' | 'red';
  isHovered: boolean;
  isLoading?: boolean;
}> = ({ icon: Icon, label, onClick, variant, isHovered, isLoading = false }) => {
  const variantClasses = {
    indigo: {
      bg: isHovered 
        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-lg shadow-indigo-500/20' 
        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40'
    },
    red: {
      bg: isHovered 
        ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20' 
        : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border font-semibold text-xs transition-all duration-300
        flex items-center justify-center gap-1 hover:scale-105 hover:-translate-y-1 relative z-20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        ${variantClasses[variant].bg}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      <span className="hidden sm:inline">{isLoading ? 'Deleting...' : label}</span>
    </button>
  );
};

const BorderGlowEffect: React.FC<{ isHovered: boolean }> = ({ isHovered }) => (
  <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none
    ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
    <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10"></div>
  </div>
);

const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  index, 
  onEditGoal, 
  onDeleteGoal,
  deletingGoalId
}) => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate values
  const remainingDays = getRemainingDays(goal);
  const normalized = normalizeStatus(goal.status_title || goal.status);
  const statusTheme = getStatusTheme(normalized.key);
  
  // Set project from goal relation
  useEffect(() => {
    const relProject = goal.project;
    if (relProject?.name) {
      setProject({ name: relProject.name, id: relProject.id });
    } else {
      setProject(null);
    }
  }, [goal]);

  // Event handlers
  const handleCardClick = () => {
    const projectId = (goal as any)?.project?.id || (project?.id ?? (goal as any)?.project_id);
    if (projectId) {
      router.push(`/admin/projects/${projectId}/goals/${goal.id}`);
    } else {
      // Fallback: navigate to goals by id if project is missing
      router.push(`/admin/goals/${goal.id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditGoal?.(goal);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteGoal?.(goal.id);
  };

  return (
    <div
      className="group animate-fadeInUp transform transition-all duration-700 hover:scale-[1.02] w-full mx-auto"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
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
          statusKey={normalized.key}
          statusLabel={normalized.label}
          statusTheme={statusTheme} 
          isHovered={isHovered} 
        />

        {/* Main Content */}
        <div className="relative z-10">
          <GoalHeader 
            goal={goal} 
            isHovered={isHovered} 
          />
          
          <StatsGrid 
            goal={goal} 
            project={project}
            remainingDays={remainingDays} 
            isHovered={isHovered} 
          />
          
          <GoalFooter 
            goal={goal} 
            isHovered={isHovered} 
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onEditGoal={onEditGoal}
            onDeleteGoal={onDeleteGoal}
            deletingGoalId={deletingGoalId}
          />
        </div>

        {/* Border Glow Effect */}
        <BorderGlowEffect isHovered={isHovered} />
      </div>
    </div>
  );
};

export default GoalCard;
