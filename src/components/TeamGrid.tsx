'use client';

import TeamCard from './TeamCard';

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

interface TeamGridProps {
  teams: Team[];
  onDeleteTeam: (teamId: number) => void;
  onEditTeam?: (team: Team) => void;
  deletingTeamId: number | null;
}

export default function TeamGrid({ teams, onDeleteTeam, onEditTeam, deletingTeamId }: TeamGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team, index) => (
        <TeamCard 
          key={team.id}
          team={team}
          index={index}
          onDeleteTeam={onDeleteTeam}
          onEditTeam={onEditTeam}
          deletingTeamId={deletingTeamId}
        />
      ))}
    </div>
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
if (typeof document !== 'undefined' && !document.getElementById('teams-grid-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'teams-grid-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}