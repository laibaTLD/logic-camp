import { Status, Task } from '@/types';

const API_URL = "/api/tasks";

export const getTasksByGoal = async (goalId: number): Promise<{ tasks: Task[] }> => {
  const res = await fetch(`${API_URL}?goalId=${goalId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const updateTaskStatus = async (taskId: number, statusTitle: string) => {
  const res = await fetch(`${API_URL}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId, statusTitle }),
  });
  if (!res.ok) throw new Error("Failed to update task status");
  return res.json();
};

export const updateTaskTime = async (taskId: number, expectedTime?: number, spentTime?: number) => {
  const res = await fetch(`${API_URL}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      id: taskId, 
      expectedTime, 
      spentTime 
    }),
  });
  if (!res.ok) throw new Error("Failed to update task time");
  return res.json();
};

export const updateTask = async (taskId: number, updates: Partial<Task>) => {
  const res = await fetch(`${API_URL}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      id: taskId, 
      ...updates 
    }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (taskId: number) => {
  const res = await fetch(`${API_URL}?id=${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
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

export type { Task, Status };
