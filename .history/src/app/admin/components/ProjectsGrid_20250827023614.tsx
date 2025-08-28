"use client";

import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";

export default function ProjectsGrid() {
  const { projects, openProject, loadingProjects } = useAdminData();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loadingProjects ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))
        ) : projects.length === 0 ? (
          // No projects
          <p className="text-gray-400 text-center col-span-full mt-4">
            No active projects found.
          </p>
        ) : (
          // Render project cards
          projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}       // ✅ must be lowercase
              index={idx}
              onOpenProject={openProject}
            />
          ))
        )}
      </div>
    </div>
  );
}
