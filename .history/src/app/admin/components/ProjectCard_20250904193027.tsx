"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, FolderKanban, Edit, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Project } from "../hooks/useAdminData";

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpenProject: (project: Project) => void;
  onEditTask?: (task: any) => void;
  onDeleteTask?: (task: any) => void;
  onAddTask?: () => void;
  tasks?: any[];
  onLoadTasks?: () => void;
}

// ✅ Make sure to type the component correctly
const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenProject, onEditTask, onDeleteTask, onAddTask, tasks = [], onLoadTasks }) => {
  const [showTasks, setShowTasks] = useState(false);

  const handleToggleTasks = () => {
    setShowTasks(!showTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'review': return 'text-purple-400';
      case 'todo': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };
  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      <div className="group text-left w-full rounded-2xl border border-white/10 
        bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl p-6 
        hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(88,101,242,0.4)] 
        hover:border-indigo-400/30 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-800/60
        transition-all duration-300 ease-out overflow-hidden"
      >
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-white group-hover:text-indigo-300 transition">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-gray-400/90 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl 
            bg-gradient-to-br from-indigo-500 to-purple-600 
            grid place-items-center shadow-md flex-none">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
        
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
            <span className="truncate">{new Date(project.updatedAt).toLocaleDateString("en-GB")}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 shrink-0 text-purple-400" />
            <span className="truncate">{project.members?.length ?? 0} members</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleTasks();
            }}
            className="flex-1 px-3 py-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-1"
          >
            {showTasks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showTasks ? 'Hide Tasks' : `Tasks (${tasks.length})`}
          </button>
          {onAddTask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTask();
              }}
              className="px-3 py-2 text-xs bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 text-green-300 hover:text-green-200 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow-green-500/20"
            >
              <Plus className="h-3 w-3" />
              Add Task
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject(project);
            }}
            className="px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium"
          >
            Delete
          </button>
        </div>

        {/* Tasks List */}
        {showTasks && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-2">No tasks found</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-gray-800/30 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-white line-clamp-1">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority?.toUpperCase()}
                          </span>
                          <span className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status?.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        {task.assignedTo && (
                          <p className="text-xs text-gray-400 mt-1">👤 {task.assignedTo.name}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {onEditTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded transition-colors"
                            title="Edit Task"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                        {onDeleteTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
