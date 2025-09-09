interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completed: boolean;
  goalId: number;
  assignedTo?: TaskAssignee;
  assignees?: TaskAssignee[];
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "/api/tasks";

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  const res = await fetch(`${API_URL}?projectId=${projectId}`);
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
