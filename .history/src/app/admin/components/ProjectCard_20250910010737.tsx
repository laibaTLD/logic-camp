"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, FolderKanban, Edit, Trash2, ChevronDown, ChevronUp, Plus, Target, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "../hooks/useAdminData";
import { getUserById } from "@/services/userService";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (project: Project) => void;
  // Removed task-related props since tasks are now managed under goals
}

// ✅ Make sure to type the component correctly
const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenProject }) => {
  const router = useRouter();
  const [owner, setOwner] = useState<{name: string} | null>(null);
  
  // Calculate remaining days until deadline
  const getRemainingDays = () => {
    if (!project.endDate) return null;
    
    const today = new Date();
    const deadline = new Date(project.endDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Fetch owner information if available
  useEffect(() => {
    if (project.ownerId) {
      getUserById(project.ownerId)
        .then(user => setOwner(user))
        .catch(err => console.error("Failed to fetch owner:", err));
    }
  }, [project.ownerId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'review': return 'text-purple-400';
      case 'todo': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div 
        onClick={() => router.push(`/admin/projects/${project.id}`)} 
        className="group text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
        hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
        hover:border-indigo-400/30 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-800/60
        transition-all duration-300 ease-out overflow-hidden cursor-pointer relative
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/5 before:to-purple-500/5 before:opacity-0 
        before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 text-white group-hover:text-indigo-300 transition-colors duration-300 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300">
                {project.name}
              </span>
            </h3>
            <p className="mt-2 text-sm text-gray-400/90 line-clamp-2 group-hover:text-gray-300/90 transition-colors duration-300">
              {project.description}
            </p>
          </div>
          <div className="shrink-0 h-12 w-12 rounded-xl 
            bg-gradient-to-br from-indigo-500 to-purple-600 
            grid place-items-center shadow-lg flex-none
            group-hover:shadow-indigo-500/30 transition-all duration-300">
            <FolderKanban className="h-6 w-6 text-white" />
          </div>
        
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          {project.endDate && (
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 shrink-0 text-yellow-400" />
              <span className="truncate font-medium text-yellow-300/90">
                {getRemainingDays() !== null ? (
                  getRemainingDays() > 0 ? 
                    `${getRemainingDays()} days remaining` : 
                    getRemainingDays() === 0 ? 
                      "Due today" : 
                      `${Math.abs(getRemainingDays())} days overdue`
                ) : "No deadline set"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 shrink-0 text-purple-400" />
            <span className="truncate">{project.members?.length ?? 0} members</span>
          </div>
        </div>
        
        {/* Status Badge - Positioned in right corner */}
        <div className="absolute top-6 right-6">
          {project.status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg
              ${project.status === 'completed' ? 'bg-green-500/20 border border-green-500/50' : 
                project.status === 'in-progress' ? 'bg-blue-500/20 border border-blue-500/50' : 
                project.status === 'review' ? 'bg-purple-500/20 border border-purple-500/50' : 
                'bg-gray-500/20 border border-gray-500/50'}`}>
              <CheckCircle className={`h-3.5 w-3.5 ${getStatusColor(project.status)}`} />
              <span className={`capitalize font-medium ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
          )}
        </div>
        
        {/* Owner */}
        <div className="mt-3 flex items-center text-xs">
          {owner && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Owner:</span>
              <span className="text-indigo-300 font-medium">{owner.name}</span>
            </div>
          )}
        </div>
        
        {/* Updated Date */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-gray-400">
            Updated: {new Date(project.updatedAt).toLocaleDateString("en-GB")}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject(project);
            }}
            className="px-4 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>

        {/* Tasks are now managed under Goals */}
      </div>
    </div>
  );
};

export default ProjectCard;
