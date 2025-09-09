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

  if (loadingUsers) return <p>Loading users...</p>;

  return (
    <>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b border-gray-700">Name</th>
            <th className="p-2 border-b border-gray-700">Email</th>
            <th className="p-2 border-b border-gray-700">Role</th>
            <th className="p-2 border-b border-gray-700">Approved</th>
            <th className="p-2 border-b border-gray-700">Actions</th>
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
