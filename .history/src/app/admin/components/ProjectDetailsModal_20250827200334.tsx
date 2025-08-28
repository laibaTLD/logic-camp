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
  const [tasks, setTasks] = useState<any[]>(project.tasks || []);
  const [newTask, setNewTask] = useState("");

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { title: newTask }]);
      setNewTask("");
    }
  };

  const handleDeleteProject = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      console.log("Deleting project:", project.id);
      onClose();
    }
  };

  const handleEditProject = () => {
    console.log("Editing project:", project.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 sticky top-0 bg-[#12121a] z-10">
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

        {/* Body (scrollable) */}
        <div className="px-6 py-4 overflow-y-auto">
          {/* Description */}
          <p className="text-gray-300 mb-6">{project.description}</p>

          {/* Members */}
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

          {/* Tasks */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Tasks</h3>
            {tasks.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {tasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-2 rounded-md bg-[#1c1c24] border border-white/10 text-gray-300"
                  >
                    {task.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-3">No tasks yet.</p>
            )}

            {/* Add new task */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New task"
                className="flex-1 rounded-lg bg-[#1c1c24] text-white px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Footer (sticks to bottom) */}
        <div className="flex justify-between px-6 py-4 border-t border-white/10 sticky bottom-0 bg-[#12121a] z-10">
          <button
            onClick={handleDeleteProject}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
          >
            Delete Project
          </button>
          <button
            onClick={handleEditProject}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            Edit Project
          </button>
        </div>
      </div>
    </div>
  );
}
