'use client';

import React, { useState } from 'react';
import ProjectChat from '@/app/user/components/ProjectChat';
import { updateProjectStatus } from '@/services/projectService';
import { formatDate } from '@/utils/helpers';
import { ProjectAttributes } from '@/models/Project';

// Using standard HTML elements instead of missing UI components

interface Project extends ProjectAttributes {}

interface ProjectDetailsProps {
  project: Project;
}

function getStatusColor(status: string) {
  // Same as in modal
  switch (status) {
    case 'planning': return 'text-blue-400 bg-blue-400/10';
    case 'active': return 'text-green-400 bg-green-400/10';
    case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
    case 'completed': return 'text-emerald-400 bg-emerald-400/10';
    case 'cancelled': return 'text-red-400 bg-red-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const [projectStatus, setProjectStatus] = useState(project.status);

  const handleProjectStatusChange = async (newStatus: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled') => {
    try {
      await updateProjectStatus(project.id, newStatus);
      setProjectStatus(newStatus);
    } catch (error) {
      console.error('Failed to update project status', error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{project.name}</h1>

      {/* Project Info */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Status</label>
            <div className={`inline-flex px-3 py-1 rounded-full ${getStatusColor(projectStatus)}`}>
              {projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1)}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Update Status</label>
            <select 
              onChange={(e) => handleProjectStatusChange(e.target.value as 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled')}
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
            <p className="text-white">{project.team?.map((m: { id: number; name: string }) => m.name).join(', ') || 'None'}</p>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Description</label>
          <p className="text-gray-200">{project.description}</p>
        </div>
      </section>

      {/* Goals */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Goals</h2>
        <p className="text-gray-400">
          <a href={`/projects/${project.id}/goals`} className="text-blue-400 hover:underline">
            View and manage goals for this project
          </a>
        </p>
      </section>

      {/* Chat */}
      <section className="bg-gray-900/90 border border-white/20 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Project Chat</h2>
        <ProjectChat projectId={project.id} />
      </section>
    </div>
  );
}