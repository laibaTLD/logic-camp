"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, XCircle } from "lucide-react";
import EditUserModal from "./EditUserModal";

interface UserRowProps {
  user: any;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  deleteUser: (id: string) => void;
  editUser: (id: string, data: any) => void;
  onRefresh: () => void;
}

export default function UserRow({
  user,
  approveUser,
  rejectUser,
  deleteUser,
  editUser,
  onRefresh,
}: UserRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-800">
        <td className="p-2">{user.name}</td>
        <td className="p-2">{user.email}</td>
        <td className="p-2">{user.role}</td>
        <td className="p-2">{user.isApproved ? "✅" : "❌"}</td>
        <td className="p-2 space-x-2 flex items-center">
          {/* Approve */}
          <button
            onClick={() => approveUser(user.id)}
            className="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/40"
          >
            <Check size={16} />
          </button>

          {/* Reject */}
          <button
            onClick={() => rejectUser(user.id)}
            className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/40"
          >
            <XCircle size={16} />
          </button>

          {/* Edit */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => deleteUser(user.id)}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>

      {/* Edit modal */}
      {isEditing && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={() => {
            editUser(user.id, user);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
