"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NewTeamModal from "./components/NewTeamModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import { Plus, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingTeamId(teamId);
    try {
      await deleteTeam(teamId);
      // Refresh teams list
      await fetchTeams(teamsPage);
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Failed to delete team. Please try again.');
    } finally {
      setDeletingTeamId(null);
    }
  };

  useEffect(() => {
    const verifyAdminAuth = async () => {
      try {
        // Check for admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          router.push('/admin/adminLogin');
          return;
        }

        // Verify token with API
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!verifyResponse.ok) {
          // Token is invalid, clear localStorage and redirect
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        const verifyData = await verifyResponse.json();
        // Check if token is valid
        if (!verifyData.valid) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth verification failed:', err);
        router.push('/admin/adminLogin');
      }
    };

    verifyAdminAuth();
  }, [router]);

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
    teamsPage,
    teamsPerPage,
    totalTeams,
    totalTeamsPages,
    fetchTeams,
    deleteTeam,
    openProject,
    createProject,
    createTeam, // ✅ make sure this exists in your hook
  } = useAdminData();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0b10] text-white">
        <div className="text-lg">Verifying authentication...</div>
      </div>
    );
  }

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

          {/* Teams Panel - Enhanced with Pagination */}
          <section className="flex-1 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Team Management
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {totalTeams > 0 ? `${totalTeams} total teams` : 'No teams yet'}
                    </p>
                  </div>
                </div>
                
                {/* Page indicator */}
                {totalTeamsPages > 1 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50">
                    <span className="text-xs text-slate-400">Page</span>
                    <span className="text-sm font-semibold text-white">{teamsPage}</span>
                    <span className="text-xs text-slate-400">of {totalTeamsPages}</span>
                  </div>
                )}
              </div>

              {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-600"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 absolute top-0 left-0"></div>
                  </div>
                  <span className="mt-4 text-slate-400 font-medium">Loading teams...</span>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No teams found</h3>
                  <p className="text-slate-400 mb-4">Create your first team to get started!</p>
                </div>
              ) : (
                <>
                  {/* Teams Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {teams.map((team, index) => (
                      <div
                        key={team.id}
                        className="group relative rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(147,51,234,0.15)] hover:-translate-y-1"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        {/* Team card gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-white mb-2 text-lg group-hover:text-purple-300 transition-colors">
                                {team.name}
                              </h3>
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              disabled={deletingTeamId === team.id}
                              className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                              title="Delete Team"
                            >
                              {deletingTeamId === team.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4 group-hover/delete:scale-110 transition-transform" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-300">
                                {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          
                          {/* Member avatars/tags */}
                          {team.members && team.members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {team.members.slice(0, 3).map((member) => (
                                <span
                                  key={member.id}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-xs font-medium text-slate-200 border border-slate-500/50"
                                >
                                  {member.name}
                                </span>
                              ))}
                              {team.members.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-xs font-medium text-purple-300 border border-purple-500/30">
                                  +{team.members.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          <button
                            onClick={() => router.push(`/admin/edit-team/${team.id}`)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-600/50 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600/50 hover:to-cyan-600/50 hover:border-purple-500/50 transition-all duration-300 group-hover:shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Team
                          </button>
                        </div>
                      </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalTeamsPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Showing</span>
                        <span className="font-semibold text-white">
                          {((teamsPage - 1) * teamsPerPage) + 1}-{Math.min(teamsPage * teamsPerPage, totalTeams)}
                        </span>
                        <span>of</span>
                        <span className="font-semibold text-white">{totalTeams}</span>
                        <span>teams</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Previous button */}
                        <button
                          onClick={() => fetchTeams(teamsPage - 1)}
                          disabled={teamsPage <= 1}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalTeamsPages) }, (_, i) => {
                            let pageNum;
                            if (totalTeamsPages <= 5) {
                              pageNum = i + 1;
                            } else if (teamsPage <= 3) {
                              pageNum = i + 1;
                            } else if (teamsPage >= totalTeamsPages - 2) {
                              pageNum = totalTeamsPages - 4 + i;
                            } else {
                              pageNum = teamsPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => fetchTeams(pageNum)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                  pageNum === teamsPage
                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border border-purple-500/50 shadow-lg'
                                    : 'border border-slate-600/50 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Next button */}
                        <button
                          onClick={() => fetchTeams(teamsPage + 1)}
                          disabled={teamsPage >= totalTeamsPages}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
                        >
                          Next
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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
