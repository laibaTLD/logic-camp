interface Task {
  id: number;
  title: string;
  completed: boolean;
  projectId: number;
}

const API_URL = "/api/tasks";

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  const res = await fetch(`${API_URL}?projectId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const createTask = async (task: Omit<Task, "id">) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};
