"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsGrid() {
  const { projects, loadingProjects } = useAdminData();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ---------------------
  // Handlers (feedback only)
  // ---------------------
  const handleEditProject = (project: any) => {
    setMessage(`✏️ Editing project: ${project.name}`);
    setSelectedProject(null);
  };

  const handleDeleteProject = (project: any) => {
    setMessage(`🗑️ Deleted project: ${project.name}`);
    setSelectedProject(null);
  };

  const handleAddTask = (project: any) => {
    setMessage(`➕ Adding task to: ${project.name}`);
    setSelectedProject(null);
  };

  return (
    <div>
      {/* Feedback message */}
      {message && (
        <div className="mb-4 rounded-lg bg-blue-600/20 text-blue-300 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      {/* Project grid */}
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
              onOpenProject={() => setSelectedProject(project)}
            />
          ))
        )}
      </div>

      {/* Project details modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}
