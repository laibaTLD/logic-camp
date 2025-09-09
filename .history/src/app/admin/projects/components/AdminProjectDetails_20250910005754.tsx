'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus } from '@/services/projectService';
import { formatDate } from '@/utils/helpers';
import { Project } from '../../hooks/useAdminData';
import { Plus } from 'lucide-react';

interface AdminProjectDetailsProps {
  project: Project;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'planning': return 'text-blue-400 bg-blue-400/10';
    case 'active': return 'text-green-400 bg-green-400/10';
    case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
    case 'completed': return 'text-emerald-400 bg-emerald-400/10';
    case 'cancelled': return 'text-red-400 bg-red-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

export default function AdminProjectDetails({ project }: AdminProjectDetailsProps) {
  const router = useRouter();
  const [projectStatus, setProjectStatus] = useState(project.status || 'planning');

  const handleProjectStatusChange = async (newStatus: string) => {
    try {
      await updateProjectStatus(project.id, newStatus);
      setProjectStatus(newStatus);
    } catch (error) {
      console.error('Failed to update project status', error);
    }
  };

  // Calculate remaining days until deadline
  const getRemainingDays = () => {
    if (!project.endDate) return null;
    
    const today = new Date();
    const deadline = new Date(project.endDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{project.name}</h1>
        <button
          onClick={() => router.push(`/admin/projects/${project.id}/goals/new`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Goal
        </button>
      </div>

      {/* Project Info */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Status</label>
            <div className={`inline-flex px-3 py-1 rounded-full ${getStatusColor(projectStatus)}`}>
              {projectStatus?.charAt(0).toUpperCase() + projectStatus?.slice(1)}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Update Status</label>
            <select 
              onChange={(e) => handleProjectStatusChange(e.target.value)}
              defaultValue={projectStatus}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Start Date</label>
            <p className="text-white">{project.startDate ? formatDate(project.startDate) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">End Date</label>
            <p className="text-white">{project.endDate ? formatDate(project.endDate) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Team Members</label>
            <p className="text-white">{project.members?.map((m) => m.name).join(', ') || 'None'}</p>
          </div>
          {project.endDate && (
            <div>
              <label className="text-sm text-gray-400">Deadline</label>
              <p className="text-white">
                {getRemainingDays() !== null ? (
                  getRemainingDays() > 0 ? 
                    `${getRemainingDays()} days remaining` : 
                    getRemainingDays() === 0 ? 
                      "Due today" : 
                      `${Math.abs(getRemainingDays())} days overdue`
                ) : "No deadline set"}
              </p>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-400">Description</label>
          <p className="text-gray-200">{project.description}</p>
        </div>
      </section>

      {/* Goals */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Goals</h2>
          <button
            onClick={() => router.push(`/admin/projects/${project.id}/goals/new`)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Goal
          </button>
        </div>
        <p className="text-gray-400">
          <a href={`/admin/projects/${project.id}/goals`} className="text-blue-400 hover:underline">
            View and manage goals for this project
          </a>
        </p>
      </section>
    </div>
  );
}