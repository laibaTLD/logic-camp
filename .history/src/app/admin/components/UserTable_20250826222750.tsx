"use client";

import useAdminData from "@/app/admin/hooks/useAdminData";
import UserRow from "./UserRow";

export default function UserTable() {
  const { users, loadingUsers, approveUser, rejectUser, deleteUser, editUser } =
    useAdminData();

  if (loadingUsers) return <p>Loading users...</p>;

  return (
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
            onRefresh={() => {}}
          />
        ))}
      </tbody>
    </table>
  );
}
