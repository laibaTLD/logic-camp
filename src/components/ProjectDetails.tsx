'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { updateProjectStatus } from '@/services/projectService';
import { formatDate } from '@/utils/helpers';
import { ProjectAttributes } from '@/models/Project';
import ProjectGoalsNested from '@/components/ProjectGoalsNested';
import StatusDropdown from '@/components/StatusDropdown';

// Using standard HTML elements instead of missing UI components

import { Project as BaseProject } from '@/types';

interface Project extends ProjectAttributes {
  // Add missing properties from service layer that might be used
  team?: { id: number; name: string }[];
}

interface ProjectDetailsProps {
  project: Project;
}

function getStatusColor(status: { title?: string; color?: string } | string) {
  const statusName = typeof status === 'string' ? status : status?.title || 'todo';
  
  switch (statusName.toLowerCase()) {
    case 'todo': return 'text-blue-400 bg-blue-400/10';
    case 'inprogress': return 'text-green-400 bg-green-400/10';
    case 'testing': return 'text-yellow-400 bg-yellow-400/10';
    case 'review': return 'text-purple-400 bg-purple-400/10';
    case 'done': return 'text-emerald-400 bg-emerald-400/10';
    case 'completed': return 'text-emerald-400 bg-emerald-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

function getStatusDisplayName(status: { title?: string } | string) {
  const statusName = typeof status === 'string' ? status : status?.title || 'todo';
  
  switch (statusName.toLowerCase()) {
    case 'todo': return 'To Do';
    case 'inprogress': return 'In Progress';
    case 'testing': return 'Testing';
    case 'review': return 'Review';
    case 'done': return 'Done';
    case 'completed': return 'Completed';
    default: return statusName.charAt(0).toUpperCase() + statusName.slice(1);
  }
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const { user } = useUser();
  
  // Get current status display name
  const getCurrentStatusDisplay = () => getStatusDisplayName((project as any).status_title || 'todo');
  
  // Get current status for display
  const [projectStatus, setProjectStatus] = useState(getCurrentStatusDisplay());
  const [selectedStatus, setSelectedStatus] = useState<string>(((project as any).status_title || 'todo'));

  const handleProjectStatusChange = async (newStatusTitle: string) => {
    try {
      setSelectedStatus(newStatusTitle);
      await updateProjectStatus(project.id, newStatusTitle);
      // Optimistically reflect change in badge
      (project as any).status_title = newStatusTitle;
      setProjectStatus(getStatusDisplayName(newStatusTitle));
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
            <div 
              className={`inline-flex px-3 py-1 rounded-full ${getStatusColor((project as any).status_title || 'todo')}`}
            >
              {getStatusDisplayName((project as any).status_title || 'todo')}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Update Status</label>
            <div className="mt-1">
              <StatusDropdown
                statuses={[]}
                onStatusesChange={() => { /* no-op for employees */ }}
                selectedStatus={selectedStatus}
                onStatusSelect={handleProjectStatusChange}
                entityType="project"
                disabled={!(user?.role === 'employee')}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Start Date</label>
            <p className="text-white">{project.start_date ? formatDate(project.start_date) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">End Date</label>
            <p className="text-white">{project.end_date ? formatDate(project.end_date) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Team Members</label>
            {(() => {
              const flatMembers = (project as any).members;
              const nestedMembers = (project as any).team?.members;
              const names = Array.isArray(flatMembers)
                ? flatMembers.map((m: any) => m.name)
                : Array.isArray(nestedMembers)
                ? nestedMembers.map((m: any) => m.name)
                : [];
              return (
                <p className="text-white">{names.length > 0 ? names.join(', ') : 'None'}</p>
              );
            })()}
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
        <ProjectGoalsNested projectId={project.id} teamId={(project as any).team_id || (project as any).teamId} />
      </section>
    </div>
  );
}