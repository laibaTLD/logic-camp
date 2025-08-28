interface Project {
  id: number;
  name: string;
  description: string;
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

// Admin-specific project creation with team (atomic operation)
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
  const res = await fetch(`${ADMIN_API_URL}/create`, {
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
