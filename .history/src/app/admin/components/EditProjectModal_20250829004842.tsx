"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import useAdminData from "../hooks/useAdminData";

interface EditProjectModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updates: { name: string; description?: string; teamId?: number }) => Promise<void>;
}

export default function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  const { teams } = useAdminData();
  const [form, setForm] = useState({
    name: project.name,
    description: project.description || "",
    teamId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setForm({
        name: project.name || "",
        description: project.description || "",
        teamId: project.teamId?.toString() || project.team?.id?.toString() || "",
      });
      setError("");
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!form.name.trim()) {
      setError("Project name is required");
      setLoading(false);
      return;
    }

    try {
      const updates: any = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };
      
      if (form.teamId) {
        updates.teamId = parseInt(form.teamId);
      }
      
      await onSave(project.id, updates);
      onClose();
    } catch (err: any) {
      console.error("EditProjectModal error:", err);
      setError(err.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Edit Project</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Project Name Field */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Description</label>
            <textarea
              placeholder="Enter project description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Team Assignment */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Assign to Team</label>
            <select
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-gray-300 hover:bg-white/10 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 px-4 py-3 text-white font-medium transition-all duration-200"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}