"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, PlusCircle, X } from "lucide-react";

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark blurred background */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-3xl mx-4 rounded-2xl bg-[#0d0d14]/95 border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#1a1a25] to-[#101018]">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {project.name || "Project Details"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-6 py-6 space-y-8 overflow-y-auto">
              {/* Description */}
              <p className="text-gray-300 text-base leading-relaxed">
                {project.description || "No description provided."}
              </p>

              {/* Members */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  👥 Members
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="Enter member email"
                    className="flex-1 rounded-xl bg-[#1c1c24] text-white px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddMember}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-md"
                  >
                    <PlusCircle className="w-5 h-5" /> Add
                  </button>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {members.map((m, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 text-sm"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  ✅ Tasks
                </h3>
                {tasks.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {tasks.map((task, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-[#1c1c24] border border-white/10 text-gray-300 shadow-sm"
                      >
                        {task.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mb-4">No tasks yet.</p>
                )}

                {/* Add new task */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New task"
                    className="flex-1 rounded-xl bg-[#1c1c24] text-white px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddTask}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-2 shadow-md"
                  >
                    <PlusCircle className="w-5 h-5" /> Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between px-6 py-4 border-t border-white/10 bg-gradient-to-r from-[#101018] to-[#1a1a25]">
              <button
                onClick={handleDeleteProject}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-2 shadow-lg"
              >
                <Trash2 className="w-5 h-5" /> Delete
              </button>
              <button
                onClick={handleEditProject}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg"
              >
                <Edit3 className="w-5 h-5" /> Edit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
