"use client";

import { Users, Calendar, FolderKanban } from "lucide-react";
import { Project } from "../hooks/useAdminData";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (id: number) => void;
}

export default function ProjectCard({
  project,
  index,
  onOpenProject,
}: ProjectCardProps) {
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div
        onClick={() => onOpenProject(project.id)}
        className="group cursor-pointer text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-5 
        hover:from-white/10 hover:to-white/5 transition-all duration-300 
        shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl 
          bg-gradient-to-br from-indigo-500 to-purple-600 
          grid place-items-center opacity-90 group-hover:opacity-100 transition">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span className="font-medium text-gray-200">{project.progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-progressBar"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{new Date(project.updatedAt).toLocaleDateString("en-GB")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>{project.members?.length ?? 0} members</span>
          </div>
        </div>
      </div>
    </div>
  );
}
