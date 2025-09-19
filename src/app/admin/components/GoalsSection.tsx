"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import GoalCard from "./GoalCard";
import { Goal } from "@/types";

interface GoalsSectionProps {
  onCreate: () => void;
}

export default function GoalsSection({ onCreate }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        statusTitle: updates.status_title,
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

  // Filter goals based on search query
  const filteredGoals = goals.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (goal.project_id && goal.project_id.toString().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Goal Management</h1>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-600/50 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-3 sm:p-4 lg:p-6 backdrop-blur-xl overflow-hidden">
        {/* Header with goal count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-400">
              {goals.length > 0 ? `${filteredGoals.length} ${searchQuery ? 'filtered' : 'total'} goals` : 'No goals yet'}
            </p>
          </div>
        </div>

        {/* Goal grid */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-4 lg:gap-5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={`s-${i}`}
                className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))
          ) : filteredGoals.length === 0 ? (
            <div className="text-center col-span-full mt-4">
              {searchQuery ? (
                <div>
                  <p className="text-gray-400 mb-2">
                    No goals match your search for "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <p className="text-gray-400">
                  No goals found. Create your first goal to get started!
                </p>
              )}
            </div>
          ) : (
            filteredGoals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={idx}
                onEditGoal={setEditing}
                onDeleteGoal={deleteGoal}
                deletingGoalId={deletingGoalId}
              />
            ))
          )}
        </div>
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
                  <select value={editing.status_title || 'todo'} onChange={e=>setEditing({ ...editing, status_title: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2">
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Deadline</label>
                  <input type="date" value={editing.deadline ? new Date(editing.deadline).toISOString().split('T')[0] : ''} onChange={e=>setEditing({ ...editing, deadline: new Date(e.target.value) })} className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 text-white px-4 py-2" />
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


