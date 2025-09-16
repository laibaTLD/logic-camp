interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  createdById: number;
  teamId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Regular project endpoints (for non-admin users)
const API_URL = "/api/projects";
// Admin-specific endpoints
const ADMIN_API_URL = "/api/admin/projects";

export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export const getProjectById = async (id: number): Promise<Project> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
};

export const updateProjectStatus = async (id: number, statusTitle: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statusTitle }),
  });
  if (!res.ok) throw new Error("Failed to update project status");
  return res.json();
};

// Regular project creation (for non-admin users)
export const createProject = async (project: Omit<Project, "id">) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
};

// Admin-specific project creation with team
export const createProjectWithTeam = async (
  project: {
    name: string;
    description: string;
    teamId: number;
    status?: string;
    priority?: string;
  },
  token: string
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create project with team");
  }
  return res.json();
};
