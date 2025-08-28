"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { truncateText, formatDate } from "../../utils/helpers";

interface ProjectCardProps {
  id: string; // 👈 project id is required for navigation
  title: string;
  description: string;
  dueDate: string;
  membersCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  dueDate,
  membersCount,
}) => {
  const router = useRouter();

  const handleViewTasks = () => {
    // Navigate to project tasks page
    router.push(`/admin/projects/${id}/tasks`);
  };

  return (
    <div className="group cursor-pointer text-left w-full rounded-2xl border border-white/10 
      bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
      hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
      transition-all duration-300 ease-out overflow-hidden animate-fadeInUp">
      
      {/* Project Title */}
      <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-white group-hover:text-indigo-300 transition">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-1 text-sm text-gray-400/90 line-clamp-2">
        {truncateText(description, 100)}
      </p>

      {/* Footer: Due Date & Members */}
      <div className="mt-5 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-indigo-400">📅</span>
          <span className="truncate">{formatDate(dueDate)}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-purple-400">👥</span>
          <span className="truncate">{membersCount} members</span>
        </div>
      </div>

      {/* View/Add Tasks Button */}
      <button
        type="button"
        onClick={handleViewTasks}
        className="mt-4 w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl 
          hover:bg-white/10 hover:border-indigo-400/50 hover:text-indigo-300 
          transition-all duration-200 hover:scale-[1.02] text-sm font-medium"
      >
        View / Add Tasks
      </button>
    </div>
  );
};

export default ProjectCard;
