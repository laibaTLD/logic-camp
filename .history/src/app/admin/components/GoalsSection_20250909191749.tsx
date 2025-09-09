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
                  <span className="px-2 py-1 rounded-full text-xs text-slate-200 border border-slate-500/50">
                    {goal.status}
                  </span>
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
    </div>
  );
}


