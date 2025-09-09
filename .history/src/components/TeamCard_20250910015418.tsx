'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

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

interface TeamCardProps {
  team: Team;
  index: number;
  onDeleteTeam: (teamId: number) => void;
  deletingTeamId: number | null;
}

export default function TeamCard({ team, index, onDeleteTeam, deletingTeamId }: TeamCardProps) {
  const router = useRouter();

  return (
    <div
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
            onClick={() => onDeleteTeam(team.id)}
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
  );
}