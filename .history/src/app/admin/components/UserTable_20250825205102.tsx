"use client";

import UserRow from "./UserRow";

export default function UserTable({
  users,
  approveUser,
  rejectUser,
  deleteUser,
  startEdit,
  saveEdit,
  cancelEdit,
  editingUser,
  editName,
  editEmail,
  editRole,
  setEditName,
  setEditEmail,
  setEditRole,
}: any) {
  return (
   <div className="bg-slate-800 shadow-2xl shadow-[#141414a8] rounded-2xl w-2/3 overflow-hidden">
  <table className="w-full border-collapse text-left text-gray-200">
    <thead className="bg-slate-500 text-gray-300 uppercase text-sm">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Approved</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user: any) => (
              <UserRow
                key={user.id}
                user={user}
                approveUser={approveUser}
                rejectUser={rejectUser}
                deleteUser={deleteUser}
                startEdit={startEdit}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                editingUser={editingUser}
                editName={editName}
                editEmail={editEmail}
                editRole={editRole}
                setEditName={setEditName}
                setEditEmail={setEditEmail}
                setEditRole={setEditRole}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
