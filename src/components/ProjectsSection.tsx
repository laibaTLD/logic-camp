import React from 'react';
import { ProjectAttributes } from '@/models/Project';
import ProjectCardUser from '@/components/user/ProjectCardUser';

type ProjectsSectionProps = {
  projects: ProjectAttributes[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <ProjectCardUser
              key={project.id}
              index={index}
              project={{
                id: project.id as number,
                name: project.name,
                description: project.description || '',
                end_date: (project as any).end_date || undefined,
                endDate: (project as any).endDate || undefined,
                updatedAt: (project as any).updatedAt,
                createdAt: (project as any).createdAt,
                team: { members: Array.isArray((project as any).members) ? (project as any).members : [] },
                status_title: (project as any).status_title,
              }}
            />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No projects assigned.</p>
        )}
      </div>
    </section>
  );
}