"use client";

import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: number;
    name: string;
    description: string;
    members: { id: number; name: string }[];
    tasks: { id: number; title: string; done: boolean }[];
  } | null;
  onDelete: (id: number) => void;
  onAddTask: (projectId: number, taskTitle: string) => void;
  onAddMember: (projectId: number, memberId: number) => void;
  availableUsers: { id: number; name: string }[];
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  onDelete,
  onAddTask,
  onAddMember,
  availableUsers,
}: ProjectDetailsModalProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  if (!isOpen || !project) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onAddTask(project.id, taskTitle.trim());
      setTaskTitle("");
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      onAddMember(project.id, selectedMember);
      setSelectedMember(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(project.id)}
          className="absolute top-4 left-4 text-red-400 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-2">
          {project.name}
        </h2>
        <p className="text-gray-300 mb-4">{project.description}</p>

        {/* Members */}
        <div className="mb-4">
          <h3 className="text-white font-medium mb-2">Team Members</h3>
          <ul className="flex flex-wrap gap-2">
            {project.members.map((m) => (
              <li
                key={m.id}
                className="px-3 py-1 rounded-full bg-white/10 text-white text-sm"
              >
                {m.name}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddMember} className="mt-2 flex gap-2">
            <select
              value={selectedMember ?? ""}
              onChange={(e) => setSelectedMember(Number(e.target.value))}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select member</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3 rounded-xl bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        </div>

        {/* Tasks */}
        <div>
          <h3 className="text-white font-medium mb-2">Tasks</h3>
          <ul className="space-y-1 mb-3">
            {project.tasks.map((t) => (
              <li
                key={t.id}
                className="px-3 py-2 rounded-lg bg-white/5 text-white flex justify-between"
              >
                <span>{t.title}</span>
                <span className="text-xs text-gray-400">
                  {t.done ? "✔ Done" : "⏳ Pending"}
                </span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="New task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              className="px-3 rounded-xl bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
