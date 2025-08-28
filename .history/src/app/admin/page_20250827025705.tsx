"use client";
import NewProjectModal from "./components/NewProjectModal";
import Header from "./components/Header";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";

export default function AdminDashboard() {
  return (
    <div className="relative min-h-screen bg-[#0b0b10] text-white overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600/60 to-purple-600/60" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-fuchsia-500/50 to-cyan-500/50" />

      <Header />

      <main className="relative z-10 px-6 md:px-10 py-8">
        <div
          className="flex flex-col lg:flex-row gap-8 animate-fadeInUp"
        >
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
            <ProjectsGrid />
          </section>
        </div>
      </main>
    </div>
  );
}
