"use client";

import useAdminData from "@/app/admin/hooks/useAdminData";

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
          <tr key={u.id}>
            <td className="p-2 border-b border-gray-800">{u.name}</td>
            <td className="p-2 border-b border-gray-800">{u.email}</td>
            <td className="p-2 border-b border-gray-800">{u.role}</td>
            <td className="p-2 border-b border-gray-800">
              {u.isApproved ? "✅" : "❌"}
            </td>
            <td className="p-2 border-b border-gray-800 space-x-2">
              <button onClick={() => approveUser(u.id)}>Approve</button>
              <button onClick={() => rejectUser(u.id)}>Reject</button>
              {/* <button onClick={() => editUser(u.id, data)}>Edit</button> */}
              <button onClick={() => deleteUser(u.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
