"use client";

import { Check, X, Edit2, Trash2 } from "lucide-react";
import useAdminData, { User } from "../hooks/useAdminData";

export default function UserRow({ user }: { user: User }) {
  const { approveUser, rejectUser, deleteUser, editUser } = useAdminData();

  return (
    <div className="grid grid-cols-12 items-center gap-4 px-3 py-3 hover:bg-white/5 transition-colors rounded-lg">
      {/* User Info */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
        <div className="truncate">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-400 truncate">{user.email}</div>
        </div>
      </div>

      {/* Role */}
      <div className="col-span-2">
        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300">
          {user.role}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-2">
        {user.isApproved ? (
          <span className="text-xs font-medium text-emerald-400 animate-pulse">
            Approved
          </span>
        ) : (
          <span className="text-xs font-medium text-amber-400">Pending</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-4 flex justify-end gap-3">
        <button
          onClick={() => editUser(user.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600/30 transition-transform hover:scale-110"
          title="Edit User"
        >
          <Edit2 className="h-5 w-5 text-indigo-400" />
        </button>

        <button
          onClick={() => approveUser(user.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-emerald-600/30 transition-transform hover:scale-110"
          title="Approve User"
        >
          <Check className="h-5 w-5 text-emerald-400" />
        </button>

        <button
          onClick={() => rejectUser(user.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-amber-600/30 transition-transform hover:scale-110"
          title="Reject User"
        >
          <X className="h-5 w-5 text-amber-400" />
        </button>

        <button
          onClick={() => deleteUser(user.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-600/30 transition-transform hover:scale-110"
          title="Delete User"
        >
          <Trash2 className="h-5 w-5 text-red-400" />
        </button>
      </div>
    </div>
  );
}

