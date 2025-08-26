"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function useAdminData() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(false);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("member");

  const router = useRouter();
  const TOKEN_KEY = "adminToken";

  // Fetch users
  const fetchUsers = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return router.push("/admin/login");

    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem(TOKEN_KEY);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return router.push("/admin/login");

    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
      setShowProjects(!showProjects);
    } catch (err) {
      console.error(err);
    }
  };

  // Approve/Reject/Delete/Edit users (same logic as your original code)
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
      if (!res.ok || !data.success) throw new Error("Failed to approve");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const rejectUser = async (id: number) => {
    console.log(id);
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
      console.log(res);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Failed to reject");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u)));
    } catch (err) {
      console.error(err);
    }
  };

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
      if (!res.ok || !data.success) throw new Error("Failed to delete");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Edit handling
  const startEdit = (user: any) => {
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
      const res = await fetch("/api/admin/users", {
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
      if (!res.ok || !data.success) throw new Error("Failed to save");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, name: editName, email: editEmail, role: editRole } : u
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("member");
  };

  return {
    users,
    projects,
    loading,
    showProjects,
    fetchUsers,
    fetchProjects,
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
  };
}
