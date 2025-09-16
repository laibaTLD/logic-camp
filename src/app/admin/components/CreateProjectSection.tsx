"use client";

import { useState } from "react";
import { ArrowLeft, Save, Users, Calendar, FolderOpen, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { StatusItem } from "@/types";
import StatusDropdown from "@/components/StatusDropdown";

interface CreateProjectSectionProps {
  teams: any[];
  loadingTeams: boolean;
  createProject: (project: any) => Promise<any>;
  onBack: () => void;
}

export default function CreateProjectSection({ 
  teams, 
  loadingTeams, 
  createProject, 
  onBack 
}: CreateProjectSectionProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning", // Default to first project status
    startDate: "",
    endDate: "",
    teamId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Status management state
  const [customStatuses, setCustomStatuses] = useState<StatusItem[]>([]);

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
        customStatuses: customStatuses.length > 0 ? customStatuses : undefined,
      });

      toast.success(`Project "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        status: "planning",
        startDate: "",
        endDate: "",
        teamId: "",
      });
      setCustomStatuses([]);
      setErrors({});
      
      // Go back to projects section
      onBack();
    } catch (err: any) {
      console.error("Error creating project:", err);
      toast.error(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Create New Project</h1>
          <p className="text-slate-400">Set up a new project with all necessary details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Project Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Project Information</h2>
                <p className="text-slate-400 text-sm">Give your project a clear name and initial status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  autoFocus
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Status */}
              <StatusDropdown
                statuses={customStatuses}
                onStatusesChange={handleStatusesChange}
                selectedStatus={formData.status}
                onStatusSelect={handleStatusSelect}
                entityType="project"
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
                placeholder="Enter project description"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              />
              <div className="text-xs text-slate-500">Optional. Briefly explain what this project is about.</div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Team Assignment</h2>
                <p className="text-slate-400 text-sm">Select the team that will own this project.</p>
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Assign Team <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => handleInputChange("teamId", e.target.value)}
                disabled={loadingTeams}
                className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.teamId ? "border-red-500/50" : "border-slate-600/50"
                }`}
              >
                <option value="" className="bg-slate-800">
                  {loadingTeams ? "Loading teams..." : "-- Select Team --"}
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
              {!loadingTeams && teams.length === 0 && (
                <p className="text-amber-400 text-sm">No teams available. Create a team first.</p>
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
                <h2 className="text-lg font-semibold text-white">Project Timeline</h2>
                <p className="text-slate-400 text-sm">Set optional start and end dates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
