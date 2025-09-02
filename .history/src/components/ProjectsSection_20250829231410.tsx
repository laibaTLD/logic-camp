import React from 'react';
import { ProjectAttributes } from '@/models/Project';
import ProjectCard from '@/components/ProjectCard';

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
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No projects assigned.</p>
        )}
      </div>
    </section>
  );
}