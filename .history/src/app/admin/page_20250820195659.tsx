"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
  role: string;
}

const TOKEN_KEY = "adminToken";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // -------------------
  // Check auth + fetch users
  // -------------------
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid response");
        setUsers(data);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  // -------------------
  // Approve / Reject user
  // -------------------
  const toggleApproval = async (id: number, approve: boolean) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/admin/users/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isApproved: approve }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isApproved: approve } : u
        )
      );
    }
  };

  // -------------------
  // Update role
  // -------------------
  const saveRole = async (id: number, role: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role } : u
        )
      );
    }
  };

  // -------------------
  // Delete user
  // -------------------
  const deleteUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Approved</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                <select
                  value={u.role}
                  onChange={(e) => saveRole(u.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                  <option value="teamLead">Team Lead</option>
                </select>
              </td>
              <td className="border p-2">
                {u.isApproved ? "✅" : "❌"}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => toggleApproval(u.id, !u.isApproved)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  {u.isApproved ? "Reject" : "Approve"}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
