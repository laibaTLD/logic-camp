"use client";

import React from "react";
import { Users, Calendar, FolderKanban } from "lucide-react";
import { Project } from "../hooks/useAdminData";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (id: number) => void;
}

// ✅ Make sure to type the component correctly
const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenProject }) => {
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div
        onClick={() => onOpenProject(project.id)}
        className="group cursor-pointer text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
        hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
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
      </div>
    </div>
  );
};

export default ProjectCard;
