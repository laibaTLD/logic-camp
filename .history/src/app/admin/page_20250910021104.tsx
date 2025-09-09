'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NewTeamModal from "./components/NewTeamModal";
import UserTable from "./components/UserTable";
import ProjectsGrid from "./components/ProjectsGrid";
import CreateProjectSection from "./components/CreateProjectSection";
import useAdminData from "./hooks/useAdminData";
import Header from "./components/Header";
import AdminSidebar from "./components/AdminSidebar";
import DashboardOverview from "./components/DashboardOverview";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import TeamDeleteConfirmationModal from "../../components/TeamDeleteConfirmationModal";
import GoalsSection from "./components/GoalsSection";
import GoalsCreatePage from "./components/GoalsCreatePage";
import { Plus } from "lucide-react";
import TeamGrid from "../../components/TeamGrid";
import EditTeamModal from "./components/EditTeamModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: number; name: string } | null>(null);
  const [editingTeam, setEditingTeam] = useState<{ id: number; name: string; members?: any[] } | null>(null);

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
      await fetchTeams(teamsPage);
    } catch (error) {
      console.error('Failed to delete team:', error);
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
        teams && console.log(teams)
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
                <TeamGrid 
                  teams={teams.map(team => {
                    const anyTeam: any = team as any;
                    const memberList = Array.isArray(team.members)
                      ? team.members
                      : Array.isArray(anyTeam.Users)
                        ? anyTeam.Users
                        : [];
                    
                    return {
                      ...team,
                      members: memberList
                    };
                  })} 
                  onDeleteTeam={(teamId) => {
                    const team = teams.find(t => t.id === teamId);
                    if (team) {
                      setTeamToDelete({ id: team.id, name: team.name });
                      setDeleteModalOpen(true);
                    }
                  }}
                  deletingTeamId={deletingTeamId}
                />

                {totalTeams > 0 && (
                   <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-700/50 gap-4">
                     <div className="flex items-center gap-2 text-sm text-slate-400">
                       <span className="hidden sm:inline">Showing</span>
                       <span className="font-semibold text-white">
                         {((teamsPage - 1) * teamsPerPage) + 1}
                       </span>
                       <span className="hidden sm:inline">to</span>
                       <span className="sm:hidden">-</span>
                       <span className="font-semibold text-white">
                         {Math.min(teamsPage * teamsPerPage, totalTeams)}
                       </span>
                       <span className="hidden sm:inline">of</span>
                       <span className="font-semibold text-white">{totalTeams}</span>
                       <span>teams</span>
                       <span className="hidden sm:inline">(Page {teamsPage} of {totalTeamsPages})</span>
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
      case 'archive-projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Project Management</h1>
              <button
                onClick={() => setActiveSection('create-project')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </button>
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
              />
            )}
          </div>
        );
      case 'create-project':
        return (
          <CreateProjectSection
            teams={teams}
            loadingTeams={loadingTeams}
            createProject={createProject}
            onBack={() => setActiveSection('projects')}
          />
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
      case 'goals':
        return (
          <GoalsSection onCreate={() => setActiveSection('goals-create')} />
        );
      case 'goals-create':
        return (
          <GoalsCreatePage />
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
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          router.push('/admin/adminLogin');
          return;
        }

        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!verifyResponse.ok) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          router.push('/admin/adminLogin');
          return;
        }

        const verifyData = await verifyResponse.json();
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
       <div className="flex min-h-screen">
         <AdminSidebar 
           activeSection={activeSection} 
           onSectionChange={setActiveSection}
           onCreateTeam={() => setIsTeamModalOpen(true)}
           onCreateProject={() => setActiveSection('create-project')}
         />
 
         <main className="flex-1 lg:ml-80 transition-all duration-300 animate-fadeIn">
           <Header />
           
           <div className="px-4 md:px-6 lg:px-10 py-8">
               {renderContent()}
           </div>
         </main>
       </div>

      <NewTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        users={users}
        createTeam={createTeam}
      />

      <TeamDeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTeam}
        teamName={teamToDelete?.name}
        teamId={teamToDelete?.id}
        isLoading={deletingTeamId === teamToDelete?.id}
      />

      <EditTeamModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        allUsers={users}
        onSaved={async () => { await fetchTeams(teamsPage); }}
        onError={(m) => toast.error(m)}
      />


    </div>
  );
}
