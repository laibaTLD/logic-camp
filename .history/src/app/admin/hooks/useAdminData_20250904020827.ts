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
  status?: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  startDate?: string;
  endDate?: string;
  teamId?: number | null;
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
export default function useAdminData(isAuthenticated: boolean = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsPerPage] = useState(6); // 6 teams per page for nice grid layout
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalTeamsPages, setTotalTeamsPages] = useState(0);

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
    if (!isAuthenticated) {
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
  }, [getAuthHeaders, isAuthenticated]);

  // -----------------
  // Fetch Projects
  // -----------------
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingProjects(false);
      return;
    }

    async function fetchProjects() {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/projects", { headers, credentials: 'include' });
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
  }, [getAuthHeaders, isAuthenticated]);

  // -----------------
  // Fetch Teams with Pagination
  // -----------------
  const fetchTeams = useCallback(async (page: number = 1) => {
    if (!isAuthenticated) {
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
  }, [getAuthHeaders, teamsPerPage, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams(1);
    }
  }, [fetchTeams, isAuthenticated]);

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
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: 'include',
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

        setTeams(prev => [...prev, newTeam]);
        return newTeam;
      } catch (err) {
        console.error("Error creating team", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const editTeam = useCallback(
    async (id: number, updates: { name?: string; members?: number[] }) => {
      try {
        // Update team name if provided
        if (updates.name !== undefined) {
          const updateRes = await fetch(`/api/teams/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ name: updates.name }),
          });

          if (!updateRes.ok) {
            const errorData = await updateRes.json().catch(() => ({}));
            if (updateRes.status === 409) {
              throw new Error("A team with this name already exists");
            }
            throw new Error(errorData?.error || "Failed to update team name");
          }
        }

        // Update team members if provided
        if (updates.members !== undefined) {
          const membersRes = await fetch(`/api/teams/${id}/members`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userIds: updates.members }),
          });

          if (!membersRes.ok) {
            const errorData = await membersRes.json().catch(() => ({}));
            throw new Error(errorData?.error || "Failed to update team members");
          }
        }

        // Refresh teams list to get updated data
        const teamsRes = await fetch("/api/teams", {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(Array.isArray(data.teams) ? data.teams : []);
        }

        return true;
      } catch (err) {
        console.error("Error editing team", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const deleteTeam = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/teams/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to delete team");
        }

        setTeams(prev => prev.filter(t => t.id !== id));
        return true;
      } catch (err) {
        console.error("Error deleting team", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const deleteTeamCascade = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/teams/${id}/cascade`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to delete team with cascade");
        }

        const result = await res.json();
        setTeams(prev => prev.filter(t => t.id !== id));
        return result;
      } catch (err) {
        console.error("Error cascade deleting team", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  // -----------------
  // Project Actions
  // -----------------
  const openProject = useCallback((id: number) => console.log("Open project", id), []);

  const editProject = useCallback(
    async (id: number, updates: Partial<Project>) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates),
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
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE", headers: getAuthHeaders(), credentials: 'include' });
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
    async (id: number, task: { title: string; description?: string }) => {
      try {
        const res = await fetch(`/api/tasks`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            title: task.title,
            description: task.description || "Task created from project",
            status: "todo",
            priority: "medium",
            projectId: id,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to add task");
        }
        await res.json();
      } catch (err) {
        console.error("Error adding task", err);
        throw err;
      }
    },
    [getAuthHeaders]
  );

  const createProject = useCallback(
    async (project: {
      name: string;
      description: string;
      status?: Project["status"];
      priority?: Project["priority"];
      startDate?: string;
      endDate?: string;
      teamId?: number | null;
    }) => {
      try {
        if (!project.teamId) throw new Error("Project must belong to a team");

        const payload: any = {
          name: project.name,
          description: project.description,
          status: project.status || "planning",
          priority: project.priority || "medium",
          teamId: project.teamId,
        };

        if (project.startDate) payload.startDate = project.startDate;
        if (project.endDate) payload.endDate = project.endDate;

        const res = await fetch(`/api/projects`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload),
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
    projects,
    loadingProjects,
    teams,
    loadingTeams,
    teamsPage,
    teamsPerPage,
    totalTeams,
    totalTeamsPages,

    // user actions
    approveUser,
    rejectUser,
    deleteUser,
    editUser,

    // team actions
    createTeam,
    editTeam,
    deleteTeam,
    deleteTeamCascade,
    fetchTeams,

    // project actions
    openProject,
    editProject,
    deleteProject,
    addTaskToProject,
    createProject,
  };
}
