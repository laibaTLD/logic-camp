"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NewTeamModal from "./components/NewTeamModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import AdminSidebar from "./components/AdminSidebar";
import DashboardOverview from "./components/DashboardOverview";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import TeamDeleteConfirmationModal from "../../components/TeamDeleteConfirmationModal";
import { Plus, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: number; name: string } | null>(null);

  const handleDeleteTeam = (teamId: number, teamName: string) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteTeam = async (cascade: boolean = false) => {
    if (!teamToDelete) return;
    
    setDeletingTeamId(teamToDelete.id);
    try {
      if (cascade) {
        await deleteTeamCascade(teamToDelete.id);
      } else {
        await deleteTeam(teamToDelete.id);
      }
      // Refresh teams list
      await fetchTeams(teamsPage);
    } catch (error) {
      console.error('Failed to delete team:', error);
      // Show specific error message from API
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDeletingTeamId(null);
      setDeleteModalOpen(false);
      setTeamToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardOverview
            users={users}
            teams={teams}
            projects={projects}
            tasks={tasks}
            loadingUsers={loadingUsers}
            loadingTeams={loadingTeams}
            loadingProjects={loadingProjects}
            loadingTasks={loadingTasks}
          />
        );
      case 'users':
      case 'approve-users':
      case 'block-users':
      case 'assign-roles':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <div className="text-sm text-slate-400">
                {users.length} total users
              </div>
            </div>
            <UserTable
              users={users}
              loadingUsers={loadingUsers}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              editUser={editUser}
            />
          </div>
        );
      case 'teams':
      case 'create-team':
      case 'manage-teams':
      case 'assign-leads':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Team Management</h1>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Team
              </button>
            </div>
            
            {loadingTeams ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading teams...</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-700/60 border border-slate-600/50 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-purple-500/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{team.name}</h3>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-slate-300">
                              {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setTeamToDelete({ id: team.id, name: team.name });
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
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
                  ))}
                </div>

                {totalTeams > 0 && (
                   <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-700/50 gap-4">
                     <div className="flex items-center gap-2 text-sm text-slate-400">
                       <span className="hidden sm:inline">Showing</span>
                       <span className="font-semibold text-white">
                         {totalTeams > 0 ? ((teamsPage - 1) * teamsPerPage) + 1 : 0}-{Math.min(teamsPage * teamsPerPage, totalTeams)}
                       </span>
                       <span className="hidden sm:inline">of</span>
                       <span className="font-semibold text-white">{totalTeams}</span>
                       <span>teams</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => fetchTeams(teamsPage - 1)}
                         disabled={teamsPage <= 1}
                         className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                           teamsPage <= 1
                             ? 'border-slate-700/50 bg-slate-800/30 text-slate-500 cursor-not-allowed'
                             : 'border-slate-600/50 bg-slate-800/60 text-white hover:bg-slate-700/60 hover:border-slate-500/50 hover:shadow-lg'
                         }`}
                       >
                         <span className="hidden sm:inline">Previous</span>
                         <span className="sm:hidden">Prev</span>
                       </button>
                       
                       <button
                         onClick={() => fetchTeams(teamsPage + 1)}
                         disabled={teamsPage >= totalTeamsPages}
                         className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                           teamsPage >= totalTeamsPages
                             ? 'border-slate-700/50 bg-slate-800/30 text-slate-500 cursor-not-allowed'
                             : 'border-slate-600/50 bg-slate-800/60 text-white hover:bg-slate-700/60 hover:border-slate-500/50 hover:shadow-lg'
                         }`}
                       >
                         <span className="hidden sm:inline">Next</span>
                         <span className="sm:hidden">Next</span>
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        );
      case 'projects':
      case 'active-projects':
      case 'create-project':
      case 'archive-projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Project Management</h1>
              <div className="text-sm text-slate-400">
                {projects.length} total projects
              </div>
            </div>
            {loadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading projects...</div>
              </div>
            ) : (
              <ProjectsGrid 
                projects={projects}
                loadingProjects={loadingProjects}
                editProject={editProject}
                deleteProject={deleteProject}
                addTaskToProject={addTaskToProject}
              />
            )}
          </div>
        );
      case 'tasks':
      case 'all-tasks':
      case 'task-filters':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Global Task Management</h1>
              <div className="text-sm text-slate-400">
                {tasks.length} total tasks
              </div>
            </div>
            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading tasks...</div>
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-600/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.completed 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                      )}
                      {task.assignedTo && (
                        <div className="text-xs text-slate-500">
                          Assigned to: {task.assignedTo.name}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="text-xs text-slate-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-slate-400">No tasks found</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return (
          <DashboardOverview
            users={users}
            teams={teams}
            projects={projects}
            tasks={tasks}
            loadingUsers={loadingUsers}
            loadingTeams={loadingTeams}
            loadingProjects={loadingProjects}
            loadingTasks={loadingTasks}
          />
        );
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
    tasks,
    loadingTasks,
    fetchTeams,
    deleteTeam,
    deleteTeamCascade,
    openProject,
    createProject,
    createTeam,
    editProject,
    deleteProject,
    addTaskToProject,
  } = useAdminData(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0b10] text-white">
        <div className="text-lg">Verifying authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header />

       <div className="flex min-h-screen">
         {/* Sidebar */}
         <AdminSidebar 
           activeSection={activeSection} 
           onSectionChange={setActiveSection} 
         />
 
         {/* Main Content */}
         <main className="flex-1 px-4 md:px-6 lg:px-10 py-8 lg:ml-80 transition-all duration-300">
           {renderContent()}
         </main>
       </div>

      {/* ✅ New Team Modal */}
      <NewTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        users={users}
      />

      {/* Team Delete Confirmation Modal */}
      <TeamDeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTeam}
        teamName={teamToDelete?.name}
        teamId={teamToDelete?.id}
        isLoading={deletingTeamId === teamToDelete?.id}
      />


    </div>
  );
}
