"use client";

import { useState, useEffect } from "react";

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
  members: User[];
}

export default function useAdminData() {
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/admin/projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects", err);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  // Actions
  const approveUser = (id: number) => {
    console.log("Approving user", id);
  };
  const rejectUser = (id: number) => {
    console.log("Rejecting user", id);
  };
  const deleteUser = (id: number) => {
    console.log("Deleting user", id);
  };
  const editUser = (id: number) => {
    console.log("Editing user", id);
  };

  const openProject = (id: number) => {
    console.log("Opening project", id);
  };

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
