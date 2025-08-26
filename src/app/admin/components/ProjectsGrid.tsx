"use client";

import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";

export default function ProjectsGrid() {
  const { projects, openProject } = useAdminData();

  // Add a local loading state for skeletons
  const loadingProjects = !projects || projects.length === 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loadingProjects ? (
          [...Array(6)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))
        ) : (
          projects.map((p, idx) => (
            <ProjectCard key={p.id} project={p} index={idx} onOpenProject={openProject} />
          ))
        )}
      </div>
    </div>
  );
}
