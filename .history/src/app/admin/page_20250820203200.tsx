"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

const TOKEN_KEY = "adminToken";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // ✅ Check authentication
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthenticated(true);
    fetchUsers();
  }, []);

  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update user (role/approval)
  const updateUser = async (id: number, updates: Partial<User>) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        // only parse JSON if response has it
        if (res.headers.get("content-type")?.includes("application/json")) {
          await res.json();
        }
        fetchUsers();
      } else {
        const errorText = await res.text();
        alert(errorText || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // ✅ Delete user
  const deleteUser = async (id: number) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        // don’t parse JSON if backend sends empty
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const errorText = await res.text();
        alert(errorText || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (!authenticated) return <p>Redirecting...</p>;
  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔒 Admin Dashboard</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2">ID</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Email</th>
            <th className="border px-2">Role</th>
            <th className="border px-2">Approved</th>
            <th className="border px-2">Actions</th>
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
            users.map((user) => (
              <tr key={user.id}>
                <td className="border px-2">{user.id}</td>
                <td className="border px-2">{user.name}</td>
                <td className="border px-2">{user.email}</td>
                <td className="border px-2">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateUser(user.id, { role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="border px-2">
                  <input
                    type="checkbox"
                    checked={user.isApproved}
                    onChange={(e) =>
                      updateUser(user.id, { isApproved: e.target.checked })
                    }
                  />
                </td>
                <td className="border px-2">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
