"use client";

import { useState } from "react";
import UserRow from "./UserRow";
import EditUserModal from "./EditUserModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface UserTableProps {
  users: any[];
  loadingUsers: boolean;
  approveUser: (userId: number) => Promise<void>;
  rejectUser: (userId: number) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  editUser: (userId: number, userData: any) => Promise<void>;
}

export default function UserTable({ users, loadingUsers, approveUser, rejectUser, deleteUser, editUser }: UserTableProps) {

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-white/10">
              <th className="p-4 text-slate-200 font-semibold">Name</th>
              <th className="p-4 text-slate-200 font-semibold">Email</th>
              <th className="p-4 text-slate-200 font-semibold">Role</th>
              <th className="p-4 text-slate-200 font-semibold">Approved</th>
              <th className="p-4 text-slate-200 font-semibold">Actions</th>
            </tr>
          </thead>
        <tbody>
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              editUser={editUser}
              onEditStart={(user) => setEditingUser(user)}
              onDeleteStart={(user) => setDeletingUser(user)}
            />
          ))}
        </tbody>
      </table>

      {/* ✅ Modals live OUTSIDE table */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={editUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => {
          if (deletingUser) {
            setIsDeleting(true);
            try {
              await deleteUser(deletingUser.id);
              setDeletingUser(null);
            } catch (error) {
              console.error("Failed to delete user:", error);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        title="Delete User"
        message={deletingUser ? `Are you sure you want to delete ${deletingUser.name}? This action cannot be undone.` : ""}
        loading={isDeleting}
      />
    </>
  );
}
