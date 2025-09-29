'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Users, Edit, UserCheck, Crown, Star } from 'lucide-react';

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
}

export default function TeamCard({ team, index, onDeleteTeam, onEditTeam, deletingTeamId }: TeamCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Determine team size category for theming
  const getTeamSizeTheme = () => {
    const memberCount = team.members?.length || 0;
    if (memberCount >= 10) {
      return {
        bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: <Crown className="h-4 w-4" />
      };
    } else if (memberCount >= 5) {
      return {
        bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        icon: <Star className="h-4 w-4" />
      };
    } else {
      return {
        bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        icon: <UserCheck className="h-4 w-4" />
      };
    }
  };

  const teamTheme = getTeamSizeTheme();

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-conic from-indigo-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Team Size Badge */}
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-lg
            bg-gradient-to-r ${teamTheme.bg} border ${teamTheme.border}
            shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
            ${isHovered ? `${teamTheme.glow} shadow-2xl` : ''}`}>
            <span className={`${teamTheme.text}`}>
              {teamTheme.icon}
            </span>
            <span className={`font-semibold text-sm ${teamTheme.text}`}>
              {team.members?.length || 0} members
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Team Icon */}
            <div className={`shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 
              grid place-items-center shadow-xl transition-all duration-500 relative overflow-hidden
              ${isHovered ? 'shadow-indigo-500/40 rotate-12 scale-110' : 'shadow-indigo-500/20'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Users className="h-7 w-7 text-white relative z-10" />
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <h3 className={`font-bold text-2xl leading-tight line-clamp-2 transition-all duration-300
                ${isHovered 
                  ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent' 
                  : 'text-white'
                }`}>
                {team.name}
              </h3>
              <p className={`mt-2 text-base transition-colors duration-300
                ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                Team of {team.members?.length || 0} talented members
              </p>
            </div>
          </div>

          {/* Member Display Section */}
          {team.members && team.members.length > 0 && (
            <div className="mb-6">
              {/* Member Avatars Row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map((member, idx) => (
                    <div
                      key={member.id}
                      className={`w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full 
                      flex items-center justify-center text-white text-sm font-bold border-2 border-slate-800
                      transition-all duration-300 hover:scale-110 hover:z-10 relative
                      ${isHovered ? 'border-slate-600' : 'border-slate-800'}`}
                      style={{ zIndex: 5 - idx }}
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <div className={`w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full 
                      flex items-center justify-center text-white text-xs font-bold border-2
                      transition-all duration-300
                      ${isHovered ? 'border-slate-600' : 'border-slate-800'}`}>
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Member Tags */}
              <div className="flex flex-wrap gap-2">
                {team.members.slice(0, 3).map((member) => (
                  <span
                    key={member.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium 
                    border transition-all duration-300
                    ${isHovered 
                      ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-sm shadow-indigo-500/20' 
                      : 'bg-slate-700/50 border-slate-600/50 text-slate-300'
                    }`}
                  >
                    {member.name}
                  </span>
                ))}
                {team.members.length > 3 && (
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium 
                    border transition-all duration-300
                    ${isHovered 
                      ? `${teamTheme.bg.replace('bg-gradient-to-br', 'bg-gradient-to-r')} ${teamTheme.border} ${teamTheme.text} shadow-sm ${teamTheme.glow}` 
                      : 'bg-purple-600/20 border-purple-500/30 text-purple-300'
                    }`}>
                    +{team.members.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!team.members || team.members.length === 0) && (
            <div className={`mb-6 p-4 rounded-2xl border transition-all duration-300
              ${isHovered 
                ? 'bg-gray-500/10 border-gray-400/30 shadow-sm shadow-gray-500/10' 
                : 'bg-gray-500/5 border-gray-500/20'
              }`}>
              <p className={`text-center text-sm transition-colors duration-300
                ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                No members yet. Add members to get started!
              </p>
            </div>
          )}

          {/* Action Buttons Section Removed */}
        </div>

        {/* Subtle Border Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"></div>
        </div>
      </div>
    </div>
  );
}