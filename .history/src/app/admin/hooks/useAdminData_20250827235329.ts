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
  progress?: number; // optional
  updatedAt: string;
  status?: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  endDate?: string;
  teamId?: number;
  members?: User[];
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// -----------------
// Hook
// -----------------
export default function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // -----------------
  // Auth Headers
  // -----------------
  const getAuthHeaders = useCallback((): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    }
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }, []);

  // -----------------
  // Fetch Users
  // -----------------
  useEffect(() => {
    async function fetchUsers() {
      try {
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
          setUsers([]);
          setLoadingUsers(false);
          return;
        }
        const res = await fetch("/api/admin/users", { headers });
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
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
          setProjects([]);
          setLoadingProjects(false);
          return;
        }
        const res = await fetch("/api/projects", { headers });
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
  const approveUser = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/users/${id}/approve`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isApproved: true }),
        });
        if (!res.ok) throw new Error("Failed to approve user");
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, isApproved: true } : u)));
      } catch (err) {
        console.error("Error approving user", err);
      }
    },
    [getAuthHeaders]
  );

  const rejectUser = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/users/${id}/reject`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isApproved: false }),
        });
        if (!res.ok) throw new Error("Failed to reject user");
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, isApproved: false } : u)));
      } catch (err) {
        console.error("Error rejecting user", err);
      }
    },
    [getAuthHeaders]
  );

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete user");
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error("Error deleting user", err);
      }
    },
    [getAuthHeaders]
  );

  const editUser = useCallback(
    async (id: number, updates: Partial<User>) => {
      try {
        const allowedRoles: User["role"][] = ["employee", "teamLead", "admin"];
        if (updates.role && !allowedRoles.includes(updates.role)) throw new Error("Invalid role value");

        const body: Partial<User> = { ...updates };
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to update user");
        }

        const result = await res.json();
        const updatedUser: User = result.user || result;
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedUser } : u)));
      } catch (err) {
        console.error("Error editing user", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  // -----------------
  // Project Actions
  // -----------------
  const openProject = useCallback((id: number) => {
    console.log("Open project", id);
    // router.push(`/admin/projects/${id}`);
  }, []);

  const editProject = useCallback(
    async (
      id: number,
      updates: Partial<Project> & {
        status?: Project["status"];
        priority?: Project["priority"];
        startDate?: string;
        endDate?: string;
        teamId?: number;
      }
    ) => {
      try {
        const body: any = {};
        if (updates.name !== undefined) body.name = updates.name;
        if (updates.description !== undefined) body.description = updates.description;
        if (updates.status !== undefined) body.status = updates.status;
        if (updates.priority !== undefined) body.priority = updates.priority;
        if (updates.startDate !== undefined) body.startDate = updates.startDate;
        if (updates.endDate !== undefined) body.endDate = updates.endDate;
        if (updates.teamId !== undefined) body.teamId = updates.teamId;

        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH", // ✅ match backend
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || `Failed to edit project: ${res.status}`);
        }

        const result = await res.json();
        const updatedProject: Project = result.project || result;

        setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updatedProject } : p)));
      } catch (err) {
        console.error("Error editing project", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const deleteProject = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete project");
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting project", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const addTaskToProject = useCallback(
    async (id: number, task: { title: string }) => {
      try {
        const res = await fetch(`/api/projects/${id}/tasks`, {
          method: "PATCH", // match backend
          headers: getAuthHeaders(),
          body: JSON.stringify(task),
        });
        if (!res.ok) throw new Error("Failed to add task");
        const newTask = await res.json();
        console.log("Task added:", newTask);
      } catch (err) {
        console.error("Error adding task", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );


  // -----------------
// Project Actions
// -----------------
const createProject = useCallback(
  async (project: {
    name: string;
    description: string;
    status?: Project["status"];
    priority?: Project["priority"];
    startDate?: string;
    endDate?: string;
    teamId?: number;
    members?: number[];
  }) => {
    try {
      const res = await fetch(`/api/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(project),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `Failed to create project: ${res.status}`);
      }

      const result = await res.json();
      const newProject: Project = result.project || result;

      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error("Error creating project", err);
      throw err;
    }
  },
  [getAuthHeaders]
);

  // -----------------
  // Return
  // -----------------
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
    editProject,
    deleteProject,
    addTaskToProject,
    createProject
  };
}
