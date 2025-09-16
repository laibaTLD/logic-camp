'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getGoalsByProject } from '@/services/goalService';
import { getTasksByGoal, createTask, updateTaskStatus } from '@/services/taskService';

type Member = { id: number; name: string; email?: string };

async function fetchTeamMembers(teamId: number): Promise<Member[]> {
  try {
    const res = await fetch(`/api/teams/${teamId}/members`, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.members || [];
  } catch {
    return [];
  }
}

interface ProjectGoalsNestedProps {
  projectId: number;
  teamId: number;
}

export default function ProjectGoalsNested({ projectId, teamId }: ProjectGoalsNestedProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [tasksByGoal, setTasksByGoal] = useState<Record<number, any[]>>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [formByGoal, setFormByGoal] = useState<Record<number, { title: string; description: string; dueDate: string; assignedToId: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [g, m] = await Promise.all([getGoalsByProject(projectId), fetchTeamMembers(teamId)]);
        setGoals(g);
        setMembers(m);
        const entries: Record<number, any[]> = {};
        for (const goal of g) {
          try {
            const t = await getTasksByGoal(goal.id);
            entries[goal.id] = (t.tasks ?? t) as any[];
          } catch {
            entries[goal.id] = [];
          }
        }
        setTasksByGoal(entries);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, teamId]);

  const handleCreateTask = async (goalId: number) => {
    const form = formByGoal[goalId] || { title: '', description: '', dueDate: '', assignedToId: '' };
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      description: form.description || '',
      completed: false,
      status: 'todo',
      goalId,
      dueDate: form.dueDate || undefined,
      assignedToId: form.assignedToId ? Number(form.assignedToId) : undefined,
    } as any;
    const created = await createTask(payload);
    const newTask = created?.task || created;
    setTasksByGoal((prev) => ({ ...prev, [goalId]: [...(prev[goalId] || []), newTask] }));
    setFormByGoal((prev) => ({ ...prev, [goalId]: { title: '', description: '', dueDate: '', assignedToId: '' } }));
  };

  const handleUpdateStatus = async (goalId: number, taskId: number, statusTitle: string) => {
    try {
      await updateTaskStatus(taskId, statusTitle);
      setTasksByGoal((prev) => ({
        ...prev,
        [goalId]: (prev[goalId] || []).map((t) => (t.id === taskId ? { ...t, status_title: statusTitle } : t)),
      }));
    } catch {}
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-gray-300">Loading goals and tasks...</div>
      )}
      {!loading && goals.length === 0 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 text-gray-300">No goals yet.</div>
      )}

      {goals.map((goal) => (
        <div key={goal.id} className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
              {goal.description && <p className="text-sm text-gray-300 mt-1">{goal.description}</p>}
              <div className="mt-2 text-xs text-gray-400 flex gap-4">
                {goal.deadline && <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200">{goal.status}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Tasks</h4>
            <div className="space-y-3">
              {(tasksByGoal[goal.id] || []).map((task) => (
                <div key={task.id} className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{task.title}</div>
                      {task.description && <div className="text-sm text-gray-300">{task.description}</div>}
                      <div className="text-xs text-gray-400 mt-1 flex gap-3">
                        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        <span>Status: {task.status_title || task.status}</span>
                        {task.assignedTo && <span>Assignee: {task.assignedTo.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={task.status_title || task.status}
                        onChange={(e) => handleUpdateStatus(goal.id, task.id, e.target.value)}
                        className="bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-xs"
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create task form */}
            <div className="mt-4 bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-200 font-medium mb-2">Create Task</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={formByGoal[goal.id]?.title || ''}
                  onChange={(e) => setFormByGoal((p) => ({ ...p, [goal.id]: { ...(p[goal.id] || { title: '', description: '', dueDate: '', assignedToId: '' }), title: e.target.value } }))}
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={formByGoal[goal.id]?.dueDate || ''}
                  onChange={(e) => setFormByGoal((p) => ({ ...p, [goal.id]: { ...(p[goal.id] || { title: '', description: '', dueDate: '', assignedToId: '' }), dueDate: e.target.value } }))}
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={formByGoal[goal.id]?.description || ''}
                  onChange={(e) => setFormByGoal((p) => ({ ...p, [goal.id]: { ...(p[goal.id] || { title: '', description: '', dueDate: '', assignedToId: '' }), description: e.target.value } }))}
                  className="md:col-span-2 bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm"
                />
                <select
                  value={formByGoal[goal.id]?.assignedToId || ''}
                  onChange={(e) => setFormByGoal((p) => ({ ...p, [goal.id]: { ...(p[goal.id] || { title: '', description: '', dueDate: '', assignedToId: '' }), assignedToId: e.target.value } }))}
                  className="bg-slate-800 text-white border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => handleCreateTask(goal.id)}
                  className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}





