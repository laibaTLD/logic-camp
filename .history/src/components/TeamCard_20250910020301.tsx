'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Users, Edit3, Crown, UserPlus, Sparkles } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);

  const memberCount = team.members?.length || 0;
  
  const getTeamSizeTheme = (count: number) => {
    if (count >= 10) {
      return {
        bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: <Crown className="h-5 w-5" />
      };
    } else if (count >= 5) {
      return {
        bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        icon: <Users className="h-5 w-5" />
      };
    } else if (count >= 1) {
      return {
        bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        icon: <Users className="h-5 w-5" />
      };
    } else {
      return {
        bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        glow: 'shadow-gray-500/20',
        icon: <UserPlus className="h-5 w-5" />
      };
    }
  };

  const teamTheme = getTeamSizeTheme(memberCount);

  return (
    <div
      className="group animate-fadeInUp transform transition-all duration-700 hover:scale-[1.02]"
      style={{ animationDelay: `${0.1 * index}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative text-left w-full rounded-3xl border backdrop-blur-xl p-8 
        cursor-pointer overflow-hidden transition-all duration-500 ease-out
        ${isHovered 
          ? `border-white/30 bg-gradient-to-br from-slate-800/90 via-slate-900/70 to-black/50 shadow-2xl ${teamTheme.glow}` 
          : 'border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/30 to-slate-900/40 shadow-xl'
        }`}
      >
        {/* Animated Background Mesh */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${teamTheme.bg}`}></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-purple-500/20 via-cyan-500/10 to-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Member Count Badge */}
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-lg
            bg-gradient-to-r ${teamTheme.bg} border ${teamTheme.border}
            shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
            ${isHovered ? `${teamTheme.glow} shadow-2xl` : ''}`}>
            <span className={`${teamTheme.text}`}>
              {teamTheme.icon}
            </span>
            <span className={`font-bold text-sm ${teamTheme.text}`}>
              {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Team Icon */}
            <div className={`shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-500 
              grid place-items-center shadow-xl transition-all duration-500 relative overflow-hidden
              ${isHovered ? 'shadow-purple-500/40 rotate-12 scale-110' : 'shadow-purple-500/20'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Users className="h-7 w-7 text-white relative z-10" />
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <h3 className={`font-bold text-2xl leading-tight line-clamp-2 transition-all duration-300
                ${isHovered 
                  ? 'bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent' 
                  : 'text-white'
                }`}>
                {team.name}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <Sparkles className={`h-4 w-4 transition-colors duration-300 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`} />
                <span className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`}>
                  {memberCount === 0 ? 'Ready for members' : 
                   memberCount === 1 ? 'Solo team' :
                   memberCount < 5 ? 'Small team' :
                   memberCount < 10 ? 'Growing team' : 'Large team'}
                </span>
              </div>
            </div>
          </div>

          {/* Member Tags Section */}
          {team.members && team.members.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 transition-colors duration-300 ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                Team Members
              </h4>
              <div className="flex flex-wrap gap-2">
                {team.members.slice(0, 4).map((member, idx) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105
                      ${isHovered 
                        ? 'bg-indigo-500/20 border-indigo-400/40 shadow-lg shadow-indigo-500/20' 
                        : 'bg-indigo-500/10 border-indigo-500/20'
                      }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-indigo-300' : 'text-indigo-400'}`}>
                      {member.name}
                    </span>
                  </div>
                ))}
                {team.members.length > 4 && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300
                    ${isHovered 
                      ? 'bg-purple-500/20 border-purple-400/40 shadow-lg shadow-purple-500/20' 
                      : 'bg-purple-500/10 border-purple-500/20'
                    }`}>
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className={`text-xs font-bold transition-colors duration-300 ${isHovered ? 'text-white' : 'text-purple-200'}`}>
                        +{team.members.length - 4}
                      </span>
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-purple-300' : 'text-purple-400'}`}>
                      more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {memberCount === 0 && (
            <div className="mb-6">
              <div className={`p-4 rounded-2xl border border-dashed transition-all duration-300 text-center
                ${isHovered 
                  ? 'border-gray-400/40 bg-gray-500/10' 
                  : 'border-gray-500/20 bg-gray-500/5'
                }`}>
                <UserPlus className={`h-8 w-8 mx-auto mb-2 transition-colors duration-300 ${isHovered ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm transition-colors duration-300 ${isHovered ? 'text-gray-400' : 'text-gray-500'}`}>
                  No members yet
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Edit Button */}
            <button
              onClick={() => router.push(`/admin/edit-team/${team.id}`)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border font-semibold text-sm 
                transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
                ${isHovered 
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-lg shadow-indigo-500/20' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40'
                }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Team</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteTeam(team.id)}
              disabled={deletingTeamId === team.id}
              className={`px-4 py-3 rounded-2xl border font-semibold text-sm transition-all duration-300
                flex items-center gap-2 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed
                ${isHovered 
                  ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
                }`}
              title="Delete team"
            >
              {deletingTeamId === team.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Subtle Border Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10"></div>
        </div>
      </div>
    </div>
  );
}