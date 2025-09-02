"use client";

import { useState, useEffect } from "react";
import { X, Plus, User, Calendar, Clock, Flag, CheckCircle } from "lucide-react";
import useAdminData from "../hooks/useAdminData";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  projectId: number;
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
}: AddTaskModalProps) {
  const { users } = useAdminData();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "todo" as "todo" | "in_progress" | "completed" | "cancelled",
    assignedToId: "",
    dueDate: "",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        assignedToId: "",
        dueDate: "",
        estimatedHours: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        projectId: projectId,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to create task');
      }

      onTaskCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-fadeIn" onClick={onClose}>
      {/* Modal */}
      <div 
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 backdrop-blur-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative animate-scaleIn text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-white/10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/30 to-blue-500/30 border border-green-400/30 flex items-center justify-center backdrop-blur-sm">
                <Plus className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Task</h2>
                <p className="text-sm text-gray-300 mt-1">Create a new task for this project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
        </div>

        {/* Form */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-gradient-to-r from-red-600/15 to-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-red-200/80">{error}</p>
                </div>
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-semibold text-white">
                <Plus className="w-4 h-4 text-green-400" />
                Task Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30"
                  placeholder="Enter a descriptive task title"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-blue-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-semibold text-white">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 resize-none text-base backdrop-blur-sm hover:border-white/30"
                  placeholder="Provide additional details about this task..."
                  rows={4}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-green-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Priority and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-semibold text-white">
                  <Flag className="w-4 h-4 text-orange-400" />
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="low" className="bg-gray-800 text-white">🟢 Low Priority</option>
                    <option value="medium" className="bg-gray-800 text-white">🟡 Medium Priority</option>
                    <option value="high" className="bg-gray-800 text-white">🟠 High Priority</option>
                    <option value="urgent" className="bg-gray-800 text-white">🔴 Urgent</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none"></div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-semibold text-white">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="todo" className="bg-gray-800 text-white">📋 To Do</option>
                    <option value="in_progress" className="bg-gray-800 text-white">⚡ In Progress</option>
                    <option value="completed" className="bg-gray-800 text-white">✅ Completed</option>
                    <option value="cancelled" className="bg-gray-800 text-white">❌ Cancelled</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-semibold text-white">
                <User className="w-4 h-4 text-cyan-400" />
                Assignee
              </label>
              <div className="relative">
                <select
                  value={formData.assignedToId}
                  onChange={(e) => handleInputChange("assignedToId", e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-800 text-white">👤 Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id.toString()} className="bg-gray-800 text-white">
                      👨‍💼 {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Due Date and Estimated Hours Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Due Date */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-semibold text-white">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-semibold text-white">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Estimated Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="999"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                    className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400/50 transition-all duration-300 text-base backdrop-blur-sm hover:border-white/30"
                    placeholder="e.g., 2.5 hours"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 mt-8 border-t border-gradient-to-r from-white/5 to-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-8 py-4 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm flex items-center justify-center gap-2 group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="relative z-10">Creating Task...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">Create Task</span>
                  </>
                )}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}