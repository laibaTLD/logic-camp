"use client";

import { Pencil, Trash2, Check, XCircle } from "lucide-react";

interface UserRowProps {
  user: any;
  approveUser: (id: number) => void | Promise<void>;
  rejectUser: (id: number) => void | Promise<void>;
  deleteUser: (id: number) => void | Promise<void>;
  editUser: (id: number, data: any) => void | Promise<void>;
  onEditStart: (user: any) => void;
  onDeleteStart: (user: any) => void;
}

// Normalize and map backend roles
function getRoleLabel(role: string): string {
  if (!role) return "Unknown";

  const normalized = role.trim().toLowerCase();

  switch (normalized) {
    case "admin":
    case "admin user":
      return "Admin";
    case "employee":
      return "Employee";
    case "teamlead":
    case "team lead":
    case "team_lead":
      return "Team Lead";
    default:
      return role; // fallback: show whatever backend sent
  }
}

export default function UserRow({
  user,
  approveUser,
  rejectUser,
  deleteUser,
  onEditStart,
  onDeleteStart,
}: UserRowProps) {

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="p-4 text-white">{user.name}</td>
      <td className="p-4 text-slate-300">{user.email}</td>

      {/* ✅ Role is normalized here */}
      <td className="p-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30">
          {getRoleLabel(user.role)}
        </span>
      </td>

      <td className="p-4">
        {user.isApproved ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-500/30">
            ✅ Approved
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600/20 text-red-300 border border-red-500/30">
            ❌ Pending
          </span>
        )}
      </td>
      <td className="p-4 space-x-2 flex items-center">
        {/* Approve */}
        <button
          onClick={() => approveUser(user.id)}
          className="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-300 hover:text-green-200 transition-all duration-200"
          title="Approve User"
        >
          <Check size={16} />
        </button>

        {/* Reject */}
        <button
          onClick={() => rejectUser(user.id)}
          className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 text-yellow-300 hover:text-yellow-200 transition-all duration-200"
          title="Reject User"
        >
          <XCircle size={16} />
        </button>

        {/* Edit */}
        <button
          onClick={() => onEditStart(user)}
          className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all duration-200"
          title="Edit User"
        >
          <Pencil size={16} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDeleteStart(user)}
          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 hover:text-red-200 transition-all duration-200"
          title="Delete User"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
