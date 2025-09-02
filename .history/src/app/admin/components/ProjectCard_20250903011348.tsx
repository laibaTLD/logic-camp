"use client";

import React from "react";
import { Users, Calendar, FolderKanban } from "lucide-react";
import { Project } from "../hooks/useAdminData";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (project: Project) => void;
  onAddTask?: (project: Project) => void;
}

// ✅ Make sure to type the component correctly
const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenProject, onAddTask }) => {
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div className="group text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
        hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
        hover:border-indigo-400/30 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-800/60
        transition-all duration-300 ease-out overflow-hidden"
      >
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-white group-hover:text-indigo-300 transition">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-gray-400/90 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl 
            bg-gradient-to-br from-indigo-500 to-purple-600 
            grid place-items-center shadow-md flex-none">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
        
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
            <span className="truncate">{new Date(project.updatedAt).toLocaleDateString("en-GB")}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 shrink-0 text-purple-400" />
            <span className="truncate">{project.members?.length ?? 0} members</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {onAddTask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTask(project);
              }}
              className="flex-1 px-3 py-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 font-medium"
            >
              Add Task
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject(project);
            }}
            className="flex-1 px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
