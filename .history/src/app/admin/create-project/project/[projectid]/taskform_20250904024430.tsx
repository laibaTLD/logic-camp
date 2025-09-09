"use client";

import { useState } from "react";

interface TaskFormProps {
  projectId: number;
  onTaskCreated: () => void;
}

export default function TaskForm({ projectId, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState<number | "">("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }
    
    setLoading(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
        assignedToId: assigneeIds.length === 0 && assignedToId ? assignedToId : undefined,
        priority,
        dueDate: dueDate || undefined,
      }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setAssignedToId("");
      setAssigneeIds([]);
      setPriority("medium");
      setDueDate("");
      onTaskCreated();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create task");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 space-y-2">
      <h2 className="font-bold text-lg">Add New Task</h2>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <input
        type="text"
        placeholder="Assignee IDs (comma-separated, e.g., 1,2,3)"
        value={assigneeIds.join(',')}
        onChange={e => {
          const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          setAssigneeIds(ids);
        }}
        className="border p-2 w-full rounded"
      />
      <input
        type="number"
        placeholder="Single Assignee ID (fallback)"
        value={assignedToId}
        onChange={e => setAssignedToId(Number(e.target.value))}
        className="border p-2 w-full rounded"
      />
      <select
        value={priority}
        onChange={e => setPriority(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
