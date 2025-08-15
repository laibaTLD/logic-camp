interface Project {
  id: number;
  name: string;
  description: string;
}

const API_URL = "/api/projects";

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

export const createProject = async (project: Omit<Project, "id">) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
};
