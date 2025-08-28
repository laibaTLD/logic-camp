"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsGrid() {
  const {
    projects,
    loadingProjects,
    editProject,
    deleteProject,
    addTaskToProject,
  } = useAdminData();

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ---------------------
  // Handlers (use hook)
  // ---------------------
  const handleEditProject = async (project: any) => {
    await editProject(project.id, { name: project.name + " (Edited)" }); // demo update
    setMessage(`✅ Project updated: ${project.name}`);
    setSelectedProject(null);
  };

  const handleDeleteProject = async (project: any) => {
    await deleteProject(project.id);
    setMessage(`🗑️ Project deleted: ${project.name}`);
    setSelectedProject(null);
  };

  const handleAddTask = async (project: any) => {
    await addTaskToProject(project.id, { title: "New Task" });
    setMessage(`➕ Task added to: ${project.name}`);
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
          [...Array(6)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))
        ) : projects.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full mt-4">
            No active projects found.
          </p>
        ) : (
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
