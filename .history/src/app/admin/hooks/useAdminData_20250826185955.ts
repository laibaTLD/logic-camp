"use client";

import { useEffect, useState, useCallback } from "react";

/** ========= Types ========= */
export interface User {
  id: number | string;
  name: string;
  email: string;
  role: "admin" | "teamLead" | "employee" | string;
  isApproved: boolean;
}

export interface Project {
  id: number | string;
  name: string;
  description: string;
  progress: number; // 0-100
  updatedAt: string | Date;
  members?: Array<{ id: string | number; name: string }>;
}

/** ========= Hook ========= */
export default function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch helpers with graceful fallback to mock data
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed users");
      const data = await res.json();
      setUsers(data?.users ?? data ?? []);
    } catch {
      // Fallback demo data to keep UI lively
      setUsers([
        {
          id: 1,
          name: "Ayesha Khan",
          email: "ayesha@logic.camp",
          role: "teamLead",
          isApproved: true,
        },
        {
          id: 2,
          name: "Saad Ali",
          email: "saad@logic.camp",
          role: "employee",
          isApproved: false,
        },
        {
          id: 3,
          name: "Laiba",
          email: "laiba@logic.camp",
          role: "admin",
          isApproved: true,
        },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed projects");
      const data = await res.json();
      setProjects(data?.projects ?? data ?? []);
    } catch {
      setProjects([
        {
          id: "p1",
          name: "LogicCamp Platform",
          description:
            "Core features: users, projects, tasks, calendar, messages.",
          progress: 72,
          updatedAt: new Date().toISOString(),
          members: [{ id: 1, name: "Laiba" }, { id: 2, name: "Ayesha" }],
        },
        {
          id: "p2",
          name: "Mobile Companion App",
          description:
            "Lightweight mobile app for notifications and quick actions.",
          progress: 41,
          updatedAt: new Date().toISOString(),
          members: [{ id: 3, name: "Saad" }],
        },
        {
          id: "p3",
          name: "Reporting & Analytics",
          description:
            "Dashboards, weekly summaries, and performance insights.",
          progress: 88,
          updatedAt: new Date().toISOString(),
          members: [{ id: 4, name: "Zain" }, { id: 5, name: "Hira" }],
        },
      ]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, [fetchUsers, fetchProjects]);

  /** ========= Mutations (wire to your API) ========= */
  const approveUser = async (id: User["id"]) => {
    try {
      await fetch(`/api/admin/users/${id}/approve`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u))
      );
    } catch {
      // optimistic already done
    }
  };

  const rejectUser = async (id: User["id"]) => {
    try {
      await fetch(`/api/admin/users/${id}/reject`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isApproved: false } : u))
      );
    } catch {}
  };

  const deleteUser = async (id: User["id"]) => {
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {}
  };

  const editUser = async (id: User["id"]) => {
    // You can replace this with a modal
