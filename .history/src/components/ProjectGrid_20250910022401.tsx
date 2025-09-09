'use client';

import React from 'react';
import ProjectCard from '@/app/admin/components/ProjectCard';

export interface ProjectGridProps {
  projects: any[];
  loadingProjects?: boolean;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (projectId: number) => void;
  deletingProjectId?: number;
}

export default function ProjectGrid({ 
  projects, 
  loadingProjects = false,
  onEditProject,
  onDeleteProject,
  deletingProjectId 
}: ProjectGridProps) {
  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl text-center">
        <p className="text-gray-400 mb-4">No projects have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project, index) => (
        <ProjectCard 
          key={project.id} 
          project={project}
          index={index}
          onOpenProject={onDeleteProject ? () => onDeleteProject(project.id) : undefined}
        />
      ))}
    </div>
  );
}