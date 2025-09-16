"use client";

import { useState, useEffect } from "react";
import AdminGoalDetails from "./AdminGoalDetails";

interface GoalDetailsLoaderProps {
  goalId: number;
}

export default function GoalDetailsLoader({ goalId }: GoalDetailsLoaderProps) {
  const [goal, setGoal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [goalRes, tasksRes] = await Promise.all([
          fetch(`/api/goals/${goalId}`),
          fetch(`/api/tasks?goalId=${goalId}`)
        ]);

        if (!goalRes.ok) {
          throw new Error('Failed to fetch goal');
        }

        const [goalData, tasksData] = await Promise.all([
          goalRes.json(),
          tasksRes.ok ? tasksRes.json() : Promise.resolve({ tasks: [] })
        ]);

        setGoal(goalData.goal || goalData);
        setTasks(Array.isArray(tasksData) ? tasksData : (tasksData?.tasks || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goal');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [goalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Goal</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.571M15 6.343A7.962 7.962 0 0112 5c-2.34 0-4.29 1.009-5.824 2.571" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Goal Not Found</h2>
          <p className="text-gray-400 mb-4">The goal you're looking for doesn't exist or has been deleted.</p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      {/* Page header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-400 mb-3" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-2">
              <li className="hover:text-gray-200 transition-colors"><a href="/admin">Admin</a></li>
              <li className="opacity-50">/</li>
              <li className="hover:text-gray-200 transition-colors"><a href="/admin">Goals</a></li>
              <li className="opacity-50">/</li>
              <li className="text-gray-200 truncate max-w-[40ch]" title={goal?.title}>{goal?.title}</li>
            </ol>
          </nav>

          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{goal?.title}</h1>
              <p className="text-gray-400 mt-1 truncate max-w-3xl">{goal?.description || 'No description provided.'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-sm capitalize">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/80" />
                {goal?.status_title || goal?.status || 'todo'}
              </span>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400">Project</div>
              <div className="text-white mt-1">{goal?.project?.name || 'No Project'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400">Deadline</div>
              <div className="text-white mt-1">{goal?.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Not set'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400">Tasks</div>
              <div className="text-white mt-1">{tasks.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400">Created</div>
              <div className="text-white mt-1">{goal?.createdAt ? new Date(goal.createdAt).toLocaleDateString() : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <AdminGoalDetails goal={goal} initialTasks={tasks} />
        </div>
      </div>
    </div>
  );
}
