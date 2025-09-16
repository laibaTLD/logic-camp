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

export interface Team {
  id: number;
  name: string;
  members: User[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  progress?: number;
  updatedAt: string;
  statuses?: Array<{ id: number; title: string; description?: string; color: string }>;
  status_title?: string;
  start_date?: string;
  end_date?: string;
  team_id?: number | null;
  owner_id?: number;
  members?: User[];
  team?: {
    id: number;
    name: string;
    members: User[];
  };
}

export interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completed: boolean;
  assignedTo?: TaskAssignee;
  assignees?: TaskAssignee[];
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// -----------------
// Hook
// -----------------
export default function useAdminData(isAuthenticated: boolean = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [projectsAll, setProjectsAll] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPerPage] = useState(2);
  const [projectsSearch, setProjectsSearch] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalProjectsPages, setTotalProjectsPages] = useState(0);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsPerPage] = useState(6); // 6 teams per page for nice grid layout
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalTeamsPages, setTotalTeamsPages] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Determine effective authentication: prefer explicit prop, otherwise infer from localStorage
  const [effectiveAuthenticated, setEffectiveAuthenticated] = useState<boolean>(isAuthenticated);

  useEffect(() => {
    // If caller didn't assert authentication, infer from presence of adminToken
    if (!isAuthenticated) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        setEffectiveAuthenticated(!!token);
      } catch {
        setEffectiveAuthenticated(false);
      }
    } else {
      setEffectiveAuthenticated(true);
    }
  }, [isAuthenticated]);

  // -----------------
  // Auth Headers
  // -----------------
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const adminToken = localStorage.getItem('adminToken');
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    
    return headers;
  }, []);

  // -----------------
  // Fetch Users
  // -----------------
  useEffect(() => {
    if (!effectiveAuthenticated) {
      setLoadingUsers(false);
      return;
    }

    async function fetchUsers() {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/admin/users", { headers, credentials: 'include' });
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
  }, [getAuthHeaders, effectiveAuthenticated]);

  // -----------------
  // Fetch Projects (server-side pagination using page & limit)
  // -----------------
  const fetchProjects = useCallback(async (page: number = 1, search: string = "") => {
    if (!effectiveAuthenticated) {
      setLoadingProjects(false);
      return;
    }
    try {
      setLoadingProjects(true);
      const headers = getAuthHeaders();
      const params = new URLSearchParams({ page: String(page), limit: String(projectsPerPage) });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/projects?${params.toString()}`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const rawProjects: any[] = Array.isArray(data.projects) ? data.projects : [];
      const normalized = rawProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        progress: p.progress,
        updatedAt: p.updatedAt || p.updated_at,
        statuses: p.statuses,
        status_title: p.status_title,
        priority: p.priority,
        startDate: p.startDate || p.start_date,
        endDate: p.endDate || p.end_date,
        teamId: p.teamId || p.team_id,
        ownerId: p.ownerId || p.owner_id,
        members: p.members,
        team: p.team,
        owner: p.owner,
      }));
      setProjects(normalized);
      setTotalProjects(data.total || 0);
      setTotalProjectsPages(data.totalPages || Math.max(1, Math.ceil((data.total || 0) / projectsPerPage)));
      setProjectsPage(data.page || page);
    } catch (err) {
      console.error("Error fetching projects", err);
      setProjects([]);
      setTotalProjects(0);
      setTotalProjectsPages(0);
    } finally {
      setLoadingProjects(false);
    }
  }, [getAuthHeaders, effectiveAuthenticated, projectsPerPage]);

  useEffect(() => {
    if (effectiveAuthenticated) {
      fetchProjects(1, "");
    } else {
      setLoadingProjects(false);
    }
  }, [effectiveAuthenticated, fetchProjects]);

  // -----------------
  // Fetch Teams with Pagination
  // -----------------
  const fetchTeams = useCallback(async (page: number = 1) => {
    if (!effectiveAuthenticated) {
      setLoadingTeams(false);
      return;
    }

    try {
      setLoadingTeams(true);
      const headers = getAuthHeaders();
      const res = await fetch(`/api/teams?page=${page}&limit=${teamsPerPage}`, { 
        headers, 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      
      // Handle paginated response
      setTeams(Array.isArray(data.teams) ? data.teams : []);
      setTotalTeams(data.total || 0);
      setTotalTeamsPages(Math.ceil((data.total || 0) / teamsPerPage));
      setTeamsPage(page);
    } catch (err) {
      console.error("Error fetching teams", err);
      setTeams([]);
      setTotalTeams(0);
      setTotalTeamsPages(0);
    } finally {
      setLoadingTeams(false);
    }
  }, [getAuthHeaders, teamsPerPage, effectiveAuthenticated]);

  useEffect(() => {
    if (effectiveAuthenticated) {
      fetchTeams(1);
    } else {
      // Avoid indefinite loading when unauthenticated callers use the hook (e.g., modal pages)
      setLoadingTeams(false);
    }
  }, [fetchTeams, effectiveAuthenticated]);

  // -----------------
  // Fetch Tasks
  // -----------------
  useEffect(() => {
    if (!effectiveAuthenticated) {
      setLoadingTasks(false);
      return;
    }

    async function fetchTasks() {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/tasks", { headers, credentials: 'include' });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks", err);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchTasks();
  }, [getAuthHeaders, effectiveAuthenticated]);

  // -----------------
  // User Actions
  // -----------------
  const approveUser = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/users/${id}/approve`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ isApproved: true }),
        });
        if (!res.ok) throw new Error("Failed to approve user");
        const data = await res.json();
        const updated = data.user || { id, isApproved: true };
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
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
          credentials: 'include',
          body: JSON.stringify({ isApproved: false }),
        });
        if (!res.ok) throw new Error("Failed to reject user");
        const data = await res.json();
        const updated = data.user || { id, isApproved: false };
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
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
          credentials: 'include',
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

        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates),
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
  // Team Actions
  // -----------------
  const createTeam = useCallback(
    async (team: { name: string; members: number[]; description?: string }) => {
      try {
        if (!team.members || team.members.length === 0) {
          throw new Error("At least one member is required");
        }

        // Step 1: Create the team
        const createRes = await fetch(`/api/teams`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            name: team.name,
            description: team.description || `Team for ${team.name}`,
          }),
        });

        if (!createRes.ok) {
          const errorData = await createRes.json().catch(() => ({}));
          if (createRes.status === 409) {
            throw new Error("A team with this name already exists");
          }
          throw new Error(errorData?.error || "Failed to create team");
        }

        const createResult = await createRes.json();
        const newTeam: Team = createResult.team || createResult;

        // Step 2: Assign members to the team
        if (team.members.length > 0) {
          const assignRes = await fetch(`/api/teams/${newTeam.id}/assign`, {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userIds: team.members }),
          });

          if (!assignRes.ok) {
            const errorData = await assignRes.json().catch(() => ({}));
            console.warn("Failed to assign members:", errorData?.error);
            // Don't throw here - team was created successfully
          }
        }

        // Refresh teams list to get updated data with members
        await fetchTeams(teamsPage);
        return newTeam;
      } catch (err) {
        console.error("Error creating team", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchTeams, teamsPage]
  );

  const addTaskToProject = useCallback(
    async (projectId: number, task: { title: string; description?: string }) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(task),
        });
        if (!res.ok) throw new Error("Failed to add task");
        return await res.json();
      } catch (err) {
        console.error("Error adding task to project", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const openProject = useCallback((projectId: number) => {
    window.location.href = `/admin/projects/${projectId}`;
  }, []);

  const createProject = useCallback(
    async (project: { name: string; description?: string; teamId: number; statusTitle?: string; customStatuses?: any[] }) => {
      try {
        const res = await fetch(`/api/projects`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(project),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to create project");
        }
        await fetchProjects(projectsPage, projectsSearch);
      } catch (err) {
        console.error("Error creating project", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchProjects, projectsPage, projectsSearch]
  );

  const editProject = useCallback(
    async (projectId: number, updates: any) => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to update project");
        await fetchProjects(projectsPage, projectsSearch);
      } catch (err) {
        console.error("Error updating project", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchProjects, projectsPage, projectsSearch]
  );

  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to delete project");
        await fetchProjects(projectsPage, projectsSearch);
      } catch (err) {
        console.error("Error deleting project", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchProjects, projectsPage, projectsSearch]
  );

  const deleteTeam = useCallback(
    async (teamId: number) => {
      try {
        const res = await fetch(`/api/teams/${teamId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to delete team");
        await fetchTeams(teamsPage);
      } catch (err) {
        console.error("Error deleting team", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchTeams, teamsPage]
  );

  const deleteTeamCascade = useCallback(
    async (teamId: number) => {
      try {
        const res = await fetch(`/api/teams/${teamId}/cascade`, {
          method: "DELETE",
            headers: getAuthHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to cascade delete team");
        await fetchTeams(teamsPage);
      } catch (err) {
        console.error("Error cascading delete team", err);
        throw err;
      }
    },
    [getAuthHeaders, fetchTeams, teamsPage]
  );

  return {
    users,
    loadingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    editUser,

    projects,
    loadingProjects,
    projectsPage,
    projectsPerPage,
    projectsSearch,
    totalProjects,
    totalProjectsPages,
    setProjectsSearch,
    fetchProjects,

    teams,
    loadingTeams,
    teamsPage,
    teamsPerPage,
    totalTeams,
    totalTeamsPages,
    fetchTeams,

    tasks,
    loadingTasks,

    openProject,
    createProject,
    createTeam,
    editProject,
    deleteProject,
    addTaskToProject,

    deleteTeam,
    deleteTeamCascade,
  };
}
