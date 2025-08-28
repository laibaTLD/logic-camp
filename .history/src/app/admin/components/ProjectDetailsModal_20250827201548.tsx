"use client";

import { motion } from "framer-motion";
import { X, Trash2, Edit3, PlusCircle } from "lucide-react";

interface ProjectDetailsModalProps {
  project: any;
  open: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  project,
  open,
  onClose,
}: ProjectDetailsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-[#111] text-white rounded-2xl shadow-2xl p-8 w-full max-w-lg z-50 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{project?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6">{project?.description}</p>

        {/* Members */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Team Members</h3>
          <ul className="list-disc list-inside text-gray-400">
            {project?.members?.map((m: string, idx: number) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Edit */}
          <button className="flex flex-col items-center text-blue-400 hover:text-blue-300 transition">
            <Edit3 size={26} />
            <span className="text-xs mt-1">Edit</span>
          </button>

          {/* Add Task */}
          <button className="flex flex-col items-center text-green-400 hover:text-green-300 transition">
            <PlusCircle size={26} />
            <span className="text-xs mt-1">Task</span>
          </button>

          {/* Delete */}
          <button className="flex flex-col items-center text-red-400 hover:text-red-300 transition">
            <Trash2 size={26} />
            <span className="text-xs mt-1">Delete</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
