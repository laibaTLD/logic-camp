"use client";

import { useState } from "react";
import { X, Users, Check } from "lucide-react";
import toast from "react-hot-toast";

interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: { id: number; name: string; email: string }[];
  createTeam: (team: { name: string; members: number[]; description?: string }) => Promise<any>;
}

export default function NewTeamModal({ isOpen, onClose, users, createTeam }: NewTeamModalProps) {

  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
      setSelectAll(false);
    } else {
      setSelectedMembers(users.map(user => user.id));
      setSelectAll(true);
    }
  };

  const handleMemberToggle = (userId: number) => {
    setSelectedMembers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      // Update select all state based on selection
      setSelectAll(newSelection.length === users.length);
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    if (!name.trim()) {
      setError("Team name is required");
      setLoading(false);
      return;
    }

    if (selectedMembers.length === 0) {
      setError("At least one member must be selected");
      setLoading(false);
      return;
    }

    try {
      await createTeam({
        name: name.trim(),
        members: selectedMembers,
      });

      toast.success(`Team "${name}" created successfully!`);
      setName("");
      setSelectedMembers([]);
      setSelectAll(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "Something went wrong";
      
      // Handle specific error cases
      if (err.message && err.message.includes('already exists')) {
        errorMessage = "A team with this name already exists. Please choose a different name.";
      }
      
      setError(errorMessage);
      toast.error(`Failed to create team: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-gray-900/90 border border-white/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative animate-scaleIn text-gray-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Create New Team</h2>
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium block">Team Name</label>
            <input
              type="text"
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-gray-800/50 border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-sm font-medium">Select Team Members</label>
              <span className="text-xs text-gray-400">
                {selectedMembers.length} of {users.length} selected
              </span>
            </div>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-white/10">
              <div className="relative">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="sr-only"
                />
                <label
                  htmlFor="select-all"
                  className={`flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 ${
                    selectAll
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-gray-400 hover:border-indigo-400'
                  }`}
                >
                  {selectAll && <Check className="h-3 w-3 text-white" />}
                </label>
              </div>
              <label htmlFor="select-all" className="text-white font-medium cursor-pointer flex-1">
                Select All Users
              </label>
            </div>

            {/* Individual User Checkboxes */}
            <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-3 bg-gray-800/20">
              {users.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No users available</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 ${
                          selectedMembers.includes(user.id)
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-400 hover:border-indigo-400'
                        }`}
                      >
                        {selectedMembers.includes(user.id) && <Check className="h-3 w-3 text-white" />}
                      </label>
                    </div>
                    <label htmlFor={`user-${user.id}`} className="text-white cursor-pointer flex-1">
                      {user.name}
                    </label>
                    {user.email && (
                      <span className="text-xs text-gray-400">{user.email}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-white font-medium hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedMembers.length === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
