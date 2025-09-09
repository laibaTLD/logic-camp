"use client";

import { useState } from "react";
import { X, FolderOpen, Users, Calendar, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: { id: number; name: string }[];
  createProject: (project: {
    name: string;
    description: string;
    status?: 'todo' | 'inProgress' | 'testing' | 'completed' | 'archived';
    startDate?: string;
    endDate?: string;
    teamId?: number | null;
  }) => Promise<any>;
}

export default function NewProjectModal({ isOpen, onClose, teams, createProject }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "todo" as "todo" | "inProgress" | "testing" | "completed" | "archived",
    startDate: "",
    endDate: "",
    teamId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.teamId) {
      newErrors.teamId = "Please select a team";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after or equal to start date";
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
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        teamId: parseInt(formData.teamId),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });

      toast.success(`Project "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        status: "todo",
        startDate: "",
        endDate: "",
        teamId: "",
      });
      setErrors({});
      onClose();
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast.error(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "todo", label: "To Do", color: "text-gray-400" },
    { value: "inProgress", label: "In Progress", color: "text-blue-400" },
    { value: "testing", label: "Testing", color: "text-yellow-400" },
    { value: "completed", label: "Completed", color: "text-green-400" },
    { value: "archived", label: "Archived", color: "text-purple-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative animate-scaleIn text-gray-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <FolderOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Project Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <FolderOpen className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-white">Project Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter project name"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? "border-red-500/50" : "border-slate-600/50"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter project description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Team Assignment */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-white">Team Assignment</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Assign Team <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => handleInputChange("teamId", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.teamId ? "border-red-500/50" : "border-slate-600/50"
                }`}
              >
                <option value="" className="bg-slate-800">
                  -- Select Team --
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-800">
                    {team.name}
                  </option>
                ))}
              </select>
              {errors.teamId && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.teamId}
                </div>
              )}
              {teams.length === 0 && (
                <p className="text-amber-400 text-sm">No teams available. Create a team first.</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.endDate ? "border-red-500/50" : "border-slate-600/50"
                  }`}
                />
                {errors.endDate && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.endDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white font-medium hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}