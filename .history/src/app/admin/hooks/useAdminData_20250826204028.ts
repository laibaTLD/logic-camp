"use client";

import { useState, useEffect, useCallback } from "react";

// -----------------
// Types
// -----------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  updatedAt: string;
  members?: User[];
}

// -----------------
// Hook
// -----------------
export default function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // ✅ Helper: get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" };
  };

  // 🔹 Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        console.log("API /users response:", data);

        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        console.error("Error fetching users", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // 🔹 Fetch Projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects", {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        console.log("API /projects response:", data);

        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (err) {
        console.error("Error fetching projects", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  // -----------------
  // User Actions
  // -----------------
  const approveUser = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isApproved: true }),
      });

      if (!res.ok) throw new Error("Failed to approve user");

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
      );
    } catch (err) {
      console.error("Error approving user", err);
    }
  }, []);

  const rejectUser = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isApproved: false }),
      });

      if (!res.ok) throw new Error("Failed to reject user");

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u))
      );
    } catch (err) {
      console.error("Error rejecting user", err);
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user", err);
    }
  }, []);

  const editUser = useCallback(async (id: number, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update user");
      const updated = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
      );
    } catch (err) {
      console.error("Error editing user", err);
    }
  }, []);

  // -----------------
  // Project Actions
  // -----------------
  const openProject = useCallback((id: number) => {
    console.log("Open project", id);
    // implement router.push(`/admin/projects/${id}`)
  }, []);

  return {
    // users
    users,
    loadingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    editUser,

    // projects
    projects,
    loadingProjects,
    openProject,
  };
}
