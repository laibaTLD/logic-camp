"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed';
  project_id: number;
  deadline?: string;
}

interface GoalsSectionProps {
  onCreate: () => void;
}

export default function GoalsSection({ onCreate }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Goal | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch('/api/goals');
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : data.goals || []);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const updateGoal = async (id: number, updates: Partial<Goal>) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        deadline: updates.deadline,
      })
    });
    if (!res.ok) throw new Error('Failed to update goal');
    const data = await res.json();
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data.goal } : g));
  };

  const deleteGoal = async (id: number) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete goal');
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Goals</h2>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
        {loading ? (
          <div className="text-slate-300">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-slate-400">No goals found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{goal.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs text-slate-200 border border-slate-500/50">
                      {goal.status}
                    </span>
                    <button className="text-slate-300 hover:text-white text-xs underline" onClick={() => setEditing(goal)}>Edit</button>
                    <button className="text-red-400 hover:text-red-300 text-xs underline" onClick={() => deleteGoal(goal.id)}>Delete</button>
                  </div>
                </div>
                {goal.description && (
                  <p className="text-sm text-slate-300 mb-2">{goal.description}</p>
                )}
                {goal.deadline && (
                  <div className="text-xs text-slate-400">Due: {new Date(goal.deadline).toLocaleDateString()}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">Edit Goal</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              await updateGoal(editing.id, editing);
              setEditing(null);
            }}>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Title</label>
                <input value={editing.title} onChange={e=>setEditing({ ...editing, title: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={e=>setEditing({ ...editing, description: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Status</label>
                  <select value={editing.status} onChange={e=>setEditing({ ...editing, status: e.target.value as any })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2">
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Deadline</label>
                  <input type="date" value={editing.deadline || ''} onChange={e=>setEditing({ ...editing, deadline: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-xl border border-slate-600/50 text-slate-300" onClick={()=>setEditing(null)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


