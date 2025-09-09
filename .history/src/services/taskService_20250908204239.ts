interface Task {
  id: number;
  title: string;
  completed: boolean;
  goalId: number;
}

const API_URL = "/api/tasks";

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  const res = await fetch(`${API_URL}?goalId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const getTasksByGoal = async (goalId: number): Promise<Task[]> => {
  const res = await fetch(`${API_URL}?goalId=${goalId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const updateTaskStatus = async (taskId: number, status: string) => {
  const res = await fetch(`${API_URL}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update task status");
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
