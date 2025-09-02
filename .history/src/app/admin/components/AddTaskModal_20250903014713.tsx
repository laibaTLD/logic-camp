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

          {/* Title */}
          <div>
            <label className="block text-base font-medium text-gray-200 mb-3">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              placeholder="Enter a descriptive task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base"
              placeholder="Provide additional details about this task..."
              rows={4}
            />
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer text-base"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assignee
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) => handleInputChange("assignedToId", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">👤 Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    👨‍💼 {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Estimated Hours Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📅 Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ⏱️ Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="999"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="e.g., 2.5"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}