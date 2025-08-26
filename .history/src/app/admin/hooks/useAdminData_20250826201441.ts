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

  // Helper: get auth headers
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 🔹 Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized: Admin token missing or invalid.");
          setUsers([]);
          return;
        }

        const data = await res.json();
        console.log("API /users response:", data); // debug

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
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
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized: Admin token missing or invalid.");
          setProjects([]);
          return;
        }

        const data = await res.json();
        console.log("API /projects response:", data); // debug

        if (Array.isArray(data)) {
          setProjects(data);
        } else if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          setProjects([]);
        }
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
  const approveUser = useCallback((id: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, isApproved: true } : u))
    );
  }, []);

  const rejectUser = useCallback((id: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, isApproved: false } : u))
    );
  }, []);

  const deleteUser = useCallback((id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const editUser = useCallback((id: number) => {
    console.log("Edit user", id);
    // implement modal or redirect
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
