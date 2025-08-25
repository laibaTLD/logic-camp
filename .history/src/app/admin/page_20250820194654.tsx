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
  const [editRole, setEditRole] = useState("");
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
  useEffect(() => {
    if (!authenticated) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch users");
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authenticated]);

  // 🔘 Approve / Reject
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

  // 🔘 Delete user
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

  // 🔘 Update role
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

  if (!authenticated) return <p>Redirecting...</p>;
  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🔒 Admin Dashboard</h1>
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
                  onChange={(e) => {
                    setEditRole(e.target.value);
                    saveRole(user.id, e.target.value);
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                  <option value="teamLead">Team Lead</option>
                </select>
              </td>
              <td>{user.isApproved ? "✅" : "❌"}</td>
              <td>
                {user.isApproved ? (
                  <button onClick={() => toggleApproval(user.id, false)}>
                    Reject
                  </button>
                ) : (
                  <button onClick={() => toggleApproval(user.id, true)}>
                    Approve
                  </button>
                )}
                <button onClick={() => deleteUser(user.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
