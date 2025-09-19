"use client";

import React from "react";

export type Goal = {
  id: number;
  title: string;
  description?: string | null;
  deadline?: string | null;
  status?: string | null;
};

export type TaskCounts = {
  total: number;
  todo: number;
  inProgress: number;
  testing: number;
  completed: number;
};

type GoalVerticalCardProps = {
  goal: Goal;
  counts: TaskCounts;
  children?: React.ReactNode;
};

export default function GoalVerticalCard({ goal, counts, children }: GoalVerticalCardProps) {
  const status = (goal.status || "todo").toLowerCase();
  const badgeClass = (() => {
    switch (status) {
      case "todo":
        return "text-blue-400 bg-blue-400/10";
      case "inprogress":
      case "in-progress":
      case "doing":
        return "text-green-400 bg-green-400/10";
      case "testing":
        return "text-yellow-400 bg-yellow-400/10";
      case "review":
        return "text-purple-400 bg-purple-400/10";
      case "done":
      case "completed":
        return "text-emerald-400 bg-emerald-400/10";
      default:
        return "text-gray-300 bg-white/10";
    }
  })();

  return (
    <div
      className="relative text-left w-full rounded-2xl border border-white/10 bg-[#0c0f15]/70 backdrop-blur-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition-all duration-300 hover:shadow-[0_14px_40px_rgba(0,0,0,0.45)] hover:ring-white/10 animate-fadeIn"
    >
      <div
        className={`absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 select-none ${badgeClass}`}
      >
        {(goal.status || "todo")}
      </div>

      <h3 className="text-base font-semibold text-white pr-28 truncate tracking-tight">{goal.title}</h3>
      {goal.description && (
        <p className="mt-1 text-[13px] text-gray-300/90 leading-5 line-clamp-2">{goal.description}</p>
      )}

      <div className="mt-2.5 text-[11px] text-gray-400 flex gap-3">
        {goal.deadline && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            Due: {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Slim segmented progress rail */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
          {(() => {
            const total = Math.max(0, counts.total);
            const toPct = (n: number) => (total > 0 ? Math.max(0, (n / total) * 100) : 0);
            const segments = [
              { key: 'todo', val: counts.todo, className: 'bg-blue-500/70' },
              { key: 'inProgress', val: counts.inProgress, className: 'bg-green-500/70' },
              { key: 'testing', val: counts.testing, className: 'bg-amber-500/80' },
              { key: 'completed', val: counts.completed, className: 'bg-emerald-500/80' },
            ];
            const hasData = total > 0;
            if (!hasData) {
              return <div className="h-full w-0" aria-hidden />;
            }
            return (
              <div className="flex h-full w-full">
                {segments.map((s) => (
                  <div
                    key={s.key}
                    className={`${s.className} h-full`}
                    style={{ width: `${toPct(s.val)}%` }}
                    aria-label={`${s.key}: ${s.val}`}
                  />
                ))}
              </div>
            );
          })()}
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500/70"/>To Do</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500/70"/>Doing</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500/80"/>Testing</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500/80"/>Done</span>
          <span className="ml-auto text-gray-500">{counts.completed}/{counts.total} done</span>
        </div>
      </div>

      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}
