"use client";

import useAdminData from "@/app/admin/hooks/useAdminData"; // ✅ adjust path to where your hook is
import { User } from "@/app/admin/hooks/useAdminData";

export default function UserTable() {
  const { users, loadingUsers } = useAdminData();

  if (loadingUsers) {
    return <p className="p-4">Loading users...</p>;
  }

  if (!users || users.length === 0) {
    return <p className="p-4 text-gray-500">No users found.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Approved</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                {user.isApproved ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
