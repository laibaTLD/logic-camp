"use client";

import React from "react";

interface ProjectDetailsModalProps {
  project: any; // Replace `any` with your Project type later
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1d] text-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Project Title */}
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        <p className="text-gray-400 mb-4">{project.description}</p>

        {/* Example content */}
        <div className="space-y-3">
          <p>
            <span className="font-semibold">Progress:</span>{" "}
            {project.progress ?? 0}%
          </p>
          <p>
            <span className="font-semibold">Team Members:</span>{" "}
            {project.members?.join(", ") ?? "No members yet"}
          </p>
          <p>
            <span className="font-semibold">Tasks:</span>{" "}
            {project.tasks?.length ?? 0}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">
            Delete Project
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">
            Edit / Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
