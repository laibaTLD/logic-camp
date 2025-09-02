"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "./ProjectCard";
import useAdminData from "../hooks/useAdminData";
import DeleteProjectModal from "./DeleteProjectModal";
import DeleteTaskModal from "./DeleteTaskModal";
// Removed modal imports - now using separate pages

export default function ProjectsGrid() {
  const {
    projects,
    loadingProjects,
    editProject,
    deleteProject,
    addTaskToProject,
  } = useAdminData();

  const [deleteProjectModal, setDeleteProjectModal] = useState<{ isOpen: boolean; project: any | null }>({ isOpen: false, project: null });
  const [deleteTaskModal, setDeleteTaskModal] = useState<{ isOpen: boolean; task: any | null }>({ isOpen: false, task: null });
  // Removed modal state - now using navigation to separate pages
  const [projectTasks, setProjectTasks] = useState<{ [key: number]: any[] }>({});
  const [message, setMessage] = useState<string | null>(null);

  // ---------------------
  // Handlers (use hook)
  // ---------------------
  const handleOpenDeleteProject = (project: any) => {
    setDeleteProjectModal({ isOpen: true, project });
  };

  const handleConfirmDeleteProject = async () => {
    if (deleteProjectModal.project) {
      await deleteProject(deleteProjectModal.project.id);
      setMessage(`🗑️ Project deleted: ${deleteProjectModal.project.name}`);
      setDeleteProjectModal({ isOpen: false, project: null });
    }
  };

  const handleOpenDeleteTask = (task: any) => {
    setDeleteTaskModal({ isOpen: true, task });
  };

  const handleConfirmDeleteTask = async () => {
    if (deleteTaskModal.task) {
      try {
        const response = await fetch(`/api/tasks?id=${deleteTaskModal.task.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          setMessage(`🗑️ Task deleted: ${deleteTaskModal.task.title}`);
          // Refresh the project tasks after deletion
          const projectId = deleteTaskModal.task.projectId;
          if (projectId) {
            fetchProjectTasks(projectId);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error || 'Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        setMessage(`❌ Error deleting task: ${error.message}`);
      }
      setDeleteTaskModal({ isOpen: false, task: null });
    }
  };

  const handleOpenEditTask = (task: any, projectId: number) => {
    router.push(`/admin/edit-task?taskId=${task.id}&projectId=${projectId}`);
  };

  const handleOpenAddTask = (projectId: number) => {
    router.push(`/admin/add-task?projectId=${projectId}`);
  };

  const fetchProjectTasks = async (projectId: number) => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProjectTasks(prev => ({ ...prev, [projectId]: data.tasks || [] }));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  return (
    <div>

      {/* Feedback message */}
      {message && (
        <div className="static mb-4 rounded-lg bg-blue-600/20 text-blue-300 px-4 py-2 text-sm">
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
              onOpenProject={() => handleOpenDeleteProject(project)}
              onEditTask={(task) => handleOpenEditTask(task, project.id)}
              onDeleteTask={handleOpenDeleteTask}
              onAddTask={() => handleOpenAddTask(project.id)}
              tasks={projectTasks[project.id] || []}
              onLoadTasks={() => fetchProjectTasks(project.id)}
            />
          ))
        )}
      </div>

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={deleteProjectModal.isOpen}
        onClose={() => setDeleteProjectModal({ isOpen: false, project: null })}
        onConfirm={handleConfirmDeleteProject}
        projectName={deleteProjectModal.project?.name || ""}
      />

      {/* Delete Task Modal */}
      <DeleteTaskModal
        isOpen={deleteTaskModal.isOpen}
        onClose={() => setDeleteTaskModal({ isOpen: false, task: null })}
        onConfirm={handleConfirmDeleteTask}
        taskTitle={deleteTaskModal.task?.title || ""}
      />

      {/* Removed modals - now using separate pages */}
    </div>
  );
}
