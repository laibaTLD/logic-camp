"use client";

import { motion } from "framer-motion";
import { Check, X, Edit2, Trash2 } from "lucide-react";
import useAdminData, { User } from "../hooks/useAdminData";

export default function UserRow({ user }: { user: User }) {
  const { approveUser, rejectUser, deleteUser, editUser } = useAdminData();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="grid grid-cols-12 items-center gap-2 px-3 py-3 hover:bg-white/5 transition-colors"
    >
      <div className="col-span-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
          <div className="min-w-0">
            <div className="truncate font-medium">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">ID: {user.id}</div>
          </div>
        </div>
      </div>
      <div className="col-span-3 truncate text-gray-300">{user.email}</div>
      <div className="col-span-2">
        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
          {user.role}
        </span>
      </div>
      <div className="col-span-1">
        {user.isApproved ? (
          <span className="text-xs text-emerald-400">Approved</span>
        ) : (
          <span className="text-xs text-amber-400">Pending</span>
        )}
      </div>
      <div className="col-span-2">
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
            onClick={() => editUser(user.id)}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2 hover:bg-emerald-400/20 transition"
            onClick={() => approveUser(user.id)}
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-2 hover:bg-amber-400/20 transition"
            onClick={() => rejectUser(user.id)}
            title="Reject"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 hover:bg-rose-500/20 transition"
            onClick={() => deleteUser(user.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
