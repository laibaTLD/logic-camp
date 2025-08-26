"use client";

import { useState, useEffect, useCallback } from "react";

// -----------------
// Types
// -----------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "teamLead";
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

  // ✅ Helper: get auth headers (memoized)
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken") || localStorage.getItem("token")
        : null;
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" };
  }, []);

  // -----------------
  // Fetch Users
  // -----------------
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        console.error("Error fetching users", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [getAuthHeaders]);

  // -----------------
  // Fetch Projects
  // -----------------
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (err) {
        console.error("Error fetching projects", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [getAuthHeaders]);

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
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
    } catch (err) {
      console.error("Error approving user", err);
    }
  }, [getAuthHeaders]);

  const rejectUser = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isApproved: false }),
      });
      if (!res.ok) throw new Error("Failed to reject user");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u)));
    } catch (err) {
      console.error("Error rejecting user", err);
    }
  }, [getAuthHeaders]);

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
  }, [getAuthHeaders]);

  const editUser = useCallback(async (id: number, updates: Partial<User>) => {
    try {
      const allowedRoles: User["role"][] = ["employee", "teamLead", "admin"];
      if (updates.role && !allowedRoles.includes(updates.role)) {
        throw new Error("Invalid role value");
      }

      // Prepare only fields that exist
      const body: Partial<User> = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      if (updates.role !== undefined) body.role = updates.role;
      if (updates.isApproved !== undefined) body.isApproved = updates.isApproved;

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to update user");
      }

      const result = await res.json();
      // Backend returns { message, user }
      const updatedUser: User = result.user || result;

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)));
    } catch (err) {
      console.error("Error editing user", err);
      throw err; // propagate to modal
    }
  }, [getAuthHeaders]);

  // -----------------
  // Project Actions
  // -----------------
  const openProject = useCallback((id: number) => {
    console.log("Open project", id);
    // router.push(`/admin/projects/${id}`);
  }, []);

  return {
    users,
    loadingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    editUser,
    projects,
    loadingProjects,
    openProject,
  };
}
