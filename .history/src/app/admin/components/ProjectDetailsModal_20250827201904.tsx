"use client";

import { X, Edit3, Trash2, Plus } from "lucide-react";

interface ProjectDetailsModalProps {
  project: any;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;   // ✅ delete handler
  onEdit?: (project: any) => void;   // ✅ edit handler
  onAddTask?: (projectId: string) => void; // ✅ add task handler
}

export default function ProjectDetailsModal({
  project,
  open,
  onClose,
  onDelete,
  onEdit,
  onAddTask,
}: ProjectDetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
      <div className="relative w-full max-w-2xl bg-[#1c1c24] text-white rounded-2xl shadow-2xl p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Project title */}
        <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
        <p className="text-gray-300 mb-6">{project.description}</p>

        {/* Buttons row */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onEdit?.(project)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>

          <button
            onClick={() => onDelete?.(project.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>

          <button
            onClick={() => onAddTask?.(project.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
