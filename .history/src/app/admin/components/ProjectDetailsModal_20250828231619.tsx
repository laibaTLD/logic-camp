"use client";

import { useState } from "react";
import AddTaskModal from "./AddTaskModal";

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
  onAddTask?: (project: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'text-blue-400 bg-blue-400/10';
    case 'active': return 'text-green-400 bg-green-400/10';
    case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
    case 'completed': return 'text-emerald-400 bg-emerald-400/10';
    case 'cancelled': return 'text-red-400 bg-red-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'text-red-400 bg-red-400/10';
    case 'high': return 'text-orange-400 bg-orange-400/10';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10';
    case 'low': return 'text-green-400 bg-green-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddTask,
}: ProjectDetailsModalProps) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleTaskAdded = () => {
    // Optionally refresh project data or show success message
    if (onAddTask) {
      onAddTask(project);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-[#0b0b10] border border-white/10 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white">{project.name}</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="Close"
          >
            {/* Close (X) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-6 text-gray-300">
          <p>{project.description}</p>

          {/* Action Icons */}
          <div className="flex gap-4">
            {/* Edit */}
            <button
              onClick={() => onEdit?.(project)}
              className="p-2 rounded-full bg-white/5 hover:bg-blue-600/30 border border-white/10 transition"
              title="Edit Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete?.(project)}
              className="p-2 rounded-full bg-white/5 hover:bg-red-600/30 border border-white/10 transition"
              title="Delete Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>

            {/* Add Task */}
            <button
              onClick={handleAddTask}
              className="p-2 rounded-full bg-white/5 hover:bg-green-600/30 border border-white/10 transition"
              title="Add Task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        project={project}
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
