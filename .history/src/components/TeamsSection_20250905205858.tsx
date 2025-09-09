'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Search } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  members?: TeamMember[];
}

interface TeamsSectionProps {
  teams: Team[];
  loading: boolean;
  onDeleteTeam: (teamId: number) => Promise<void>;
  onRefreshTeams: () => void;
}

export default function TeamsSection({ teams, loading, onDeleteTeam, onRefreshTeams }: TeamsSectionProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const teamsPerPage = 3;
  
  // Filter teams based on search query
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate pagination
  const totalTeams = filteredTeams.length;
  const totalPages = Math.ceil(totalTeams / teamsPerPage);
  const startIndex = (currentPage - 1) * teamsPerPage;
  const endIndex = startIndex + teamsPerPage;
  const currentTeams = filteredTeams.slice(startIndex, endIndex);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleDeleteTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setTeamToDelete(team);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeletingTeamId(teamToDelete.id);
    try {
      await onDeleteTeam(teamToDelete.id);
      onRefreshTeams();
      
      // If we deleted the last team on the current page, go to previous page
      if (currentTeams.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setDeleteModalOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setDeletingTeamId(null);
    }
  };

  const closeDeleteModal = () => {
    if (deletingTeamId) return; // Prevent closing while deleting
    setDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="static flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      {/* Ambient gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 7a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Team Management
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {totalTeams > 0 ? `${totalTeams} ${searchQuery ? 'filtered' : 'total'} teams` : 'No teams yet'}
              </p>
            </div>
          </div>
          
          {/* Page indicator */}
          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50">
              <span className="text-xs text-slate-400">Page</span>
              <span className="text-sm font-semibold text-white">{currentPage}</span>
              <span className="text-xs text-slate-400">of {totalPages}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-600/50 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-600"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 absolute top-0 left-0"></div>
            </div>
            <span className="mt-4 text-slate-400 font-medium">Loading teams...</span>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-slate-400" />
              ) : (
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 7a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {searchQuery ? 'No teams match your search' : 'No teams found'}
            </h3>
            <p className="text-slate-400 text-sm">
              {searchQuery ? `Try adjusting your search for "${searchQuery}"` : 'Create your first team to get started with collaboration.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Teams Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentTeams.map((team, index) => (
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
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={deletingTeamId === team.id}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                        title="Delete team"
                      >
                        {deletingTeamId === team.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 group-hover/delete:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/admin/edit-team/${team.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-600/50 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600/50 hover:to-cyan-600/50 hover:border-purple-500/50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Team
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Showing</span>
                  <span className="font-semibold text-white">
                    {startIndex + 1}-{Math.min(endIndex, totalTeams)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-white">{totalTeams}</span>
                  <span>teams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            pageNum === currentPage
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
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-800/60 text-sm font-medium text-white hover:bg-slate-700/60 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/60 transition-all"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTeam}
        title="Delete Team"
        message="Are you sure you want to delete this team? All associated projects and data will be affected."
        itemName={teamToDelete?.name}
        isLoading={deletingTeamId === teamToDelete?.id}
      />
    </section>
  );
}

// Add CSS animation keyframes
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('teams-section-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'teams-section-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}