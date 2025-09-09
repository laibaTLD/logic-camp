"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import DeleteProjectModal from "./DeleteProjectModal";
import DeleteTaskModal from "./DeleteTaskModal";
// Removed modal imports - now using separate pages

interface ProjectsGridProps {
  projects: any[];
  loadingProjects: boolean;
  editProject: (projectId: number, projectData: any) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  addTaskToProject: (projectId: number, taskData: any) => Promise<void>;
}

export default function ProjectsGrid({ projects, loadingProjects, editProject, deleteProject, addTaskToProject }: ProjectsGridProps) {
  const router = useRouter();

  const [deleteProjectModal, setDeleteProjectModal] = useState<{ isOpen: boolean; project: any | null }>({ isOpen: false, project: null });
  const [deleteTaskModal, setDeleteTaskModal] = useState<{ isOpen: boolean; task: any | null }>({ isOpen: false, task: null });
  // Removed modal state - now using navigation to separate pages
  const [projectTasks, setProjectTasks] = useState<{ [key: number]: any[] }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalProjects = filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

      {/* Header with project count and page indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-400">
            {totalProjects > 0 ? `${totalProjects} ${searchQuery ? 'filtered' : 'total'} projects` : 'No projects yet'}
          </p>
        </div>
        
        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50">
            <span className="text-xs text-slate-400">Page</span>
            <span className="text-sm font-semibold text-white">{currentPage}</span>
            <span className="text-xs text-slate-400">of {totalPages}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-600/50 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loadingProjects ? (
          [...Array(6)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="text-center col-span-full mt-4">
            {searchQuery ? (
              <div>
                <p className="text-gray-400 mb-2">
                  No projects match your search for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <p className="text-gray-400">
                No active projects found.
              </p>
            )}
          </div>
        ) : (
          filteredProjects.map((project, idx) => (
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
