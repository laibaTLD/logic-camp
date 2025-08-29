"use client";

import { useState } from "react";
import NewProjectModal from "./components/NewProjectModal";
import NewTeamModal from "./components/NewTeamModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import { Plus } from "lucide-react";

export default function AdminDashboard() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const {
    users,
    loadingUsers,
    approveUser,
    rejectUser,
    deleteUser,
    editUser,
    projects,
    loadingProjects,
    openProject,
    createProject,
    createTeam, // ✅ make sure this exists in your hook
  } = useAdminData();

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header with New Project + New Team buttons */}
      <Header>
        <div className="flex gap-3">
          {/* ✅ New Team Button */}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10 transition-all"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Team
          </button>

          {/* ✅ New Project Button */}
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10 transition-all"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Project
          </button>
        </div>
      </Header>

      <main className=" z-10 px-6 md:px-10 py-8">
        <div className="flex flex-col gap-8 animate-fadeInUp">
          {/* Users Panel */}
          <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                👥 Manage Users
              </h2>
            </div>
            <UserTable />
          </section>

          {/* Projects Panel */}
          <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                📂 Active Projects
              </h2>
            </div>
            {loadingProjects ? (
              <div>Loading projects...</div>
            ) : (
              <ProjectsGrid />
            )}
          </section>
        </div>
      </main>

      {/* ✅ New Team Modal */}
      <NewTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        users={users}
      />

      {/* ✅ New Project Modal */}
      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
