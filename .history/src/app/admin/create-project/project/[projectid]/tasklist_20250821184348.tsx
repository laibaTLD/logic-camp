"use client";

import { useEffect, useState } from "react";
import TaskCard from "./../../../../components/TaskCard";

// Map backend status to TaskCard status
const mapStatus = (status: string): "Pending" | "In Progress" | "Completed" => {
  switch (status) {
    case "todo":
    case "review":
      return "Pending";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "Pending";
  }
};

interface Task {
  id: number;
  title: string;
  description?: string;
  assignedTo?: { name: string; email: string };
  status: string;
  priority: string;
  dueDate?: string;
  progress: number;
}

interface TaskListProps {
  projectId: number;
}

export default function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return (
    <div>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found for this project.</p>
      ) : (
        tasks.map(task => (
          <TaskCard
            key={task.id}
            title={task.title}
            status={mapStatus(task.status)}
            dueDate={task.dueDate}
          />
        ))
      )}
    </div>
  );
}
