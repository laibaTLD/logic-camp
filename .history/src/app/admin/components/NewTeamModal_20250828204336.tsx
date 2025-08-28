"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import useAdminData from "../hooks/useAdminData";

interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: { id: number; name: string }[];
}

export default function NewTeamModal({ isOpen, onClose, users }: NewTeamModalProps) {
  const { createTeam } = useAdminData();

  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createTeam({
        name,
        members: selectedMembers,
      });

      toast.success(`Team "${name}" created successfully!`);
      setName("");
      setSelectedMembers([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      toast.error(`Failed to create team: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-[0_12px_40px_rgba(0,0,0,0.35)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Create New Team</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Team Members</label>
            <select
              multiple
              value={selectedMembers.map(String)}
              onChange={(e) =>
                setSelectedMembers(Array.from(e.target.selectedOptions, option => parseInt(option.value)))
              }
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
