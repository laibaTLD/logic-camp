"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsGrid() {
  const { projects, loadingProjects } = useAdminData();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // ---------------------
  // Handlers
  // ---------------------
  const handleEditProject = (project: any) => {
    console.log("Edit project:", project);
    // 👉 open edit form / API call here
    setSelectedProject(null);
  };

  const handleDeleteProject = (project: any) => {
    console.log("Delete project:", project);
    // 👉 call DELETE API here
    setSelectedProject(null);
  };

  const handleAddTask = (project: any) => {
    console.log("Add task to project:", project);
    // 👉 open add-task modal / API call here
    setSelectedProject(null);
  };

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
              project={project}
              index={idx}
              onOpenProject={() => setSelectedProject(project)} // open modal with project
            />
          ))
        )}
      </div>

      {/* Project details modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={true} // ✅ correct prop
          onClose={() => setSelectedProject(null)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}
