interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  status?: 'todo' | 'inProgress' | 'testing' | 'completed';
  goalId: number; // Tasks are strictly tied to goals, not directly to projects
  dueDate?: string;
}

const API_URL = "/api/tasks";

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
