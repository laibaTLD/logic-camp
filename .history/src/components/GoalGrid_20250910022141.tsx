'use client';

import GoalCard from './GoalCard';

interface Goal {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed';
  project_id: number;
  deadline?: string;
}

interface GoalGridProps {
  goals: Goal[];
  loadingGoals?: boolean;
  onEditGoal?: (goal: Goal) => void;
  onDeleteGoal?: (goalId: number) => void;
  deletingGoalId?: number | null;
}

export default function GoalGrid({ goals, loadingGoals, onEditGoal, onDeleteGoal, deletingGoalId }: GoalGridProps) {
  if (loadingGoals) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading goals...</div>
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400">No goals found. Create your first goal to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal, index) => (
        <GoalCard 
          key={goal.id}
          goal={goal}
          index={index}
          onEditGoal={onEditGoal}
          onDeleteGoal={onDeleteGoal}
          deletingGoalId={deletingGoalId}
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

.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out forwards;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('goals-grid-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'goals-grid-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}