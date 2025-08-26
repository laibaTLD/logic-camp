"use client";

export default function UserRow({
  user,
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
  const isEditing = editingUser?.id === user.id;

  return (
    <tr className="border-b">
      <td className="p-3">{user.id}</td>
      <td className="p-3">
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border p-1 rounded"
          />
        ) : (
          user.name
        )}
      </td>
      <td className="p-3">
        {isEditing ? (
          <input
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="border p-1 rounded"
          />
        ) : (
          user.email
        )}
      </td>
      <td className="p-3">
        {isEditing ? (
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="teamLead">Team Lead</option>
          </select>
        ) : (
          user.role
        )}
      </td>
      <td className="p-3">{user.isApproved ? "Yes" : "No"}</td>
      <td className="p-3 flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={saveEdit}
              className="bg-green-500 text-black px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-400 text-black px-2 py-1 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {!user.isApproved && (
              <button
                onClick={() => approveUser(user.id)}
                className="bg-blue-500 text-black px-2 py-1 rounded"
              >
                Approve
              </button>
            )}
            {user.isApproved && (
              <button
                onClick={() => rejectUser(user.id)}
                className="bg-orange-500 text-black px-2 py-1 rounded"
              >
                Reject
              </button>
            )}
            <button
              onClick={() => startEdit(user)}
              className="bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => deleteUser(user.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
