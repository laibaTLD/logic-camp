"use client";

import { useState } from "react";

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailsModalProps) {
  const [members, setMembers] = useState<string[]>(project.members || []);
  const [newMember, setNewMember] = useState("");

  if (!isOpen) return null;

  // Add member handler
  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#12121a]/95 border border-white/10 shadow-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {project.name || "Project Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6">{project.description}</p>

        {/* Members Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Members</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="Enter member email"
              className="flex-1 rounded-lg bg-[#1c1c24] text-white px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddMember}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Add
            </button>
          </div>
          <ul className="space-y-1">
            {members.map((m, idx) => (
              <li
                key={idx}
                className="px-3 py-1 rounded-md bg-white/5 text-gray-300"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Tasks</h3>
          {project.tasks && project.tasks.length > 0 ? (
            <ul className="space-y-2">
              {project.tasks.map((task: any, idx: number) => (
                <li
                  key={idx}
                  className="px-3 py-2 rounded-md bg-[#1c1c24] border border-white/10 text-gray-300"
                >
                  {task.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
