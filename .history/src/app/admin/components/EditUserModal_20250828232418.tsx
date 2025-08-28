"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EditUserModalProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: "employee" | "teamLead" | "admin";
  };
  onClose: () => void;
  onSave: (id: number, updates: any) => Promise<void>;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);

  // Backend roles
  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "teamLead", label: "Team Lead" },
    { value: "admin", label: "Admin" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(user.id, form);
      onClose();
    } catch (err: any) {
      console.error("EditUserModal error:", err);
      alert("Error updating user: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className="bg-[#111] border border-white/10 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative animate-scaleIn"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6">✏️ Edit User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "employee" | "teamLead" | "admin" })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-500"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
