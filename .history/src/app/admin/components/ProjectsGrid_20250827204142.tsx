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
  // Handlers (real API calls)
  // ---------------------
  const handleEditProject = async (project: any) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: project.name + " (Edited)" }), // demo update
      });

      if (!res.ok) throw new Error("Failed to edit project");

      setMessage(`✅ Project updated: ${project.name}`);
    } catch (err: any) {
      setMessage(`❌ Error editing project: ${err.message}`);
    }
    setSelectedProject(null);
  };

  const handleDeleteProject = async (project: any) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");

      setMessage(`🗑️ Project deleted: ${project.name}`);
    } catch (err: any) {
      setMessage(`❌ Error deleting project: ${err.message}`);
    }
    setSelectedProject(null);
  };

  const handleAddTask = async (project: any) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: "New Task", status: "pending" }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      setMessage(`➕ Task added to: ${project.name}`);
    } catch (err: any) {
      setMessage(`❌ Error adding task: ${err.message}`);
    }
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
