// src/app/admin/page.tsx
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

  // 🔒 Protect Admin Dashboard
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        localStorage.removeItem(TOKEN_KEY);
        router.push("/admin/login");
        return;
      }
      setAuthenticated(true);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    }
  }, [router]);

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch users");

      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  // 🔘 Update user (role / approval)
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
        // ✅ Refresh list after update (ensures latest data from backend)
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // 🔘 Delete user
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
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (!authenticated) return <p>Redirecting...</p>;
  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🔒 Admin Dashboard</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateUser(user.id, { role: e.target.value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="teamLead">Team Lead</option>
                  </select>
                </td>
                <td>{user.isApproved ? "✅" : "❌"}</td>
                <td>
                  {user.isApproved ? (
                    <button onClick={() => updateUser(user.id, { isApproved: false })}>
                      Reject
                    </button>
                  ) : (
                    <button onClick={() => updateUser(user.id, { isApproved: true })}>
                      Approve
                    </button>
                  )}
                  <button onClick={() => deleteUser(user.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
