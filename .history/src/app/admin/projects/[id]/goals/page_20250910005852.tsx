'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGoalsByProject } from '@/services/goalService';
import { getProjectById } from '@/services/projectService';
import { Plus, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

interface Goal {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  projectId: number;
}

export default function GoalsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, goalsData] = await Promise.all([
          getProjectById(projectId),
          getGoalsByProject(projectId)
        ]);
        setProject(projectData);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Calculate remaining days until deadline
  const getRemainingDays = (deadline?: string) => {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] text-white p-8 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => router.push(`/admin/projects/${projectId}`)}
              className="flex items-center text-indigo-400 hover:text-indigo-300 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Project
            </button>
            <h1 className="text-3xl font-bold">{project?.name} - Goals</h1>
          </div>
          
          <button
            onClick={() => router.push(`/admin/projects/${projectId}/goals/new`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors self-start"
          >
            <Plus className="h-4 w-4" />
            Create Goal
          </button>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-gray-900/90 border border-white/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-medium text-gray-300 mb-4">No goals created yet</h3>
            <p className="text-gray-400 mb-6">Create your first goal to start tracking progress on this project</p>
            <button
              onClick={() => router.push(`/admin/projects/${projectId}/goals/new`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                onClick={() => router.push(`/admin/projects/${projectId}/goals/${goal.id}`)}
                className="bg-gray-900/90 border border-white/20 rounded-xl p-6 hover:border-indigo-400/30 hover:bg-gray-800/90 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-white">{goal.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${goal.completed ? 'bg-green-400/20 text-green-300' : 'bg-blue-400/20 text-blue-300'}`}>
                    <CheckCircle className="h-3 w-3" />
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{goal.description}</p>
                )}
                
                {goal.deadline && (
                  <div className="flex items-center gap-2 text-xs mt-4">
                    <Clock className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-300">
                      {getRemainingDays(goal.deadline) !== null ? (
                        getRemainingDays(goal.deadline)! > 0 ? 
                          `${getRemainingDays(goal.deadline)} days remaining` : 
                          getRemainingDays(goal.deadline) === 0 ? 
                            "Due today" : 
                            `${Math.abs(getRemainingDays(goal.deadline)!)} days overdue`
                      ) : "No deadline"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}