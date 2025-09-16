import React from 'react';
import { ProjectAttributes } from '@/models/Project';
import UserProjectCard from '@/components/UserProjectCard';

type ProjectsSectionProps = {
  projects: ProjectAttributes[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <UserProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description || ''}
              endDate={(project as any).end_date || (project as any).endDate || undefined}
              membersCount={Array.isArray((project as any).members) ? (project as any).members.length : undefined}
            />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No projects assigned.</p>
        )}
      </div>
    </section>
  );
}