// components/ProjectsGrid.tsx
"use client";
import ProjectCard from "./ProjectCard";

export default function ProjectsGrid({ projects }: any) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">All Projects</h2>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
