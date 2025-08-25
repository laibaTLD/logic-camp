"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
}

export default function ProjectTasksPage() {
  const { id } = useParams(); // 👈 project id from URL
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/projects/${id}/tasks`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    if (id) fetchTasks();
  }, [id]);

  // ✅ Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]); // update list
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tasks for Project {id}</h1>

      {/* ✅ Task List */}
      <ul className="mb-6 space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task.id}
              className="border p-3 rounded shadow-sm flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <span className="text-xs text-blue-600">{task.status}</span>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No tasks yet.</p>
        )}
      </ul>

      {/* ✅ Add Task Form */}
      <form onSubmit={handleCreateTask} className="space-y-3">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
