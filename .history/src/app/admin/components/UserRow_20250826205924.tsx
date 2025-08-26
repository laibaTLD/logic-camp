"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import EditUserModal from "./EditUserModal";

export default function UserRow({ user, onRefresh }: { user: any; onRefresh: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <tr className="border-b border-white/10">
        <td className="px-4 py-3">{user.name}</td>
        <td className="px-4 py-3">{user.email}</td>
        <td className="px-4 py-3">{user.role}</td>
        <td className="px-4 py-3 flex gap-2">
          {/* Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40"
          >
            <Pencil size={16} />
          </button>
          {/* Delete, Approve, Reject would also be here */}
        </td>
      </tr>

      {isEditing && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={onRefresh}
        />
      )}
    </>
  );
}
