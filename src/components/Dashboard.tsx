'use client';
import React from 'react';
import Header from '@/components/Header';
import ProjectsSection from '@/components/ProjectsSection';
import TasksSection from '@/components/TasksSection';
import TaskComments from '@/components/TaskComments';
import { useEffect, useState } from 'react';
import { getProjects } from '@/services/projectService';
import { getGoalsByProject } from '@/services/goalService';
import { getTasksByGoal } from '@/services/taskService';

import { UserAttributes } from '@/models/User';
import { ProjectAttributes } from '@/models/Project';

type ExtendedUser = UserAttributes & {
  projects?: ProjectAttributes[];
};

type DashboardProps = {
  userData: ExtendedUser;
};

export default function Dashboard({ userData }: DashboardProps) {
  const [projects, setProjects] = useState<any[]>(userData.projects || []);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // If userData had no projects, fetch
        if (!projects || projects.length === 0) {
          const p = await getProjects();
          setProjects(p);
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const loadGoalsAndTasks = async () => {
      if (!selectedProjectId) return;
      try {
        const g = await getGoalsByProject(selectedProjectId);
        setGoals(g);
        // Flatten tasks for all goals
        const allTasks: any[] = [];
        for (const goal of g) {
          try {
            const t = await getTasksByGoal(goal.id);
            // API returns { tasks }, normalize
            const normalized = (t.tasks ?? t) as any[];
            allTasks.push(...normalized);
          } catch {}
        }
        setTasks(allTasks);
      } catch {}
    };
    loadGoalsAndTasks();
  }, [selectedProjectId]);

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      <Header />
      <main className="px-6 md:px-10 py-8">
        <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              📂 My Projects
            </h2>
          </div>
          <div onClick={() => {}}>
            <ProjectsSection projects={projects} />
          </div>
          {/* Simple selector for demo: pick first project automatically */}
          {!selectedProjectId && projects.length > 0 && (
            <div className="mt-4">
              <button onClick={() => setSelectedProjectId(projects[0].id)} className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg">
                View {projects[0].name} details
              </button>
            </div>
          )}
        </section>

        {selectedProjectId && (
          <section className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tasks</h3>
              <TasksSection tasks={tasks as any} />
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Task Comments (first task)</h3>
              {tasks.length > 0 ? (
                <TaskComments taskId={tasks[0].id} />
              ) : (
                <div className="text-sm text-gray-300">No tasks yet.</div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}