"use client";

import { useState } from "react";
import useAdminData from "@/app/admin/hooks/useAdminData";
import UserRow from "./UserRow";
import EditUserModal from "./EditUserModal";

export default function UserTable() {
  const { users, loadingUsers, approveUser, rejectUser, deleteUser, editUser } =
    useAdminData();

  const [editingUser, setEditingUser] = useState<any | null>(null);

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
            />
          ))}
        </tbody>
      </table>

      {/* ✅ Modal lives OUTSIDE table */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={editUser}
        />
      )}
    </>
  );
}
