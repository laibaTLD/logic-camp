"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Target, Calendar, AlertCircle, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";
import { StatusItem } from "@/types";
import StatusDropdown from "@/components/StatusDropdown";

interface GoalsCreatePageProps {
  onBack?: () => void;
}

export default function GoalsCreatePage({ onBack }: GoalsCreatePageProps) {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo", // Default to first goal status
    deadline: "",
    projectId: "",
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Status management state
  const [customStatuses, setCustomStatuses] = useState<StatusItem[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Status management handlers
  const handleStatusesChange = (statuses: StatusItem[]) => {
    setCustomStatuses(statuses);
  };

  const handleStatusSelect = (status: string) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Goal title is required";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          statusTitle: formData.status,
          projectId: parseInt(formData.projectId),
          deadline: formData.deadline || undefined,
          customStatuses: customStatuses.length > 0 ? customStatuses : undefined,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create goal');
      }

      toast.success(`Goal "${formData.title}" created successfully!`);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "todo",
        deadline: "",
        projectId: "",
      });
      setCustomStatuses([]);
      setErrors({});
      
      // Go back to goals section if onBack is provided
      if (onBack) {
        onBack();
      }
    } catch (err: any) {
      console.error("Error creating goal:", err);
      toast.error(`Failed to create goal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-white">Create New Goal</h1>
          <p className="text-slate-400">Set up a new goal with all necessary details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Goal Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Target className="w-5 h-5" />
        </div>
        <div>
                <h2 className="text-lg font-semibold text-white">Goal Information</h2>
                <p className="text-slate-400 text-sm">Give your goal a clear title and initial status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Goal Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Goal Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter goal title"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? "border-red-500/50" : "border-slate-600/50"
                  }`}
                  autoFocus
                />
                {errors.title && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Status */}
              <StatusDropdown
                statuses={customStatuses}
                onStatusesChange={handleStatusesChange}
                selectedStatus={formData.status}
                onStatusSelect={handleStatusSelect}
                entityType="goal"
                disabled={loading}
              />
            </div>

            <p className="text-xs text-slate-400 -mt-2">
              You can add, reorder, or remove statuses. Your first change turns defaults into a custom list.
            </p>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter goal description"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              />
              <div className="text-xs text-slate-500">Optional. Briefly explain what this goal aims to achieve.</div>
            </div>
        </div>

          {/* Project Assignment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <FolderOpen className="w-5 h-5" />
          </div>
          <div>
                <h2 className="text-lg font-semibold text-white">Project Assignment</h2>
                <p className="text-slate-400 text-sm">Select the project this goal belongs to.</p>
              </div>
          </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Assign Project <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange("projectId", e.target.value)}
                disabled={loadingProjects}
                className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.projectId ? "border-red-500/50" : "border-slate-600/50"
                }`}
              >
                <option value="" className="bg-slate-800">
                  {loadingProjects ? "Loading projects..." : "-- Select Project --"}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-slate-800">
                    {project.name}
                  </option>
              ))}
            </select>
              {errors.projectId && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.projectId}
                </div>
              )}
              {!loadingProjects && projects.length === 0 && (
                <p className="text-amber-400 text-sm">No projects available. Create a project first.</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Goal Timeline</h2>
                <p className="text-slate-400 text-sm">Set an optional deadline for this goal.</p>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  errors.deadline ? "border-red-500/50" : "border-slate-600/50"
                }`}
              />
              {errors.deadline && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.deadline}
                </div>
              )}
              <div className="text-xs text-slate-500">Optional. When should this goal be completed?</div>
          </div>
        </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700/50">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Goal...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Goal
                </>
              )}
            </button>
        </div>
      </form>
      </div>
    </div>
  );
}


