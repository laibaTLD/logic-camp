"use client";

import React, { useMemo, useState } from "react";
import { updateTaskStatus } from "@/services/taskService";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  dueDate?: string | null;
  assignedTo?: { id: number; name: string } | null;
};

type GoalTasksModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  tasks: Task[];
  onTasksUpdated?: (tasks: Task[]) => void;
};

export default function GoalTasksModal({ isOpen, onClose, goalTitle, tasks, onTasksUpdated }: GoalTasksModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const taskOptions = useMemo(() => localTasks.map(t => ({ id: t.id, title: t.title })), [localTasks]);

  const handleChangeStatus = async (taskId: number, nextStatus: string) => {
    try {
      await updateTaskStatus(taskId, nextStatus);
      const updated = localTasks.map(t => t.id === taskId ? { ...t, status_title: nextStatus } : t);
      setLocalTasks(updated);
      onTasksUpdated?.(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to update task status");
    }
  };

  const getAuthHeaders = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') || localStorage.getItem('authToken') : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !comment.trim()) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("taskId", String(selectedTaskId));
      form.append("comment", comment.trim());
      if (file) form.append("files", file);

      const res = await fetch(`/api/task-comments`, {
        method: "POST",
        body: form,
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) throw new Error("Failed to add comment");
      // Optionally we could refresh comments per task; for now just reset form
      setComment("");
      setFile(null);
      setSelectedTaskId("");
      alert("Comment added successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-[#0e1116] text-white border border-white/10 shadow-2xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-semibold">Tasks for: {goalTitle}</div>
          <button onClick={onClose} className="text-gray-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/10">Close</button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <div className="text-sm font-semibold text-gray-300 mb-2">All Tasks</div>
            <div className="space-y-3">
              {localTasks.length === 0 && (
                <div className="text-gray-400 text-sm">No tasks for this goal.</div>
              )}
              {localTasks.map(task => (
                <div key={task.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <div className="font-medium text-white">{task.title}</div>
                    {task.description && <div className="text-sm text-gray-300">{task.description}</div>}
                    <div className="text-xs text-gray-400 mt-1 flex gap-3">
                      {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                      {task.assignedTo && <span>Assignee: {task.assignedTo.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={(task.status_title || task.status || 'todo') as string}
                      onChange={(e) => handleChangeStatus(task.id, e.target.value)}
                      className="bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-xs"
                    >
                      <option value="todo">To Do</option>
                      <option value="inProgress">Doing</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-sm font-semibold text-gray-300 mb-2">Add Comment</div>
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : "")}
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm md:col-span-1"
                >
                  <option value="">Select task</option>
                  {taskOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.title}</option>
                  ))}
                </select>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm md:col-span-2 min-h-[42px]"
                />
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm md:col-span-1"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !selectedTaskId || !comment.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-60 border border-indigo-500/30 text-white text-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
