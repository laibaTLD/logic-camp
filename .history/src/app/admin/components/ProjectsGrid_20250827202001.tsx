"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsGrid() {
  const { projects, loadingProjects } = useAdminData();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // ✅ Handlers for modal actions
  const handleDelete = (id: string) => {
    console.log("Delete project:", id);
    // TODO: call API to delete project, then refresh
    setSelectedProject(null);
  };

  const handleEdit = (project: any) => {
    console.log("Edit project:", project);
    // TODO: open edit modal / prefill form
  };

  const handleAddTask = (projectId: string) => {
    console.log("Add task to project:", projectId);
    // TODO: open add-task modal
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
              onOpenProject={() => setSelectedProject(project)} // open modal
            />
          ))
        )}
      </div>

      {/* Project details modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          open={true}
          onClose={() => setSelectedProject(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}
