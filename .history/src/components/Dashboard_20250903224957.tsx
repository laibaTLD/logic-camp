'use client';
import React from 'react';
import Header from '@/components/Header';
import ProjectsSection from '@/components/ProjectsSection';

import { UserAttributes } from '@/models/User';
import { ProjectAttributes } from '@/models/Project';

type ExtendedUser = UserAttributes & {
  projects?: ProjectAttributes[];
};

type DashboardProps = {
  userData: ExtendedUser;
};

export default function Dashboard({ userData }: DashboardProps) {
  
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
          <ProjectsSection projects={userData.projects || []} />
        </section>
      </main>
    </div>
  );
}