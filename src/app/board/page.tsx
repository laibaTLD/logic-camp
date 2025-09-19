"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getGoalsByProject } from "@/services/goalService";
import { getTasksByGoal, updateTaskStatus } from "@/services/taskService";

type SimpleProject = { id: number; name: string };

type SimpleGoal = { id: number; title: string };

type SimpleTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  dueDate?: string | null;
};

const STATUS_KEYS = ["todo", "inProgress", "testing", "completed"] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  todo: "To Do",
  inProgress: "Doing",
  testing: "Testing",
  completed: "Done",
};

export default function BoardPage() {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [goals, setGoals] = useState<SimpleGoal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [selectedGoalId, setSelectedGoalId] = useState<number | "">("");
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      setError(null);
      try {
        const list = await getProjects();
        const mapped = list.map((p: any) => ({ id: Number(p.id), name: p.name })) as SimpleProject[];
        setProjects(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load projects");
      }
    };
    loadProjects();
  }, []);

  // Load goals when project selected
  useEffect(() => {
    const loadGoals = async () => {
      setGoals([]);
      setSelectedGoalId("");
      setTasks([]);
      if (!selectedProjectId) return;
      setError(null);
      try {
        const g = await getGoalsByProject(Number(selectedProjectId));
        const arr = Array.isArray(g) ? g : (Array.isArray((g as any)?.goals) ? (g as any).goals : []);
        const mapped = arr.map((it: any) => ({ id: Number(it.id), title: it.title })) as SimpleGoal[];
        setGoals(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load goals");
      }
    };
    loadGoals();
  }, [selectedProjectId]);

  // Load tasks when goal selected
  useEffect(() => {
    const loadTasks = async () => {
      setTasks([]);
      if (!selectedGoalId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getTasksByGoal(Number(selectedGoalId));
        const t = (res as any)?.tasks ?? res;
        setTasks(Array.isArray(t) ? t : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [selectedGoalId]);

  const normalizeStatus = (s?: string | null) => String(s || "todo").toLowerCase();

  const columns = useMemo(() => {
    const map: Record<(typeof STATUS_KEYS)[number], SimpleTask[]> = {
      todo: [],
      inProgress: [],
      testing: [],
      completed: [],
    };
    for (const task of tasks) {
      const s = normalizeStatus(task.status_title || task.status);
      if (s === "in-progress" || s === "inprogress" || s === "doing" || s === "progress") map.inProgress.push(task);
      else if (s === "testing") map.testing.push(task);
      else if (s === "done" || s === "completed" || s === "complete" || s === "finished") map.completed.push(task);
      else map.todo.push(task);
    }
    return map;
  }, [tasks]);

  const handleStatusChange = async (task: SimpleTask, next: (typeof STATUS_KEYS)[number]) => {
    try {
      await updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status_title: next } : t)));
    } catch (e) {
      alert("Failed to update task status");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">Board</h1>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-[#0e1116]/80 backdrop-blur p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
            className="bg-slate-900 text-white border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {selectedProjectId && (
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : "")}
              className="bg-slate-900 text-white border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select Goal</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Board */}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {loading && <div className="text-gray-300">Loading tasks...</div>}

      {selectedGoalId && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUS_KEYS.map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-[#0e1116]/70 backdrop-blur p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-200">{STATUS_LABELS[key]}</div>
                <div className="text-xs text-gray-400">{columns[key].length}</div>
              </div>
              <div className="space-y-2">
                {columns[key].map((task) => (
                  <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
                    <div className="text-sm font-medium text-white truncate">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-300 line-clamp-2">{task.description}</div>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-gray-400">
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <select
                        defaultValue={(task.status_title || task.status || 'todo') as string}
                        onChange={(e) => handleStatusChange(task, e.target.value as (typeof STATUS_KEYS)[number])}
                        className="bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-[11px]"
                        title="Update status"
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">Doing</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
                {columns[key].length === 0 && (
                  <div className="text-xs text-gray-500">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedGoalId && (
        <div className="text-gray-400">Please select a project and goal to view the board.</div>
      )}
    </div>
  );
}
