interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed';
  project_id: number;
  deadline?: Date;
  tasks?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

const API_URL = "/api/goals";

export const getGoalsByProjectId = async (projectId: number): Promise<Goal[]> => {
  const res = await fetch(`${API_URL}?projectId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
};

export const getGoalById = async (goalId: number): Promise<Goal> => {
  const res = await fetch(`${API_URL}/${goalId}`);
  if (!res.ok) throw new Error("Failed to fetch goal");
  return res.json();
};

export const updateGoalStatus = async (goalId: number, status: string) => {
  const res = await fetch(`${API_URL}/${goalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update goal status");
  return res.json();
};

export const createGoal = async (goal: Omit<Goal, "id">) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
};