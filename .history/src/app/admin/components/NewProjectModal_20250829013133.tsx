"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject, teams, loadingTeams } = useAdminData();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!selectedTeam) {
      setError("Please select a team for this project");
      setLoading(false);
      return;
    }

    try {
      await createProject({
        name,
        description,
        teamId: selectedTeam,
      });

      toast.success(`Project "${name}" created successfully!`);
      setName("");
      setDescription("");
      setSelectedTeam(undefined);
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      toast.error(`Failed to create project: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative animate-scaleIn text-gray-100 space-y-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Project Name Field */}
          <div className="space-y-2">
            <label className="text-gray-200 text-base font-medium block mb-3">Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Description</label>
            <textarea
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-base"
              required
            />
          </div>

          {/* Team Selector */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">
              Assign Team <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedTeam ?? ""}
              onChange={(e) =>
                setSelectedTeam(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              disabled={loadingTeams}
              required
            >
              <option value="" className="bg-gray-800 text-gray-300">
                {loadingTeams ? "Loading teams..." : "-- Select Team --"}
              </option>
              {!loadingTeams && teams.map((team) => (
                <option key={team.id} value={team.id} className="bg-gray-800 text-white">
                  {team.name}
                </option>
              ))}
            </select>
            {!loadingTeams && teams.length === 0 && (
              <p className="text-amber-400 text-xs mt-1">No teams available. Create a team first.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingTeams}
            className="w-full mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Project...
              </span>
            ) : (
              "Create Project"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
