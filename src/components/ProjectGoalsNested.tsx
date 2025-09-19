'use client';

import React, { useEffect, useState } from 'react';
import { getGoalsByProject } from '@/services/goalService';
import { getTasksByGoal } from '@/services/taskService';
import GoalVerticalCard from '@/components/GoalVerticalCard';
import GoalTasksModal from '@/components/GoalTasksModal';

interface ProjectGoalsNestedProps {
  projectId: number;
  teamId: number;
}

export default function ProjectGoalsNested({ projectId, teamId }: ProjectGoalsNestedProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [tasksByGoal, setTasksByGoal] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGoalId, setModalGoalId] = useState<number | null>(null);
  const [modalGoalTitle, setModalGoalTitle] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const g = await getGoalsByProject(projectId);
        const goalsArr: any[] = Array.isArray(g) ? g : (Array.isArray((g as any)?.goals) ? (g as any).goals : []);
        setGoals(goalsArr);
        const entries: Record<number, any[]> = {};
        for (const goal of goalsArr) {
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

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-gray-300">Loading goals and tasks...</div>
      )}
      {!loading && goals.length === 0 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 text-gray-300">No goals yet.</div>
      )}

      {/* Goals Overview Cards */}
      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const tasks = tasksByGoal[goal.id] || [];
            const normalize = (s: any) => String(s || '').toLowerCase();
            const counts = {
              total: tasks.length,
              todo: tasks.filter((t) => {
                const s = normalize(t.status_title || t.status);
                return s === 'todo' || s === 'backlog' || s === 'pending';
              }).length,
              inProgress: tasks.filter((t) => {
                const s = normalize(t.status_title || t.status);
                return s === 'inprogress' || s === 'in-progress' || s === 'doing' || s === 'progress';
              }).length,
              testing: tasks.filter((t) => normalize(t.status_title || t.status) === 'testing').length,
              completed: tasks.filter((t) => {
                const s = normalize(t.status_title || t.status);
                return s === 'done' || s === 'completed' || s === 'complete' || s === 'finished';
              }).length,
            };
            return (
              <GoalVerticalCard
                key={`goal-card-${goal.id}`}
                goal={{ id: goal.id, title: goal.title, description: goal.description, deadline: (goal as any).deadline, status: (goal as any).status_title || (goal as any).status }}
                counts={counts}
              >
                {/* Inline task list (click to open modal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tasks.length === 0 && (
                    <div className="text-sm text-gray-400">No tasks yet.</div>
                  )}
                  {tasks.slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setModalGoalId(goal.id);
                        setModalGoalTitle(goal.title);
                        setModalOpen(true);
                      }}
                      className="w-full text-left rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)] hover:ring-1 hover:ring-white/10"
                      title="View tasks"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm text-gray-200">{task.title}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-gray-300">
                          {task.status_title || task.status || 'todo'}
                        </span>
                      </div>
                    </button>
                  ))}
                  {tasks.length > 6 && (
                    <button
                      onClick={() => {
                        setModalGoalId(goal.id);
                        setModalGoalTitle(goal.title);
                        setModalOpen(true);
                      }}
                      className="text-xs text-indigo-300 hover:text-indigo-200"
                    >
                      View all {tasks.length} tasks
                    </button>
                  )}
                </div>
              </GoalVerticalCard>
            );
          })}
        </div>
      )}

      {/* Modal with all tasks under the selected goal */}
      <GoalTasksModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        goalTitle={modalGoalTitle}
        tasks={modalGoalId ? (tasksByGoal[modalGoalId] || []) : []}
        onTasksUpdated={(updated) => {
          if (modalGoalId) setTasksByGoal((prev) => ({ ...prev, [modalGoalId]: updated }));
        }}
      />
    </div>
  );
}


