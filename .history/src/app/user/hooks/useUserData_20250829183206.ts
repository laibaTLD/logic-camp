"use client";

import { useState, useEffect, useCallback } from "react";

import { Project } from "../../admin/hooks/useAdminData"; // Reuse types from admin

export default function useUserData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch("/api/user/projects", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setError("Failed to fetch user projects");
      }

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError("An error occurred while fetching projects");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  return {
    projects,
    loadingProjects,
    fetchUserProjects, // Expose for refresh if needed
  };
}