import { Project } from '@/types';

// Regular project endpoints (for non-admin users)
const API_URL = "/api/projects";
// Admin-specific endpoints
const ADMIN_API_URL = "/api/admin/projects";

// Build absolute base URL for server-side fetches
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return ""; // relative OK in the browser
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
};

const buildUrl = (path: string) => `${getBaseUrl()}${path}`;

export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(buildUrl(API_URL), { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export const getProjectById = async (id: number): Promise<Project> => {
  const res = await fetch(buildUrl(`${API_URL}/${id}`), { credentials: 'include', cache: 'no-store' });
  if (!res.ok) {
    let errMsg = "Failed to fetch project";
    try {
      const data = await res.json();
      if (data?.error) errMsg = data.error;
    } catch {}
    throw new Error(errMsg);
  }
  const data = await res.json();
  return data.project; // Extract the project from the response
};

export const updateProjectStatus = async (id: number, statusTitle: string) => {
  const res = await fetch(buildUrl(`${API_URL}/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statusTitle }),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to update project status");
  return res.json();
};

// Update any project fields (admin or team lead as allowed by API)
export const updateProject = async (
  id: number,
  updates: Partial<{
    name: string;
    description: string;
    statusTitle: string;
    startDate: string;
    endDate: string;
    teamId: number;
  }>
) => {
  const res = await fetch(buildUrl(`${API_URL}/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
};

export type { Project };

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
    statusTitle?: string;
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
