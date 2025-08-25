"use client";
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function ProjectTasksPage() {
  const { id } = useParams(); // project id from route
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  // ✅ Fetch tasks for this project
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`/api/projects/${id}/tasks`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTasks();
  }, [id]);

  // ✅ Add new task
  const handleAddTask = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) throw new Error("Failed to add task");
      const createdTask = await res.json();
      setTasks((prev) => [...prev, createdTask]);
      setNewTask({ title: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">Loading tasks...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks for Project {id}</h1>

      {/* Add Task Form */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Add one above!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-3 border rounded bg-gray-50 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                {task.status || "Pending"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
