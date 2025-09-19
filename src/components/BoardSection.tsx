'use client';

import React, { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getGoalsByProject } from "@/services/goalService";
import { getTasksByGoal, updateTaskStatus } from "@/services/taskService";
import { 
  Clock, 
  Play, 
  TestTube, 
  CheckCircle, 
  MoreVertical, 
  Calendar, 
  User, 
  Flag,
  AlertCircle,
  Star
} from "lucide-react";

type SimpleProject = { id: number; name: string };
type SimpleGoal = { id: number; title: string };
type SimpleTask = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  status_title?: string | null;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: string;
  estimatedTime?: number;
};

const STATUS_KEYS = ["todo", "inProgress", "testing", "completed"] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  todo: "To Do",
  inProgress: "Doing",
  testing: "Testing",
  completed: "Done",
};

export default function BoardSection() {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [goals, setGoals] = useState<SimpleGoal[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [selectedGoalId, setSelectedGoalId] = useState<number | "">("");
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<SimpleTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setError(null);
      try {
        const list = await getProjects();
        const mapped = list.map((p: any) => ({ id: Number(p.id), name: p.name })) as SimpleProject[];
        setProjects(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load projects");
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const loadGoals = async () => {
      setGoals([]);
      setSelectedGoalId("");
      setTasks([]);
      if (!selectedProjectId) return;
      setError(null);
      try {
        const g = await getGoalsByProject(Number(selectedProjectId));
        const arr = Array.isArray(g) ? g : (Array.isArray((g as any)?.goals) ? (g as any).goals : []);
        const mapped = arr.map((it: any) => ({ id: Number(it.id), title: it.title })) as SimpleGoal[];
        setGoals(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load goals");
      }
    };
    loadGoals();
  }, [selectedProjectId]);

  useEffect(() => {
    const loadTasks = async () => {
      setTasks([]);
      if (!selectedGoalId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getTasksByGoal(Number(selectedGoalId));
        const t = (res as any)?.tasks ?? res;
        setTasks(Array.isArray(t) ? t : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [selectedGoalId]);

  const normalizeStatus = (s?: string | null) => String(s || "todo").toLowerCase();

  const columns = useMemo(() => {
    const map: Record<(typeof STATUS_KEYS)[number], SimpleTask[]> = {
      todo: [],
      inProgress: [],
      testing: [],
      completed: [],
    };
    for (const task of tasks) {
      const s = normalizeStatus(task.status_title || task.status);
      if (s === "in-progress" || s === "inprogress" || s === "doing" || s === "progress") map.inProgress.push(task);
      else if (s === "testing") map.testing.push(task);
      else if (s === "done" || s === "completed" || s === "complete" || s === "finished") map.completed.push(task);
      else map.todo.push(task);
    }
    return map;
  }, [tasks]);

  const handleStatusChange = async (task: SimpleTask, next: (typeof STATUS_KEYS)[number]) => {
    try {
      await updateTaskStatus(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status_title: next } : t)));
    } catch (e) {
      alert("Failed to update task status");
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: SimpleTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: (typeof STATUS_KEYS)[number]) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status_title !== targetColumn) {
      await handleStatusChange(draggedTask, targetColumn);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Utility Functions
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/30';
      default: return 'text-slate-500 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getTaskTypeIcon = (type?: string) => {
    switch (type) {
      case 'bug': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'feature': return <Star className="w-4 h-4 text-blue-400" />;
      case 'improvement': return <Flag className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="w-5 h-5 text-slate-400" />;
      case 'inProgress': return <Play className="w-5 h-5 text-blue-400" />;
      case 'testing': return <TestTube className="w-5 h-5 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="text-white">
      {/* Project and Goal Selection */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Select Project
            </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white border border-indigo-500/40 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/60 transition-all duration-300 hover:border-indigo-400/60 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 shadow-lg backdrop-blur-sm"
          >
              <option value="" className="bg-slate-800 text-slate-300">Choose a project...</option>
            {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name}</option>
            ))}
          </select>
          </div>

          {selectedProjectId && (
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Select Goal
              </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white border border-purple-500/40 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400/60 transition-all duration-300 hover:border-purple-400/60 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 shadow-lg backdrop-blur-sm"
            >
                <option value="" className="bg-slate-800 text-slate-300">Choose a goal...</option>
              {goals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-800 text-white">{g.title}</option>
              ))}
            </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
            <span className="text-slate-300">Loading tasks...</span>
          </div>
        </div>
      )}

      {selectedGoalId && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STATUS_KEYS.map((key) => {
            const getColumnGradient = (status: string) => {
              switch (status) {
                case 'todo': return 'from-slate-600/20 to-slate-700/20 border-slate-500/30';
                case 'inProgress': return 'from-blue-600/20 to-blue-700/20 border-blue-500/30';
                case 'testing': return 'from-yellow-600/20 to-yellow-700/20 border-yellow-500/30';
                case 'completed': return 'from-green-600/20 to-green-700/20 border-green-500/30';
                default: return 'from-slate-600/20 to-slate-700/20 border-slate-500/30';
              }
            };

            const getColumnAccent = (status: string) => {
              switch (status) {
                case 'todo': return 'text-slate-400';
                case 'inProgress': return 'text-blue-400';
                case 'testing': return 'text-yellow-400';
                case 'completed': return 'text-green-400';
                default: return 'text-slate-400';
              }
            };

            return (
              <div 
                key={key} 
                className={`rounded-2xl border bg-gradient-to-br ${getColumnGradient(key)} backdrop-blur-xl p-5 shadow-xl transition-all duration-300 ${
                  dragOverColumn === key ? 'ring-2 ring-indigo-500/50 scale-105' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, key)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-slate-800/50 ${getColumnAccent(key)}`}>
                      {getStatusIcon(key)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{STATUS_LABELS[key]}</div>
                      <div className="text-xs text-slate-400">Tasks in progress</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/60 text-slate-300 text-sm px-3 py-1.5 rounded-full font-bold shadow-lg">
                    {columns[key].length}
                  </div>
                </div>
                
                {/* Tasks Container */}
                <div className="space-y-4 min-h-[200px]">
                  {columns[key].map((task) => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="group bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 hover:bg-slate-700/60 hover:border-slate-500/60 hover:shadow-lg transition-all duration-300 cursor-move hover:scale-[1.02] backdrop-blur-sm"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          {getTaskTypeIcon(task.type)}
                          <div className="text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                            {task.title}
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-600/50 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <div className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
              </div>
                      )}

                      {/* Task Meta */}
              <div className="space-y-2">
                        {/* Priority Badge */}
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            <Flag className="w-3 h-3" />
                            {task.priority || 'medium'}
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <User className="w-3 h-3" />
                              {task.assignedTo}
                            </div>
                          )}
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isOverdue(task.dueDate) ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {formatDueDate(task.dueDate)}
                          </div>
                        )}

                        {/* Estimated Time */}
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime}h estimated
                          </div>
                        )}
                      </div>

                      {/* Status Dropdown */}
                      <div className="mt-3 pt-3 border-t border-slate-600/30">
                      <select
                        defaultValue={(task.status_title || task.status || 'todo') as string}
                        onChange={(e) => handleStatusChange(task, e.target.value as (typeof STATUS_KEYS)[number])}
                          className="w-full bg-gradient-to-r from-slate-800/60 to-slate-700/60 text-white border border-slate-500/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-200 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/60 shadow-md backdrop-blur-sm"
                        title="Update status"
                      >
                          <option value="todo" className="bg-slate-800 text-white">To Do</option>
                          <option value="inProgress" className="bg-slate-800 text-white">In Progress</option>
                          <option value="testing" className="bg-slate-800 text-white">Testing</option>
                          <option value="completed" className="bg-slate-800 text-white">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
                  
                  {/* Empty State */}
                {columns[key].length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                        {getStatusIcon(key)}
                      </div>
                      <div className="text-slate-400 text-sm font-medium mb-1">No tasks yet</div>
                      <div className="text-slate-500 text-xs">Drag tasks here or create new ones</div>
                    </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {!selectedGoalId && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 border border-slate-600/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-4xl">📋</div>
            </div>
            <div className="text-slate-200 text-xl font-bold mb-3">Ready to Get Organized?</div>
            <div className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Select a project and goal to start managing your tasks with our beautiful drag-and-drop board
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Drag & Drop</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Priority Indicators</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


