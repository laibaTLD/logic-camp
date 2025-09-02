"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NewTeamModal from "./components/NewTeamModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import { Plus } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
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
    teams,
    loadingTeams,
    openProject,
    createProject,
    createTeam, // ✅ make sure this exists in your hook
  } = useAdminData();

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
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
            onClick={() => router.push('/admin/create-project')}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10 transition-all"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Project
          </button>
        </div>
      </Header>

      <main className=" px-6 md:px-10 py-8">
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

          {/* Teams Panel */}
          <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                👥 Manage Teams
              </h2>
            </div>
            {loadingTeams ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                <span className="ml-3 text-white/60">Loading teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>No teams found. Create your first team!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="group relative rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{team.name}</h3>
                        <p className="text-sm text-white/60 mb-3">
                          {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}
                        </p>
                        {team.members && team.members.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {team.members.slice(0, 3).map((member) => (
                              <span
                                key={member.id}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-white/10 text-xs text-white/80"
                              >
                                {member.name}
                              </span>
                            ))}
                            {team.members.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/10 text-xs text-white/60">
                                +{team.members.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/edit-team/${team.id}`)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-all"
                    >
                      Edit Team
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Projects Panel */}
          <section className="static flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          
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


    </div>
  );
}
