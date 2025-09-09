"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, FolderKanban, Edit, Trash2, ChevronDown, ChevronUp, Plus, Target, Clock, CheckCircle, AlertCircle, CircleEllipsis, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "../hooks/useAdminData";
import { getUserById } from "@/services/userService";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenProject }) => {
  const router = useRouter();
  const [owner, setOwner] = useState<{name: string} | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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
      case 'urgent': return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', glow: 'shadow-red-500/20' };
      case 'high': return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', glow: 'shadow-orange-500/20' };
      case 'medium': return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' };
      case 'low': return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40', glow: 'shadow-green-500/20' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40', glow: 'shadow-gray-500/20' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Zap className="h-4 w-4" />;
      case 'review': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'completed': 
        return {
          bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/20'
        };
      case 'in-progress': 
        return {
          bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        };
      case 'review': 
        return {
          bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        };
      default: 
        return {
          bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const remainingDays = getRemainingDays();
  const statusTheme = getStatusTheme(project.status);

  return (
    <div
      className="group animate-fadeInUp transform transition-all duration-700 hover:scale-[1.02]"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={() => router.push(`/admin/projects/${project.id}`)} 
        className={`relative text-left w-full rounded-3xl border backdrop-blur-xl p-8 
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
          {project.status && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-lg
              bg-gradient-to-r ${statusTheme.bg} border ${statusTheme.border}
              shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
              ${isHovered ? `${statusTheme.glow} shadow-2xl` : ''}`}>
              <span className={`${statusTheme.text}`}>
                {getStatusIcon(project.status)}
              </span>
              <span className={`capitalize font-semibold text-sm ${statusTheme.text}`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Project Icon */}
            <div className={`shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 
              grid place-items-center shadow-xl transition-all duration-500 relative overflow-hidden
              ${isHovered ? 'shadow-indigo-500/40 rotate-12 scale-110' : 'shadow-indigo-500/20'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FolderKanban className="h-7 w-7 text-white relative z-10" />
            </div>

            {/* Title and Description */}
            <div className="min-w-0 flex-1">
              <h3 className={`font-bold text-2xl leading-tight line-clamp-2 transition-all duration-300
                ${isHovered 
                  ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent' 
                  : 'text-white'
                }`}>
                {project.name}
              </h3>
              <p className={`mt-3 text-base line-clamp-3 transition-colors duration-300
                ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                {project.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Members Count */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
              ${isHovered 
                ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20' 
                : 'bg-purple-500/10 border-purple-500/20'
              }`}>
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Users className={`h-5 w-5 transition-colors duration-300 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Team</p>
                <p className={`font-bold text-lg transition-colors duration-300 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`}>
                  {project.members?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Owner */}
            {owner && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
                ${isHovered 
                  ? 'bg-indigo-500/20 border-indigo-400/40 shadow-lg shadow-indigo-500/20' 
                  : 'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Star className={`h-5 w-5 transition-colors duration-300 ${isHovered ? 'text-indigo-300' : 'text-indigo-400'}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Owner</p>
                  <p className={`font-bold text-sm transition-colors duration-300 ${isHovered ? 'text-indigo-300' : 'text-indigo-400'}`}>
                    {owner.name}
                  </p>
                </div>
              </div>
            )}

            {/* Deadline */}
            {project.endDate && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
                ${remainingDays !== null && remainingDays < 0 
                  ? isHovered ? 'bg-red-500/20 border-red-400/40 shadow-lg shadow-red-500/20' : 'bg-red-500/10 border-red-500/20'
                  : isHovered ? 'bg-amber-500/20 border-amber-400/40 shadow-lg shadow-amber-500/20' : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                <div className={`p-2 rounded-xl ${remainingDays !== null && remainingDays < 0 ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                  <Clock className={`h-5 w-5 transition-colors duration-300 
                    ${remainingDays !== null && remainingDays < 0 
                      ? isHovered ? 'text-red-300' : 'text-red-400'
                      : isHovered ? 'text-amber-300' : 'text-amber-400'
                    }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Deadline</p>
                  <div className="flex flex-col">
                    <p className={`font-bold text-sm transition-colors duration-300
                      ${remainingDays !== null && remainingDays < 0 
                        ? isHovered ? 'text-red-300' : 'text-red-400'
                        : isHovered ? 'text-amber-300' : 'text-amber-400'
                      }`}>
                      {remainingDays !== null ? (
                        remainingDays > 0 ? 
                          `${remainingDays}d left` : 
                          remainingDays === 0 ? 
                            "Due today" : 
                            `${Math.abs(remainingDays)}d overdue`
                      ) : "No deadline"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Project Creator */}
            {owner && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300
                ${isHovered 
                  ? 'bg-indigo-500/20 border-indigo-400/40 shadow-lg shadow-indigo-500/20' 
                  : 'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                    <Star className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Created by</p>
                  <p className={`font-semibold text-sm transition-colors duration-300 ${isHovered ? 'text-indigo-300' : 'text-indigo-400'}`}>
                    {owner.name}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenProject(project);
              }}
              className={`px-6 py-3 rounded-2xl border font-semibold text-sm transition-all duration-300
                flex items-center gap-2 hover:scale-105 hover:-translate-y-1 relative z-20
                ${isHovered 
                  ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
                }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove</span>
            </button>
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
};

export default ProjectCard;