"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import GoalGrid from "../../../components/GoalGrid";

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
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

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
    try {
      setDeletingGoalId(id);
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete goal');
      setGoals(prev => prev.filter(g => g.id !== id));
    } finally {
      setDeletingGoalId(null);
    }
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
        <GoalGrid 
          goals={goals}
          loadingGoals={loading}
          onEditGoal={setEditing}
          onDeleteGoal={deleteGoal}
          deletingGoalId={deletingGoalId}
        />
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


