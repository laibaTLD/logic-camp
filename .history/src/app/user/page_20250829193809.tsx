"use client";

import { useState } from "react";
import Header from "../admin/components/Header"; // Reuse header
import useUserData from "./hooks/useUserData";
import UserProjectDetailsModal from "./components/UserProjectDetailsModal";

export default function UserPanel() {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const {
    projects: Project[];
    loadingProjects: boolean,
    error: string | null | undefined,
  } = useUserData();

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header */}
      <Header>
        <div className="flex gap-3">
          {/* Notifications and Logout will be added later */}
        </div>
      </Header>

      <main className="px-6 md:px-10 py-8">
        <div className="flex flex-col gap-8 animate-fadeInUp">
          {/* Assigned Projects Panel */}
          <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                📂 Assigned Projects
              </h2>
            </div>
            {error ? (
              <div className="text-red-500">Error loading projects: {error}</div>
            ) : loadingProjects ? (
              <div>Loading projects...</div>
            ) : projects.length === 0 ? (
              <div>No projects assigned yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <UserProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}