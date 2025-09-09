'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Users, Edit, Crown, UserPlus, Calendar, Star } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  members?: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
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
  const displayMembers = team.members?.slice(0, 4) || [];
  const additionalCount = Math.max(0, memberCount - 4);

  const getTeamSizeTheme = (count: number) => {
    if (count >= 10) {
      return {
        bg: 'from-purple-500/10 via-violet-500/5 to-fuchsia-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        icon: Crown
      };
    } else if (count >= 5) {
      return {
        bg: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        icon: Users
      };
    } else if (count > 0) {
      return {
        bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: Users
      };
    } else {
      return {
        bg: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        glow: 'shadow-gray-500/20',
        icon: UserPlus
      };
    }
  };

  const teamTheme = getTeamSizeTheme(memberCount);
  const IconComponent = teamTheme.icon;

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
            <IconComponent className={`h-4 w-4 ${teamTheme.text}`} />
            <span className={`font-semibold text-sm ${teamTheme.text}`}>
              {memberCount === 0 ? 'Empty' : memberCount === 1 ? '1 Member' : `${memberCount} Members`}
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
              <div className="mt-2 flex items-center gap-2">
                <Star className={`h-4 w-4 transition-colors duration-300 ${isHovered ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className={`text-sm transition-colors duration-300 ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                  Team Workspace
                </span>
              </div>
            </div>
          </div>

          {/* Member Avatars Section */}
          {memberCount > 0 ? (
            <div className="mb-6">
              <h4 className={`text-sm font-semibold mb-4 transition-colors duration-300 
                ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
                Team Members
              </h4>
              <div className="flex items-center gap-3">
                {/* Member Avatars */}
                <div className="flex -space-x-3">
                  {displayMembers.map((member, idx) => (
                    <div
                      key={member.id}
                      className={`relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full 
                        flex items-center justify-center text-white text-sm font-bold border-2 border-white/20
                        shadow-lg transition-all duration-300 hover:scale-110 hover:z-10
                        ${isHovered ? 'shadow-indigo-500/40' : 'shadow-indigo-500/20'}`}
                      style={{ zIndex: displayMembers.length - idx }}
                      title={member.name}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  ))}
                  {additionalCount > 0 && (
                    <div className={`relative w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full 
                      flex items-center justify-center text-white text-xs font-bold border-2 border-white/20
                      shadow-lg transition-all duration-300
                      ${isHovered ? 'shadow-gray-500/40' : 'shadow-gray-500/20'}`}>
                      +{additionalCount}
                    </div>
                  )}
                </div>

                {/* Member Names (First 2) */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {displayMembers.slice(0, 2).map((member) => (
                    <div
                      key={member.id}
                      className={`text-sm font-medium line-clamp-1 transition-colors duration-300
                        ${isHovered ? 'text-gray-300' : 'text-gray-400'}`}
                    >
                      {member.name}
                    </div>
                  ))}
                  {additionalCount > 0 && (
                    <div className={`text-xs transition-colors duration-300 ${teamTheme.text}`}>
                      and {additionalCount} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className={`flex items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300
                ${isHovered 
                  ? 'border-gray-500/40 bg-gray-500/10' 
                  : 'border-gray-600/30 bg-gray-500/5'
                }`}>
                <div className="text-center">
                  <UserPlus className={`h-8 w-8 mx-auto mb-2 transition-colors duration-300 ${isHovered ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm transition-colors duration-300 ${isHovered ? 'text-gray-400' : 'text-gray-500'}`}>
                    No members yet
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="mb-6">
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300
              ${isHovered 
                ? `${teamTheme.bg} ${teamTheme.border} shadow-lg ${teamTheme.glow}` 
                : `bg-slate-500/10 border-slate-500/20`
              }`}>
              <div className={`p-2 rounded-xl ${memberCount > 0 ? teamTheme.bg : 'bg-gray-500/20'}`}>
                <Calendar className={`h-5 w-5 transition-colors duration-300 ${isHovered ? 'text-slate-300' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Last Updated</p>
                <p className={`font-bold text-sm transition-colors duration-300 ${isHovered ? 'text-slate-300' : 'text-slate-400'}`}>
                  {team.updatedAt ? new Date(team.updatedAt).toLocaleDateString("en-GB") : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/edit-team/${team.id}`);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border font-semibold text-sm 
                transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative z-20
                ${isHovered 
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-lg shadow-indigo-500/20' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40'
                }`}
            >
              <Edit className="h-4 w-4" />
              <span>Edit Team</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTeam(team.id);
              }}
              disabled={deletingTeamId === team.id}
              className={`px-4 py-3 rounded-2xl border font-semibold text-sm transition-all duration-300
                flex items-center gap-2 hover:scale-105 hover:-translate-y-1 relative z-20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isHovered 
                  ? 'bg-red-500/20 border-red-400/40 text-red-300 shadow-lg shadow-red-500/20' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40'
                }`}
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
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"></div>
        </div>
      </div>
    </div>
  );
}