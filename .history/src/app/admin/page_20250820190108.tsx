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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const router = useRouter();

  const TOKEN_KEY = "adminToken";

  // ----------------------
  // Fetch users
  // ----------------------
  const fetchUsers = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Approve user
  // ----------------------
  const approveUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // ----------------------
  // Reject user
  // ----------------------
  const rejectUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u)));
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // ----------------------
  // Delete user
  // ----------------------
  const deleteUser = async (id: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ----------------------
  // Edit user
  // ----------------------
  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetch("/api/admin/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data.user : u)));
      setEditingUser(null);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  // ----------------------
  // Logout
  // ----------------------
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    router.push("/admin/login");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <button
        onClick={handleLogout}
        style={{ marginBottom: "1rem", background: "red", color: "white", padding: "0.5rem 1rem" }}
      >
        Logout
      </button>

      {editingUser && (
        <div style={{ marginBottom: "1rem", border: "1px solid gray", padding: "1rem" }}>
          <h3>Edit User: {editingUser.id}</h3>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
          <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
          <input value={editRole} onChange={(e) => setEditRole(e.target.value)} placeholder="Role" />
          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditingUser(null)}>Cancel</button>
        </div>
      )}

      <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isApproved ? "Yes" : "No"}</td>
                <td>{user.role}</td>
                <td>
                  {!user.isApproved && (
                    <button onClick={() => approveUser(user.id)} style={{ marginRight: "0.5rem" }}>
                      Approve
                    </button>
                  )}
                  {user.isApproved && (
                    <button onClick={() => rejectUser(user.id)} style={{ marginRight: "0.5rem", background: "orange" }}>
                      Reject
                    </button>
                  )}
                  <button onClick={() => startEdit(user)} style={{ marginRight: "0.5rem" }}>
                    Edit
                  </button>
                  <button onClick={() => deleteUser(user.id)} style={{ background: "red", color: "white" }}>
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
