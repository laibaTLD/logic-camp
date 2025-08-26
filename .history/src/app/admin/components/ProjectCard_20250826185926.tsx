"use client";

import { motion } from "framer-motion";
import { Users, Calendar, FolderKanban } from "lucide-react";
import useAdminData, { Project } from "../hooks/useAdminData";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { openProject } = useAdminData();

  return (
    <motion.button
      onClick={() => openProject(project.id)}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.03 * index }}
      className="group text-left w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-xl p-5 hover:from-white/10 hover:to-white/5 transition-all shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center opacity-90 group-hover:opacity-100 transition">
          <FolderKanban className="h-5 w-5" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span className="font-medium text-gray-300">{project.progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{project.members?.length ?? 0} members</span>
        </div>
      </div>
    </motion.button>
  );
}
