"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, FolderKanban, Edit, Trash2, ChevronDown, ChevronUp, Plus, Target, Clock, CheckCircle, AlertCircle, CircleEllipsis } from "lucide-react";
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
      className="animate-fadeInUp transform transition-transform duration-500 hover:translate-y-0 hover:translate-x-0"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div 
        onClick={() => onOpenProject(project)} 
        className="group text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
        hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
        hover:border-indigo-400/30 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-800/60
        transition-all duration-300 ease-out overflow-hidden cursor-pointer relative
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/5 before:to-purple-500/5 before:opacity-0 
        before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        {/* Title */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 text-white group-hover:text-indigo-300 transition-colors duration-300 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-blue-300 relative">
                {project.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300 opacity-70"></span>
              </span>
            </h3>
            <p className="mt-2 text-sm text-gray-400/90 line-clamp-2 group-hover:text-gray-300/90 transition-colors duration-300">
              {project.description}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-3">
          {project.endDate && (
            <div className="flex items-center gap-2 min-w-0 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20 group-hover:border-yellow-500/30 transition-all duration-300">
              <Clock className="h-4 w-4 shrink-0 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
              <span className="truncate font-medium text-yellow-300/90 group-hover:text-yellow-200 transition-colors duration-300">
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
          <div className="flex items-center gap-2 min-w-0 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
            <Users className="h-4 w-4 shrink-0 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
            <span className="truncate font-medium group-hover:text-purple-200 transition-colors duration-300">{project.members?.length ?? 0} members</span>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl 
            bg-gradient-to-br from-indigo-500 to-purple-600 
            grid place-items-center shadow-lg flex-none
            group-hover:shadow-indigo-500/30 transition-all duration-300
            relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FolderKanban className="h-5 w-5 text-white relative z-10" />
          </div>
        </div>
        
        {/* Status Badge - Positioned in left corner */}
        <div className="absolute top-4 left-4 z-10">
          {project.status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md
              ${project.status === 'completed' ? 'bg-green-500/20 border border-green-500/30 ring-1 ring-green-500/20' : 
                project.status === 'in-progress' ? 'bg-blue-500/20 border border-blue-500/30 ring-1 ring-blue-500/20' : 
                project.status === 'review' ? 'bg-purple-500/20 border border-purple-500/30 ring-1 ring-purple-500/20' : 
                'bg-gray-500/20 border border-gray-500/30 ring-1 ring-gray-500/20'}
              hover:shadow-xl hover:scale-105 transition-all duration-300 group-hover:shadow-md
              ${project.status === 'completed' ? 'group-hover:shadow-green-500/40 group-hover:border-green-400/50 group-hover:ring-green-400/30' : 
                project.status === 'in-progress' ? 'group-hover:shadow-blue-500/40 group-hover:border-blue-400/50 group-hover:ring-blue-400/30' : 
                project.status === 'review' ? 'group-hover:shadow-purple-500/40 group-hover:border-purple-400/50 group-hover:ring-purple-400/30' : 
                'group-hover:shadow-gray-500/40 group-hover:border-gray-400/50 group-hover:ring-gray-400/30'}
              transform-gpu`}>
              {project.status === 'completed' ? (
                <CheckCircle className={`h-4 w-4 ${getStatusColor(project.status)} group-hover:animate-pulse transition-all duration-300`} />
              ) : project.status === 'in-progress' ? (
                <CircleEllipsis className={`h-4 w-4 ${getStatusColor(project.status)} group-hover:animate-pulse transition-all duration-300`} />
              ) : project.status === 'review' ? (
                <AlertCircle className={`h-4 w-4 ${getStatusColor(project.status)} group-hover:animate-pulse transition-all duration-300`} />
              ) : (
                <Clock className={`h-4 w-4 ${getStatusColor(project.status)} group-hover:animate-pulse transition-all duration-300`} />
              )}
              <span className={`capitalize font-medium text-sm ${getStatusColor(project.status)} group-hover:text-opacity-100 transition-all duration-300`}>
                {project.status}
              </span>
            </div>
          )}
        </div>
        
        {/* Owner and Updated Date */}
        <div className="mt-4 flex items-center justify-between text-xs">
          {/* Owner */}
          {owner && (
            <div className="flex items-center gap-2 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
              <Users className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
              <div>
                <span className="text-gray-400">Owner:</span>
                <span className="text-indigo-300 font-medium ml-1 group-hover:text-indigo-200 transition-colors duration-300">{owner.name}</span>
              </div>
            </div>
          )}
          
          {/* Updated Date */}
          <div className="flex items-center gap-2 bg-slate-500/10 px-2.5 py-1.5 rounded-lg border border-slate-500/20 group-hover:border-slate-500/30 transition-all duration-300">
            <Calendar className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300" />
            <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              {new Date(project.updatedAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject(project);
            }}
            className="px-4 py-2 text-xs bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 
            text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 font-medium flex items-center gap-1.5
            hover:shadow-md hover:shadow-red-500/10 transform hover:-translate-y-0.5"
          >
            <Trash2 className="h-3.5 w-3.5 group-hover:animate-pulse" />
            <span>Delete</span>
          </button>
        </div>

        {/* Tasks are now managed under Goals */}
      </div>
    </div>
  );
};

export default ProjectCard;
