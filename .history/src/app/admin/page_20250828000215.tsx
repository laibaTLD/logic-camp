"use client";

import { useState } from "react";
import NewProjectModal from "./components/NewProjectModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import { Plus } from "lucide-react";

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  } = useAdminData();

  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      {/* Header with New Project button */}
      <Header>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10 transition-all"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
          New Project
        </button>
      </Header>

      <main className="relative z-10 px-6 md:px-10 py-8">
        <div className="flex flex-col gap-8 animate-fadeInUp">
          {/* Users Panel */}
          <section className="flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                👥 Manage Users
              </h2>
            </div>
            <UserTable
              users={users}
              loadingUsers={loadingUsers}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              editUser={editUser}
            />
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
              <ProjectsGrid
                projects={projects}
                openProject={openProject}
                loadingProjects={loadingProjects}
              />
            )}
          </section>
        </div>
      </main>

      {/* New Project Modal */}
      <NewProjectModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  users={users}
  onSubmit={async (data) => {
    try {
      // Use the createProject function from the hook
      await createProject({
        name: data.name,
        description: data.description,
        teamId: data.members[0] || undefined, // optional: first selected member as team
        members: data.members, // backend can handle members later
      });

      // Close modal and reset
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    }
  }}
/>

      />
    </div>
  );
}
