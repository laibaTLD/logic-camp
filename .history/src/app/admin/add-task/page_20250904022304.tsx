"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, User, Calendar, Clock, Flag, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";

export default function AddTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { users } = useAdminData();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "todo" as "todo" | "in-progress" | "review" | "completed",
    assignedToId: "",
    dueDate: "",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      router.push('/admin');
    }
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setError("Task title is required");
      setLoading(false);
      return;
    }

    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: formData.status,
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null,
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        projectId: parseInt(projectId!),
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

      toast.success('Task created successfully!');
      router.push('/admin');
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message || "Failed to create task");
      toast.error(error.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!projectId) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-6 md:px-10 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/30 to-blue-500/30 border border-green-400/30 flex items-center justify-center backdrop-blur-sm">
                <Plus className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Add New Task</h1>
                <p className="text-sm text-gray-300 mt-1">Create a new task for this project</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-8">
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

            {/* Title Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <Flag className="w-3 h-3 text-blue-300" />
                </div>
                Task Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                  placeholder="Enter task title..."
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/30 to-teal-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Description
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 resize-none"
                  placeholder="Enter task description..."
                  rows={4}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-teal-500/5 pointer-events-none"></div>
              </div>
            </div>

            {/* Priority, Status, and Assignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Priority Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
                    <Flag className="w-3 h-3 text-red-300" />
                  </div>
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 appearance-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-orange-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Status Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-purple-300" />
                  </div>
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 appearance-none cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Assignee Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/30 to-blue-500/30 flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-300" />
                  </div>
                  Assignee
                </label>
                <div className="relative">
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => handleInputChange('assignedToId', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm relative z-10 appearance-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id.toString()}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Due Date and Estimated Hours Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Due Date Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-cyan-300" />
                  </div>
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Estimated Hours Field */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-200">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-yellow-300" />
                  </div>
                  Estimated Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/50 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm relative z-10"
                    placeholder="e.g., 2.5 hours"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 mt-8 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                disabled={loading}
                className="px-6 py-3 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm relative overflow-hidden group"
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
          </div>
        </form>
      </main>
    </div>
  );
}