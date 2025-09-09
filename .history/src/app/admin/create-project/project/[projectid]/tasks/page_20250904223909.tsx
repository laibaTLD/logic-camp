"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "lucide-react";

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: TaskAssignee;
  assignees?: TaskAssignee[];
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
      <div className="mb-6 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const displayAssignees = task.assignees || (task.assignedTo ? [task.assignedTo] : []);
            return (
              <div
                key={task.id}
                className="border border-white/10 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{task.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full">
                    {task.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  {displayAssignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex items-center gap-1">
                        {displayAssignees.slice(0, 3).map((assignee) => (
                          <div
                            key={assignee.id}
                            className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
                            title={assignee.name}
                          >
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {displayAssignees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-medium">
                            +{displayAssignees.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {displayAssignees.length === 1 
                          ? displayAssignees[0].name 
                          : `${displayAssignees.length} assignees`
                        }
                      </span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No tasks yet.</p>
        )}
      </div>

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
