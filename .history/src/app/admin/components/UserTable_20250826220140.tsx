"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token"); // should be set at login
      if (!token) {
        setError("No token found. Please login again.");
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 must match backend
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data.users); // backend returns { success, users }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
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
            <th className="border px-4 py-2">Active</th>
            <th className="border px-4 py-2">Approved</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.isActive ? "✅" : "❌"}</td>
              <td className="border px-4 py-2">{user.isApproved ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
