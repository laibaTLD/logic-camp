"use client";

import { X, Pencil, Trash2, Plus } from "lucide-react";

interface ProjectDetailsModalProps {
  project: any;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#1b1b23] w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-white/10 text-white z-50 animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
        >
          <X size={20} />
        </button>

        {/* Project Title & Description */}
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        <p className="text-gray-400 mb-4">{project.description}</p>

        {/* Members Section */}
        <div className="mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-2">👥 Members</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter member email"
              className="flex-1 rounded-lg bg-[#111] px-3 py-2 text-sm border border-white/10 focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm hover:opacity-90">
              Add
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <h3 className="font-semibold flex items-center gap-2 mb-2">✅ Tasks</h3>
          {project.tasks && project.tasks.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-300">
              {project.tasks.map((task: string, idx: number) => (
                <li key={idx}>{task}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks yet.</p>
          )}

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="New task"
              className="flex-1 rounded-lg bg-[#111] px-3 py-2 text-sm border border-white/10 focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm hover:opacity-90 flex items-center gap-1">
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            <Pencil size={16} /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
